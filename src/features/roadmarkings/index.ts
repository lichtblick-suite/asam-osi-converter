import { RoadMarking, TrafficSign_MainSign_Classification_Type } from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { objectToCubePrimitive } from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { buildRoadMarkingMetadata } from "./metadata";

import { ROAD_MARKING_COLOR } from "@/config/constants";

export function buildRoadMarkingEntity(
  roadMarking: DeepRequired<RoadMarking>,
  id_prefix: string,
  frame_id: string,
  time: Time,
): PartialSceneEntity | undefined {
  if (
    roadMarking.classification.traffic_main_sign_type !==
    TrafficSign_MainSign_Classification_Type.STOP
  ) {
    return undefined;
  }

  const pos = roadMarking.base.position;
  const ori = roadMarking.base.orientation;
  const dim = roadMarking.base.dimension;

  // OSI road marking coordinate system (different from other objects):
  //   x-axis = surface normal (upward from ground)
  //   y-axis = lateral
  //   z-axis = along driving direction
  // Per OSI Dimension3d: length = x-axis, width = y-axis, height = z-axis
  //
  // CubePrimitive size maps to the object's local axes:
  //   size.x = length (local x = protrusion from ground)
  //   size.y = width  (local y = lateral extent)
  //   size.z = height (local z = extent in driving direction)
  const cube = objectToCubePrimitive(
    pos.x,
    pos.y,
    pos.z,
    ori.roll,
    ori.pitch,
    ori.yaw,
    dim.width,
    dim.length,
    dim.height,
    { ...ROAD_MARKING_COLOR[roadMarking.classification.monochrome_color], a: 1 },
  );

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, roadMarking.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: [cube],
    metadata: buildRoadMarkingMetadata(roadMarking),
  };
}
