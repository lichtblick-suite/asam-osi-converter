import { NumericType } from "@foxglove/schemas";
import type { PointCloud } from "@foxglove/schemas";
import type { SensorData } from "@lichtblick/asam-osi-types";
import type {
  Immutable,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";

import { sensorDataRadarFrameId } from "@/config/frameTransformNames";
import { sensorViewTimestamp } from "@/converters/sensorView/imageConverter";

function finite(value: number | undefined): value is number {
  return value != undefined && Number.isFinite(value);
}

/** Convert the first radar's detections to a cloud in its physical sensor frame. */
export function convertSensorDataToPointCloud(
  message: SensorData,
  event?: Immutable<MessageEvent<SensorData>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): PointCloud | undefined {
  const timestamp = sensorViewTimestamp(message);
  if (timestamp == undefined) {
    context?.emitAlert(
      {
        severity: "warn",
        message: "SensorData radar detections have no valid timestamp",
        tip: "Populate SensorData.timestamp before converting radar detections.",
      },
      "sensordata-pointcloud-missing-timestamp",
    );
    return undefined;
  }

  const radars = message.feature_data?.radar_sensor ?? [];
  if (radars.length > 1) {
    context?.emitAlert(
      {
        severity: "info",
        message: "SensorData contains multiple radars; displaying radar 0",
        tip: "Use one radar per SensorData topic to display each point cloud independently.",
      },
      "sensordata-pointcloud-multiple-radars",
    );
  }
  const values: number[] = [];
  for (const detection of radars[0]?.detection ?? []) {
    const distance = detection.position?.distance;
    const azimuth = detection.position?.azimuth ?? 0;
    const elevation = detection.position?.elevation ?? 0;
    if (!finite(distance) || distance < 0 || !finite(azimuth) || !finite(elevation)) {
      continue;
    }
    const horizontalDistance = distance * Math.cos(elevation);
    // OSI identifiers are uint64 values and may be represented as bigint by
    // some decoders. PointCloud currently has no uint64 field, so normalize
    // the value before writing the UINT32 field and preserve cloud conversion
    // even when the identifier is absent or malformed.
    const objectId = Number(detection.object_id?.value ?? 0);
    values.push(
      horizontalDistance * Math.cos(azimuth),
      horizontalDistance * Math.sin(azimuth),
      distance * Math.sin(elevation),
      finite(detection.radial_velocity) ? detection.radial_velocity : 0,
      finite(detection.rcs) ? detection.rcs : 0,
      finite(detection.snr) ? detection.snr : 0,
      Number.isFinite(objectId) ? objectId : 0,
    );
  }

  const data = new Uint8Array(values.length * 4);
  const view = new DataView(data.buffer);
  values.forEach((value, index) => {
    const offset = index * 4;
    if (index % 7 === 6) {
      view.setUint32(offset, value, true);
    } else {
      view.setFloat32(offset, value, true);
    }
  });

  return {
    timestamp,
    frame_id: sensorDataRadarFrameId(event?.topic),
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: 1 },
    },
    point_stride: 28,
    fields: [
      { name: "x", offset: 0, type: NumericType.FLOAT32 },
      { name: "y", offset: 4, type: NumericType.FLOAT32 },
      { name: "z", offset: 8, type: NumericType.FLOAT32 },
      { name: "radial_velocity", offset: 12, type: NumericType.FLOAT32 },
      { name: "rcs", offset: 16, type: NumericType.FLOAT32 },
      { name: "snr", offset: 20, type: NumericType.FLOAT32 },
      { name: "object_id", offset: 24, type: NumericType.UINT32 },
    ],
    data,
  };
}
