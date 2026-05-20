import { NumericType } from "@foxglove/schemas";
import type { PointCloud } from "@foxglove/schemas";
import {
  SensorData,
  LidarDetection,
  RadarDetection,
  Spherical3d,
} from "@lichtblick/asam-osi-types";
import {
  MessageConverterAlert,
  MessageConverterContext,
  VariableValue,
} from "@lichtblick/suite";
import { osiTimestampToTime } from "@utils/helper";
import { DeepRequired } from "ts-essentials";

import { getSensorMountingFrameId } from "@/config/frameTransformNames";

const FLOAT32_SIZE = 4;
// Per-point layout: x, y, z, intensity (4 × float32 = 16 bytes)
const POINT_STRIDE = 4 * FLOAT32_SIZE;

const POINT_CLOUD_FIELDS = [
  { name: "x", offset: 0, type: NumericType.FLOAT32 },
  { name: "y", offset: FLOAT32_SIZE, type: NumericType.FLOAT32 },
  { name: "z", offset: 2 * FLOAT32_SIZE, type: NumericType.FLOAT32 },
  { name: "intensity", offset: 3 * FLOAT32_SIZE, type: NumericType.FLOAT32 },
];

/**
 * Convert OSI spherical coordinates to cartesian.
 *
 * OSI Spherical3d: distance (m), azimuth (rad, horizontal), elevation (rad, vertical).
 * Standard spherical-to-cartesian conversion with azimuth measured from x-axis
 * in the horizontal plane and elevation measured from the horizontal plane.
 */
export function sphericalToCartesian(pos: DeepRequired<Spherical3d>): {
  x: number;
  y: number;
  z: number;
} {
  const cosEl = Math.cos(pos.elevation);
  return {
    x: pos.distance * cosEl * Math.cos(pos.azimuth),
    y: pos.distance * cosEl * Math.sin(pos.azimuth),
    z: pos.distance * Math.sin(pos.elevation),
  };
}

function hasValidPosition(
  det: LidarDetection | RadarDetection,
): det is (LidarDetection | RadarDetection) & { position: DeepRequired<Spherical3d> } {
  return (
    det.position != undefined &&
    det.position.distance != undefined &&
    det.position.distance > 0 &&
    det.position.azimuth != undefined &&
    det.position.elevation != undefined
  );
}

/** Extract intensity-like scalar from a detection. */
function getIntensity(det: LidarDetection | RadarDetection): number {
  // Lidar: use intensity (0–100%) → normalize to 0–1
  if ("intensity" in det && det.intensity != undefined) {
    return det.intensity / 100.0;
  }
  // Radar: use SNR as intensity proxy (dB, typically 0–40+)
  // Normalize to 0–1 with a practical max of 40 dB.
  if ("snr" in det && det.snr != undefined) {
    return Math.min(Math.max(det.snr / 40.0, 0), 1);
  }
  return 0.5; // default mid-range for untyped detections
}

export function buildPointCloudFromSensorData(
  osiSensorData: DeepRequired<SensorData>,
): PointCloud | undefined {
  const allDetections: Array<{ det: LidarDetection | RadarDetection }> = [];

  // Collect lidar detections
  if (osiSensorData.feature_data?.lidar_sensor) {
    for (const sensor of osiSensorData.feature_data.lidar_sensor) {
      if (sensor.detection) {
        for (const det of sensor.detection) {
          allDetections.push({ det });
        }
      }
    }
  }

  // Collect radar detections
  if (osiSensorData.feature_data?.radar_sensor) {
    for (const sensor of osiSensorData.feature_data.radar_sensor) {
      if (sensor.detection) {
        for (const det of sensor.detection) {
          allDetections.push({ det });
        }
      }
    }
  }

  // Filter to detections with valid spherical positions
  const valid = allDetections.filter((d) => hasValidPosition(d.det));
  if (valid.length === 0) {
    return undefined;
  }

  // Pack into binary buffer
  const data = new Uint8Array(valid.length * POINT_STRIDE);
  const view = new DataView(data.buffer);

  for (let i = 0; i < valid.length; i++) {
    const det = valid[i]!.det as (LidarDetection | RadarDetection) & {
      position: DeepRequired<Spherical3d>;
    };
    const cart = sphericalToCartesian(det.position);
    const intensity = getIntensity(det);
    const offset = i * POINT_STRIDE;

    view.setFloat32(offset, cart.x, true);
    view.setFloat32(offset + FLOAT32_SIZE, cart.y, true);
    view.setFloat32(offset + 2 * FLOAT32_SIZE, cart.z, true);
    view.setFloat32(offset + 3 * FLOAT32_SIZE, intensity, true);
  }

  return {
    timestamp: osiTimestampToTime(osiSensorData.timestamp),
    frame_id: getSensorMountingFrameId(osiSensorData.sensor_id),
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: 1 },
    },
    point_stride: POINT_STRIDE,
    fields: POINT_CLOUD_FIELDS,
    data,
  };
}

export const convertSensorDataToPointCloud = (
  osiSensorData: SensorData,
  _event?: unknown,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): PointCloud | undefined => {
  const emitAlert = context?.emitAlert;

  try {
    return buildPointCloudFromSensorData(osiSensorData as DeepRequired<SensorData>);
  } catch (error) {
    console.error(
      "OsiSensorDataPointCloudConverter: Error during message conversion:\n%s\nSkipping message!",
      error,
    );
    const alert: MessageConverterAlert = {
      severity: "error",
      message: "SensorData PointCloud conversion failed",
      error: error instanceof Error ? error : new Error(String(error)),
      tip: "Check if input messages contain valid feature_data with lidar or radar detections.",
    };
    emitAlert?.(alert, "sensordata-pointcloud-conversion-error");
    return undefined;
  }
};
