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
import { objectToCubePrimitive } from "@utils/primitives/objects";
import { PartialSceneEntity } from "@utils/scene";
import { DeepRequired, DeepPartial } from "ts-essentials";

import { DETECTED_MOVING_OBJECT_COLOR } from "@/config/constants";
import {
  PREFIX_DETECTED_LANE_BOUNDARIES,
  PREFIX_DETECTED_MOVING_OBJECTS,
} from "@/config/entityPrefixes";
import { OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME } from "@/config/frameTransformNames";

export function buildSensorDataSceneEntities(
  osiSensorData: DeepRequired<SensorData>,
  alertHook?: MessageConverterEmitAlert,
): PartialSceneEntity[] {
  const sensorData: SensorData = osiSensorData;
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
      tip: "Currently, lane boundaries and moving object bounding boxes are visualized from SensorData. More features will be added in the future.",
    },
    "sensordata-conversion-info",
  );

  const road_output_scene_update: PartialSceneEntity = {
    timestamp: { sec: osiSensorData.timestamp.seconds, nsec: osiSensorData.timestamp.nanos },
    frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
    id: PREFIX_DETECTED_LANE_BOUNDARIES,
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    lines: makePrimitiveLines(
      (sensorData.lane_boundary ?? []) as DeepRequired<DetectedLaneBoundary>[],
      1.0,
    ),
  };
  const movingObjects: PartialSceneEntity = {
    timestamp: road_output_scene_update.timestamp,
    frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
    id: PREFIX_DETECTED_MOVING_OBJECTS,
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    // Replace the full set of boxes each frame, including when no objects remain.
    cubes: (sensorData.moving_object ?? []).flatMap(({ base }) => {
      if (base?.position == undefined || base.dimension == undefined) {
        return [];
      }
      return [
        objectToCubePrimitive(
          base.position.x ?? 0,
          base.position.y ?? 0,
          base.position.z ?? 0,
          base.orientation?.roll ?? 0,
          base.orientation?.pitch ?? 0,
          base.orientation?.yaw ?? 0,
          base.dimension.width ?? 0,
          base.dimension.length ?? 0,
          base.dimension.height ?? 0,
          DETECTED_MOVING_OBJECT_COLOR,
        ),
      ];
    }),
  };
  return [road_output_scene_update, movingObjects];
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
