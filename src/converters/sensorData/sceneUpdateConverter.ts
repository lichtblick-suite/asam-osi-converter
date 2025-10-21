import { Point3, LinePrimitive, LineType, TextPrimitive, SceneUpdate } from "@foxglove/schemas";
import {
  SensorData,
  LaneBoundary_BoundaryPoint,
  DetectedLaneBoundary,
} from "@lichtblick/asam-osi-types";
import { ColorCode } from "@utils/helper";
import { PartialSceneEntity } from "@utils/scene";
import { DeepRequired, DeepPartial } from "ts-essentials";

import { OSI_EGO_VEHICLE_REAR_AXLE_FRAME, OSI_GLOBAL_FRAME } from "@/config/frameTransformNames";

export function buildSensorDataSceneEntities(
  osiSensorData: DeepRequired<SensorData>,
): PartialSceneEntity[] {
  const ToPoint3 = (boundary: DeepRequired<LaneBoundary_BoundaryPoint>): Point3 => {
    return { x: boundary.position.x, y: boundary.position.y, z: 0 };
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

  const makeInfoText = (): DeepPartial<TextPrimitive> => {
    return {
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: -10 },
      },
      billboard: true,
      font_size: 30,
      scale_invariant: true,
      color: ColorCode("green", 1),
      text: "SensorData not supported yet",
    };
  };

  const road_output_scene_update: PartialSceneEntity = {
    timestamp: { sec: osiSensorData.timestamp.seconds, nsec: osiSensorData.timestamp.nanos },
    frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
    id: OSI_GLOBAL_FRAME,
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    lines: makePrimitiveLines(osiSensorData.lane_boundary, 1.0),
    texts: [makeInfoText()],
  };
  return [road_output_scene_update];
}

export const convertSensorDataToSceneUpdate = (
  osiSensorData: SensorData,
): DeepPartial<SceneUpdate> => {
  let sceneEntities: PartialSceneEntity[] = [];

  try {
    sceneEntities = buildSensorDataSceneEntities(osiSensorData as DeepRequired<SensorData>);
  } catch (error) {
    console.error(
      "OsiSensorDataVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
  }
  return {
    deletions: [],
    entities: sceneEntities,
  };
};
