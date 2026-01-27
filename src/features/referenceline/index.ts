import { Point3, Time } from "@foxglove/schemas";
import { ReferenceLine } from "@lichtblick/asam-osi-types";
import { MarkerPoint, pointListToTriangleListPrimitive } from "@utils/index";
import { PartialSceneEntity, generateSceneEntityId } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { REFERENCE_LINE_COLOR, REFERENCE_LINE_VISUALIZATION_WIDTH } from "@/config/constants";

export function buildReferenceLineEntity(
  osiObject: DeepRequired<ReferenceLine>,
  id_prefix: string,
  frame_id: string,
  time: Time,
): PartialSceneEntity {
  const pointList: MarkerPoint[] = osiObject.poly_line
    .filter((refLinePoint) => refLinePoint?.world_position)
    .map((p) => ({
      position: {
        x: p.world_position.x,
        y: p.world_position.y,
        z: p.world_position.z,
      } as Point3,
      width: REFERENCE_LINE_VISUALIZATION_WIDTH,
      height: 0.0,
    }));
  const options = {
    dashed: false,
    arrows: true,
    invertArrows: false,
  };
  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, osiObject.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [pointListToTriangleListPrimitive(pointList, REFERENCE_LINE_COLOR, options)],
  };
}
