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

  // OSI road marking coordinate system (differs from vehicles/stationary objects):
  //   local x-axis = surface normal (upward from ground)
  //   local y-axis = lateral
  //   local z-axis = driving direction (bottom-to-top of marking image)
  //
  // Per OSI Dimension3d, dimensions follow the local frame:
  //   length = along local x = protrusion from ground (very small, ~mm)
  //   width  = along local y = lateral extent
  //   height = along local z = extent in driving direction
  //
  // The orientation (roll, pitch, yaw) encodes the rotation from global to
  // this local frame. objectToCubePrimitive uses the same (roll, pitch, yaw,
  // width, length, height) argument pattern as all other OSI objects — the
  // quaternion rotation handles making the local axes point correctly in
  // the global frame. No dimension swapping is needed.
  //
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
