import { GroundTruthPanelSettings } from "@converters";
import { ArrowPrimitive, Color, CubePrimitive } from "@foxglove/schemas";
import {
  RoadMarking,
  RoadMarking_Classification_Type,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { eulerToQuaternion, pointRotationByQuaternion } from "@utils/math";
import { buildObjectAxes, objectToCubePrimitive } from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { buildRoadMarkingMetadata } from "./metadata";

import {
  ROAD_MARKING_COLOR,
  ZEBRA_CROSSING_STRIPE_GAP,
  ZEBRA_CROSSING_STRIPE_WIDTH,
} from "@/config/constants";

// Road markings use BaseStationary, with position and orientation given in the global
// ground truth frame. OSI defines the road marking's local frame as: x = view normal of
// the 2D image area (normally pointing to the sky), z = 'bottom' to 'top' of the image
// (normally the driving direction), y completes the right-handed frame. Dimensions map
// as usual (x = length, y = width, z = height), so for a flat marking `length` is the
// paint thickness. Orientation and dimensions are passed through as-is; spec compliance
// is the responsibility of the trace generator.
// See: https://opensimulationinterface.github.io/osi-antora-generator/asamosi/latest/gen/structosi3_1_1RoadMarking.html

function buildSolidCube(roadMarking: DeepRequired<RoadMarking>, color: Color): CubePrimitive {
  const pos = roadMarking.base.position;
  const ori = roadMarking.base.orientation;
  const dim = roadMarking.base.dimension;
  return objectToCubePrimitive(
    pos.x,
    pos.y,
    pos.z,
    ori.roll,
    ori.pitch,
    ori.yaw,
    dim.width,
    dim.length,
    dim.height,
    color,
  );
}

/**
 * Splits the 2D image area (local y = width, local z = height) into zebra stripes.
 * Stripes run along local z (parallel to the driving direction) and repeat along local y,
 * centered on base.position.
 */
function buildZebraCrossingStripes(
  roadMarking: DeepRequired<RoadMarking>,
  color: Color,
): CubePrimitive[] {
  const pos = roadMarking.base.position;
  const ori = roadMarking.base.orientation;
  const dim = roadMarking.base.dimension;
  const orientation = eulerToQuaternion(ori.roll, ori.pitch, ori.yaw);

  const width = Number.isFinite(dim.width) ? Math.max(dim.width, 0) : 0;
  const spacing = ZEBRA_CROSSING_STRIPE_WIDTH + ZEBRA_CROSSING_STRIPE_GAP;
  const stripeCount = Math.max(1, Math.floor((width + ZEBRA_CROSSING_STRIPE_GAP) / spacing));
  const stripeWidth = Math.min(ZEBRA_CROSSING_STRIPE_WIDTH, width);
  const patternWidth = stripeCount * stripeWidth + (stripeCount - 1) * ZEBRA_CROSSING_STRIPE_GAP;

  return Array.from({ length: stripeCount }, (_, i) => {
    const offset = pointRotationByQuaternion(
      { x: 0, y: -patternWidth / 2 + stripeWidth / 2 + i * spacing, z: 0 },
      orientation,
    );
    return {
      pose: {
        position: { x: pos.x + offset.x, y: pos.y + offset.y, z: pos.z + offset.z },
        orientation,
      },
      size: { x: dim.length, y: stripeWidth, z: dim.height },
      color,
    };
  });
}

export function buildRoadMarkingEntity(
  roadMarking: DeepRequired<RoadMarking>,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
): PartialSceneEntity | undefined {
  const color = { ...ROAD_MARKING_COLOR[roadMarking.classification.monochrome_color], a: 1 };

  const mainSignType = roadMarking.classification.traffic_main_sign_type;
  let cubes: CubePrimitive[];
  if (mainSignType === TrafficSign_MainSign_Classification_Type.STOP) {
    cubes = [buildSolidCube(roadMarking, color)];
  } else if (mainSignType === TrafficSign_MainSign_Classification_Type.ZEBRA_CROSSING) {
    // Only the symbolic marking is the StVO 293 stripe pattern; e.g. a painted traffic sign
    // is a color image of StVO 350, so other types fall back to the bounding box.
    cubes =
      roadMarking.classification.type === RoadMarking_Classification_Type.SYMBOLIC_TRAFFIC_SIGN
        ? buildZebraCrossingStripes(roadMarking, color)
        : [buildSolidCube(roadMarking, color)];
  } else {
    return undefined;
  }

  function buildAxes(): ArrowPrimitive[] {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return buildObjectAxes(roadMarking);
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, roadMarking.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes,
    arrows: buildAxes(),
    metadata: buildRoadMarkingMetadata(roadMarking),
  };
}
