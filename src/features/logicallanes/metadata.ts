import { KeyValuePair } from "@foxglove/schemas";
import {
  LogicalLane,
  LogicalLane_Type,
  LogicalLane_MoveDirection,
  LogicalLaneBoundary,
  LogicalLaneBoundary_PassingRule,
} from "@lichtblick/asam-osi-types";

export function buildLogicalLaneMetadata(logical_lane: LogicalLane): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: LogicalLane_Type[logical_lane.type],
    },
    {
      key: "physical_lane_reference_ids",
      value: logical_lane.physical_lane_reference
        .map((reference) => reference.physical_lane_id?.value)
        .join(", "),
    },
    {
      key: "reference_line_id",
      value: logical_lane.reference_line_id?.value.toString() ?? "",
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
      value: logical_lane.right_adjacent_lane.map((id) => id.other_lane_id?.value).join(", "),
    },
    {
      key: "left_adjacent_lane_ids",
      value: logical_lane.left_adjacent_lane.map((id) => id.other_lane_id?.value).join(", "),
    },
    {
      key: "overlapping_lane_ids",
      value: logical_lane.overlapping_lane.map((id) => id.other_lane_id?.value).join(", "),
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
      value: logical_lane.predecessor_lane.map((id) => id.other_lane_id?.value).join(", "),
    },
    {
      key: "successor_lane_ids",
      value: logical_lane.successor_lane.map((id) => id.other_lane_id?.value).join(", "),
    },
  ];

  return metadata;
}

export function buildLogicalLaneBoundaryMetadata(
  logical_lane_boundary: LogicalLaneBoundary,
): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
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

  if (logical_lane_boundary.reference_line_id) {
    metadata.push({
      key: "reference_line_id",
      value: logical_lane_boundary.reference_line_id.value.toString(),
    });
  }

  return metadata;
}
