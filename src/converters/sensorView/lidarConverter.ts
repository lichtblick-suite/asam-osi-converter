import type { PointCloud } from "@foxglove/schemas";
import { NumericType } from "@foxglove/schemas";
import type { LidarSensorView, SensorView } from "@lichtblick/asam-osi-types";
import type {
  Immutable,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";

import { lidarFrameId, sensorViewTimestamp } from "./imageConverter";

const SPEED_OF_LIGHT_M_PER_S = 299_792_458;

function emitWarning(
  context: MessageConverterContext | undefined,
  alertId: string,
  message: string,
  tip: string,
): void {
  context?.emitAlert({ severity: "warn", message, tip }, alertId);
}

function selectLidarView(
  message: SensorView,
  context: MessageConverterContext | undefined,
): LidarSensorView | undefined {
  const views = message.lidar_sensor_view ?? [];
  if (views.length === 0) {
    emitWarning(
      context,
      "sensorview-pointcloud-missing-lidar-view",
      "SensorView has no lidar_sensor_view",
      "Populate one LiDAR view per SensorView topic.",
    );
    return undefined;
  }
  if (views.length > 1) {
    context?.emitAlert(
      {
        severity: "info",
        message: "SensorView contains multiple LiDAR views; displaying the first view",
        tip: "Use one LiDAR view per topic to display every point cloud independently.",
      },
      "sensorview-pointcloud-multiple-lidar-views",
    );
  }
  return views[0];
}

function finite(value: number | undefined): value is number {
  return value != undefined && Number.isFinite(value);
}

/**
 * Convert OSI LiDAR ray reflections to the native Lichtblick PointCloud schema.
 *
 * OSI stores each hit as a ray direction and a time of flight rather than XYZ.
 * CARLA records one-way hit distance, while the publisher encodes the
 * emitted-plus-returned travel time, so the point distance is tof*c/2.
 */
export function convertSensorViewToPointCloud(
  message: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): PointCloud | undefined {
  const timestamp = sensorViewTimestamp(message);
  if (timestamp == undefined) {
    emitWarning(
      context,
      "sensorview-pointcloud-missing-timestamp",
      "SensorView LiDAR data has no valid timestamp",
      "Populate SensorView.timestamp before converting LiDAR data.",
    );
    return undefined;
  }

  const lidarView = selectLidarView(message, context);
  const configuration = lidarView?.view_configuration;
  if (lidarView == undefined || configuration == undefined) {
    emitWarning(
      context,
      "sensorview-pointcloud-missing-configuration",
      "LiDAR SensorView has no view_configuration",
      "Populate LiDAR directions and timing configuration.",
    );
    return undefined;
  }

  const directions = configuration.directions ?? [];
  const reflections = lidarView.reflection ?? [];
  if (reflections.length === 0) {
    return {
      timestamp,
      frame_id: lidarFrameId(event.topic),
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
      point_stride: 16,
      fields: [
        { name: "x", offset: 0, type: NumericType.FLOAT32 },
        { name: "y", offset: 4, type: NumericType.FLOAT32 },
        { name: "z", offset: 8, type: NumericType.FLOAT32 },
        { name: "intensity", offset: 12, type: NumericType.FLOAT32 },
      ],
      data: new Uint8Array(),
    };
  }

  const values: number[] = [];
  for (let index = 0; index < reflections.length; index++) {
    const direction = directions[index];
    const reflection = reflections[index];
    if (
      reflection == undefined ||
      direction == undefined ||
      !finite(reflection.time_of_flight) ||
      !finite(direction.x) ||
      !finite(direction.y) ||
      !finite(direction.z) ||
      reflection.time_of_flight <= 0
    ) {
      continue;
    }
    const timeOfFlight = reflection.time_of_flight;
    const distance = (timeOfFlight * SPEED_OF_LIGHT_M_PER_S) / 2;
    if (!Number.isFinite(distance) || distance <= 0) {
      continue;
    }
    values.push(
      direction.x * distance,
      direction.y * distance,
      direction.z * distance,
      finite(reflection.signal_strength) ? reflection.signal_strength : 0,
    );
  }

  const data = new Uint8Array(values.length * 4);
  const view = new DataView(data.buffer);
  values.forEach((value, index) => {
    view.setFloat32(index * 4, value, true);
  });

  return {
    timestamp,
    frame_id: lidarFrameId(event.topic),
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: 1 },
    },
    point_stride: 16,
    fields: [
      { name: "x", offset: 0, type: NumericType.FLOAT32 },
      { name: "y", offset: 4, type: NumericType.FLOAT32 },
      { name: "z", offset: 8, type: NumericType.FLOAT32 },
      { name: "intensity", offset: 12, type: NumericType.FLOAT32 },
    ],
    data,
  };
}
