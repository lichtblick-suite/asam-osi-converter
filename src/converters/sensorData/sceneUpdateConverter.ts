import { Point3, LinePrimitive, LineType, SceneUpdate } from "@foxglove/schemas";
import {
  SensorData,
  LaneBoundary_BoundaryPoint,
  DetectedLaneBoundary,
} from "@lichtblick/asam-osi-types";
import {
  MessageConverterAlert,
  MessageConverterContext,
  MessageConverterEmitAlert,
  VariableValue,
} from "@lichtblick/suite";
import { ColorCode } from "@utils/helper";
import { PartialSceneEntity } from "@utils/scene";
import { DeepRequired, DeepPartial } from "ts-essentials";

import { PREFIX_DETECTED_LANE_BOUNDARIES } from "@/config/entityPrefixes";
import { OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME } from "@/config/frameTransformNames";

export function buildSensorDataSceneEntities(
  osiSensorData: DeepRequired<SensorData>,
  alertHook?: MessageConverterEmitAlert,
): PartialSceneEntity[] {
  const ToPoint3 = (boundary: DeepRequired<LaneBoundary_BoundaryPoint>): Point3 => {
    return { x: boundary.position.x, y: boundary.position.y, z: boundary.position.z };
  };
  const ToLinePrimitive = (points: Point3[], thickness: number): DeepPartial<LinePrimitive> => {
    return {
      type: LineType.LINE_STRIP,
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: -10 },
      },
      thickness,
      scale_invariant: true,
      points,
      color: ColorCode("green", 1),
      indices: [],
    };
  };

  const makeLinePrimitive = (
    lane_boundary: DeepRequired<DetectedLaneBoundary>,
    thickness: number,
  ): DeepPartial<LinePrimitive> => {
    return ToLinePrimitive(lane_boundary.boundary_line.map(ToPoint3), thickness);
  };

  const makePrimitiveLines = (
    lane_boundary: DeepRequired<DetectedLaneBoundary>[],
    thickness: number,
  ): DeepPartial<LinePrimitive>[] => {
    return lane_boundary.map((b) => makeLinePrimitive(b, thickness));
  };

  alertHook?.(
    {
      severity: "info",
      message: "SensorData conversion is in early stages",
      tip: "Currently, only lane boundaries are visualized from SensorData. More features will be added in the future.",
    },
    "sensordata-conversion-info",
  );

  const road_output_scene_update: PartialSceneEntity = {
    timestamp: { sec: osiSensorData.timestamp.seconds, nsec: osiSensorData.timestamp.nanos },
    frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
    id: PREFIX_DETECTED_LANE_BOUNDARIES,
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    lines: makePrimitiveLines(osiSensorData.lane_boundary, 1.0),
  };
  return [road_output_scene_update];
}

export const convertSensorDataToSceneUpdate = (
  osiSensorData: SensorData,
  _event?: unknown,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): DeepPartial<SceneUpdate> => {
  const emitAlert: MessageConverterEmitAlert | undefined = context?.emitAlert;
  let sceneEntities: PartialSceneEntity[] = [];

  try {
    sceneEntities = buildSensorDataSceneEntities(
      osiSensorData as DeepRequired<SensorData>,
      emitAlert,
    );
  } catch (error) {
    console.error(
      "OsiSensorDataVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
    const alert: MessageConverterAlert = {
      severity: "error",
      message: "SensorData conversion failed",
      error: error instanceof Error ? error : new Error(String(error)),
      tip: "Check if input messages match the expected OSI SensorData schema.",
    };
    emitAlert?.(alert, "sensordata-conversion-error");
  }
  return {
    deletions: [],
    entities: sceneEntities,
  };
};
