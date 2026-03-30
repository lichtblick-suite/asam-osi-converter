import { GroundTruthPanelSettings } from "@converters";
import { ArrowPrimitive, CubePrimitive } from "@foxglove/schemas";
import { RoadMarking, TrafficSign_MainSign_Classification_Type } from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { eulerToQuaternion, quaternionMultiplication } from "@utils/math";
import { buildAxesAtPose } from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { buildRoadMarkingMetadata } from "./metadata";

import { ROAD_MARKING_COLOR } from "@/config/constants";

const ROAD_MARKING_FRAME_CORRECTION = quaternionMultiplication(
  eulerToQuaternion(0, -Math.PI / 2, 0), // rotate -90° around local Y
  eulerToQuaternion(Math.PI, 0, 0), // then rotate 180° around local X
);

function buildRoadMarkingCube(roadMarking: DeepRequired<RoadMarking>): CubePrimitive {
  const pos = roadMarking.base.position;
  const ori = roadMarking.base.orientation;
  const dim = roadMarking.base.dimension;
  const baseOrientation = eulerToQuaternion(ori.roll, ori.pitch, ori.yaw);
  const correctedOrientation = quaternionMultiplication(
    baseOrientation,
    ROAD_MARKING_FRAME_CORRECTION,
  );

  return {
    pose: {
      position: { x: pos.x, y: pos.y, z: pos.z },
      orientation: correctedOrientation,
    },
    size: {
      x: dim.length,
      y: dim.width,
      z: dim.height,
    },
    color: { ...ROAD_MARKING_COLOR[roadMarking.classification.monochrome_color], a: 1 },
  };
}

export function buildRoadMarkingEntity(
  roadMarking: DeepRequired<RoadMarking>,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
): PartialSceneEntity | undefined {
  if (
    roadMarking.classification.traffic_main_sign_type !==
    TrafficSign_MainSign_Classification_Type.STOP
  ) {
    return undefined;
  }

  // RoadMarking uses a different local-frame definition than generic BaseStationary:
  // local x is surface normal, local z is "image top". We rotate by +90 deg around
  // local y so rendered axes remain right-handed and align with object primitives.
  const cube = buildRoadMarkingCube(roadMarking);

  function buildAxes(): ArrowPrimitive[] {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return buildAxesAtPose(cube.pose.position, cube.pose.orientation);
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, roadMarking.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: [cube],
    arrows: buildAxes(),
    metadata: buildRoadMarkingMetadata(roadMarking),
  };
}
