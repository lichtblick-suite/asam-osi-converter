import { type KeyValuePair, type Point3 } from "@foxglove/schemas";
import { Time } from "@foxglove/schemas/schemas/typescript/Time";
import {
  LogicalLane,
  LogicalLaneBoundary,
  LogicalLane_Type,
  LogicalLane_MoveDirection,
  LogicalLaneBoundary_PassingRule,
} from "@lichtblick/asam-osi-types";
import {
  pointListToTriangleListPrimitive,
  laneToTriangleListPrimitive,
  MarkerPoint,
} from "@utils/marker";
import { PartialSceneEntity, generateSceneEntityId } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import {
  LANE_BOUNDARY_ARROWS,
  LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH,
  LOGICAL_LANE_BOUNDARY_COLOR,
  LOGICAL_LANE_RENDERING_HEIGHT_OFFSET,
  LOGICAL_LANE_COLOR,
  LOGICAL_LANE_VISUALIZATION_WIDTH,
} from "../config";

export const PREFIX_LOGICAL_LANE_BOUNDARY = "logical_lane_boundary";
export const PREFIX_LOGICAL_LANE = "logical_lane";

export function buildLogicalLaneBoundaryMetadata(
  logical_lane_boundary: DeepRequired<LogicalLaneBoundary>,
): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "reference_line_id",
      value: logical_lane_boundary.reference_line_id.value.toString(),
    },
    {
      key: "physical_boundary_ids",
      value: logical_lane_boundary.physical_boundary_id
        .map((reference) => reference.value)
        .join(", "),
    },
    {
      key: "passing_rule",
      value: LogicalLaneBoundary_PassingRule[logical_lane_boundary.passing_rule],
    },
  ];

  return metadata;
}

export function buildLogicalLaneBoundaryEntity(
  osiLogicalLaneBoundary: DeepRequired<LogicalLaneBoundary>,
  frame_id: string,
  time: Time,
): PartialSceneEntity {
  // Create LaneBoundaryPoint objects using only necessary fields for rendering
  const laneBoundaryPoints = osiLogicalLaneBoundary.boundary_line.map((point) => {
    return {
      position: {
        x: point.position.x,
        y: point.position.y,
        z: point.position.z + LOGICAL_LANE_RENDERING_HEIGHT_OFFSET,
      } as Point3,
      width: LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH,
      height: 0,
    };
  });

  // Set option for dashed lines
  const options = {
    dashed: false,
    arrows: LANE_BOUNDARY_ARROWS,
    invertArrows: false,
  };

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(PREFIX_LOGICAL_LANE_BOUNDARY, osiLogicalLaneBoundary.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [
      pointListToTriangleListPrimitive(laneBoundaryPoints, LOGICAL_LANE_BOUNDARY_COLOR, options),
    ],
    metadata: buildLogicalLaneBoundaryMetadata(osiLogicalLaneBoundary),
  };
}

export function buildLogicalLaneMetadata(logical_lane: DeepRequired<LogicalLane>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: LogicalLane_Type[logical_lane.type],
    },
    {
      key: "physical_lane_reference_ids",
      value: logical_lane.physical_lane_reference
        .map((reference) => reference.physical_lane_id.value)
        .join(", "),
    },
    {
      key: "reference_line_id",
      value: logical_lane?.reference_line_id?.value?.toString() || "",
    },
    {
      key: "start_s",
      value: logical_lane.start_s.toString(),
    },
    {
      key: "end_s",
      value: logical_lane.end_s.toString(),
    },
    {
      key: "move_direction",
      value: LogicalLane_MoveDirection[logical_lane.move_direction],
    },
    {
      key: "right_adjacent_lane_ids",
      value: logical_lane.right_adjacent_lane.map((id) => id.other_lane_id.value).join(", "),
    },
    {
      key: "left_adjacent_lane_ids",
      value: logical_lane.left_adjacent_lane.map((id) => id.other_lane_id.value).join(", "),
    },
    {
      key: "overlapping_lane_ids",
      value: logical_lane.overlapping_lane.map((id) => id.other_lane_id.value).join(", "),
    },
    {
      key: "right_boundary_ids",
      value: logical_lane.right_boundary_id.map((id) => id.value).join(", "),
    },
    {
      key: "left_boundary_ids",
      value: logical_lane.left_boundary_id.map((id) => id.value).join(", "),
    },
    {
      key: "predecessor_lane_ids",
      value: logical_lane.predecessor_lane.map((id) => id.other_lane_id.value).join(", "),
    },
    {
      key: "successor_lane_ids",
      value: logical_lane.successor_lane.map((id) => id.other_lane_id.value).join(", "),
    },
  ];

  return metadata;
}

export function buildLogicalLaneEntity(
  osiLogicalLane: DeepRequired<LogicalLane>,
  frame_id: string,
  time: Time,
  osiLeftLaneBoundaries: DeepRequired<LogicalLaneBoundary>[],
  osiRightLaneBoundaries: DeepRequired<LogicalLaneBoundary>[],
): PartialSceneEntity {
  const leftLaneBoundaries: MarkerPoint[][] = [];
  for (const lb of osiLeftLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: {
          x: point.position.x,
          y: point.position.y,
          z: point.position.z + LOGICAL_LANE_RENDERING_HEIGHT_OFFSET,
        } as Point3,
        width: LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH,
        height: 0, // no need to set height for logical lanes
      };
    });
    leftLaneBoundaries.push(laneBoundaryPoints);
  }
  const rightLaneBoundaries: MarkerPoint[][] = [];
  for (const lb of osiRightLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: {
          x: point.position.x,
          y: point.position.y,
          z: point.position.z + LOGICAL_LANE_RENDERING_HEIGHT_OFFSET,
        } as Point3,
        width: LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH,
        height: 0, // no need to set height for logical lanes
      };
    });
    rightLaneBoundaries.push(laneBoundaryPoints);
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(PREFIX_LOGICAL_LANE, osiLogicalLane.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [
      laneToTriangleListPrimitive(
        leftLaneBoundaries,
        rightLaneBoundaries,
        LOGICAL_LANE_COLOR,
        LOGICAL_LANE_VISUALIZATION_WIDTH,
      ),
    ],
    metadata: buildLogicalLaneMetadata(osiLogicalLane),
  };
}
