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

  // Road markings use BaseStationary, same as other objects. The orientation
  // quaternion handles whatever local-frame convention the trace author used.
  // See: https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/gen/structosi3_1_1RoadMarking.html
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
