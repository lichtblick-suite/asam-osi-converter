import { Point3 } from "@foxglove/schemas";
import { RoadMarking, TrafficSign_MainSign_Classification_Type } from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { pointListToTriangleListPrimitive } from "@utils/primitives/lines";
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

  const roadMarkingPoints = [
    {
      position: {
        x: roadMarking.base.position.x,
        y: roadMarking.base.position.y,
        z: roadMarking.base.position.z,
      } as Point3,
      width: roadMarking.base.dimension.width,
      height: roadMarking.base.dimension.height,
    },
    {
      position: {
        x: roadMarking.base.position.x + roadMarking.base.dimension.length,
        y: roadMarking.base.position.y,
        z: roadMarking.base.position.z,
      } as Point3,
      width: roadMarking.base.dimension.width,
      height: roadMarking.base.dimension.height,
    },
  ];

  // Define color and opacity based on OSI classification
  const rgb = ROAD_MARKING_COLOR[roadMarking.classification.monochrome_color];
  const color = { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };

  // Set option for dashed lines
  const options = {
    dashed: false,
    arrows: false,
    invertArrows: false,
  };

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, roadMarking.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [pointListToTriangleListPrimitive(roadMarkingPoints, color, options)],
    metadata: buildRoadMarkingMetadata(roadMarking),
  };
}
