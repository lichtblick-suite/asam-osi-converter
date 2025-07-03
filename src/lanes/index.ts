import { TriangleListPrimitive, type KeyValuePair, type Point3 } from "@foxglove/schemas";
import type { Time } from "@foxglove/schemas/dist/types/Time";
import {
  LaneBoundary,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  Lane,
  Lane_Classification_Type,
  Lane_Classification_Subtype,
} from "@lichtblick/asam-osi-types";
import {
  pointListToTriangleListPrimitive,
  laneToTriangleListPrimitive,
  MarkerPoint,
} from "@utils/marker";
import { PartialSceneEntity, generateSceneEntityId } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import {
  LANE_CENTERLINE_COLOR,
  LANE_CENTERLINE_WIDTH,
  LANE_CENTERLINE_ARROWS,
  LANE_CENTERLINE_SHOW,
  LANE_VISUALIZATION_WIDTH,
  LANE_TYPE,
  LANE_COLOR_HIGHLIGHT,
  LANE_BOUNDARY_COLOR,
  LANE_BOUNDARY_OPACITY,
  LANE_BOUNDARY_MIN_RENDERING_WIDTH,
  LANE_BOUNDARY_ARROWS,
} from "../config";

export const PREFIX_LANE = "lane";
export const PREFIX_LANE_BOUNDARY = "lane_boundary";

export function buildLaneBoundaryMetadata(
  lane_boundary: DeepRequired<LaneBoundary>,
): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: LaneBoundary_Classification_Type[lane_boundary.classification.type],
    },
    {
      key: "color",
      value: LaneBoundary_Classification_Color[lane_boundary.classification.color],
    },
    {
      key: "width",
      value: lane_boundary.boundary_line[0]?.width!.toString() ?? "0",
    },
    {
      key: "height",
      value: lane_boundary.boundary_line[0]?.height!.toString() ?? "0",
    },
  ];

  return metadata;
}

/**
 * Builds a PartialSceneEntity representing an OSI lane boundary.
 *
 * @param osiLaneBoundary - The OSI object, which can be either a MovingObject or a StationaryObject.
 * @param frame_id - The frame ID to be used for the entity.
 * @param time - The timestamp for the entity.
 * @returns A PartialSceneEntity representing the object.
 */
export function buildLaneBoundaryEntity(
  osiLaneBoundary: DeepRequired<LaneBoundary>,
  frame_id: string,
  time: Time,
): PartialSceneEntity {
  // Create LaneBoundaryPoint objects using only necessary fields for rendering
  const laneBoundaryPoints = osiLaneBoundary.boundary_line.map((point) => {
    return {
      position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
      width: point.width === 0 ? LANE_BOUNDARY_MIN_RENDERING_WIDTH : point.width, // prevent zero-width lane boundaries from being invisible
      height: point.height,
      dash: point.dash,
    };
  });

  // Define color and opacity based on OSI classification
  const rgb = LANE_BOUNDARY_COLOR[osiLaneBoundary.classification.color];
  const a = LANE_BOUNDARY_OPACITY[osiLaneBoundary.classification.type];
  const color = { r: rgb.r, g: rgb.g, b: rgb.b, a };

  // Set option for dashed lines
  const options = {
    dashed: osiLaneBoundary.classification.type === LaneBoundary_Classification_Type.DASHED_LINE,
    arrows: LANE_BOUNDARY_ARROWS,
    invertArrows: false,
  };

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(PREFIX_LANE_BOUNDARY, osiLaneBoundary.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [pointListToTriangleListPrimitive(laneBoundaryPoints, color, options)],
    metadata: buildLaneBoundaryMetadata(osiLaneBoundary),
  };
}

export function buildLaneMetadata(lane: DeepRequired<Lane>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: Lane_Classification_Type[lane.classification.type],
    },
    {
      key: "subtype",
      value: Lane_Classification_Subtype[lane.classification.subtype],
    },
    {
      key: "left_lane_boundary_ids",
      value: lane.classification.left_lane_boundary_id.map((id) => id.value).join(", "),
    },
    {
      key: "right_lane_boundary_ids",
      value: lane.classification.right_lane_boundary_id.map((id) => id.value).join(", "),
    },
    {
      key: "left_adjacent_lane_id",
      value: lane.classification.left_adjacent_lane_id.map((id) => id.value).join(", "),
    },
    {
      key: "right_adjacent_lane_id",
      value: lane.classification.right_adjacent_lane_id.map((id) => id.value).join(", "),
    },
    {
      key: "lane_pairing",
      value: lane.classification.lane_pairing
        .map(
          (pair) =>
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
            `(${pair.antecessor_lane_id ? pair.antecessor_lane_id.value : ""}, ${pair.successor_lane_id ? pair.successor_lane_id.value : ""})`,
        )
        .join(", "),
    },
  ];

  return metadata;
}

export function buildLaneEntity(
  osiLane: DeepRequired<Lane>,
  frame_id: string,
  time: Time,
  osiLeftLaneBoundaries: DeepRequired<LaneBoundary>[],
  osiRightLaneBoundaries: DeepRequired<LaneBoundary>[],
): PartialSceneEntity {
  const leftLaneBoundaries: MarkerPoint[][] = [];
  for (const lb of osiLeftLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
        width: point.width === 0 ? LANE_BOUNDARY_MIN_RENDERING_WIDTH : point.width, // prevent zero-width lane boundaries from being invisible
        height: point.height,
        dash: point.dash,
      };
    });
    leftLaneBoundaries.push(laneBoundaryPoints);
  }
  const rightLaneBoundaries: MarkerPoint[][] = [];
  for (const lb of osiRightLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
        width: point.width === 0 ? LANE_BOUNDARY_MIN_RENDERING_WIDTH : point.width, // prevent zero-width lane boundaries from being invisible
        height: point.height,
        dash: point.dash,
      };
    });
    rightLaneBoundaries.push(laneBoundaryPoints);
  }

  let centerlineTrianglePrimitive: TriangleListPrimitive | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (LANE_CENTERLINE_SHOW) {
    const centerlinePoints = osiLane.classification.centerline.map((point) => {
      return {
        position: { x: point.x, y: point.y, z: point.z } as Point3,
        width: LANE_CENTERLINE_WIDTH,
        height: 0,
      };
    });
    centerlineTrianglePrimitive = pointListToTriangleListPrimitive(
      centerlinePoints,
      LANE_CENTERLINE_COLOR,
      {
        dashed: false,
        arrows: LANE_CENTERLINE_ARROWS,
        invertArrows: !osiLane.classification.centerline_is_driving_direction,
      },
    );
  }

  let color = LANE_TYPE[osiLane.classification.type];
  if (osiLane.classification.is_host_vehicle_lane) {
    color = LANE_COLOR_HIGHLIGHT;
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(PREFIX_LANE, osiLane.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [
      laneToTriangleListPrimitive(
        leftLaneBoundaries,
        rightLaneBoundaries,
        color,
        LANE_VISUALIZATION_WIDTH,
      ),
      centerlineTrianglePrimitive,
    ],
    metadata: buildLaneMetadata(osiLane),
  };
}
