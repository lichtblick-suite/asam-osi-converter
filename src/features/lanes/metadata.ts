import { KeyValuePair } from "@foxglove/schemas";
import {
  Lane,
  Lane_Classification_Type,
  Lane_Classification_Subtype,
  LaneBoundary,
  LaneBoundary_Classification_Type,
  LaneBoundary_Classification_Color,
} from "@lichtblick/asam-osi-types";

export function buildLaneMetadata(lane: Lane): KeyValuePair[] {
  const metadata: KeyValuePair[] = [];

  if (lane.classification) {
    metadata.push(
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
              `(${pair.antecessor_lane_id ? pair.antecessor_lane_id.value.toString() : ""}, ${pair.successor_lane_id ? pair.successor_lane_id.value.toString() : ""})`,
          )
          .join(", "),
      },
    );
  }

  return metadata;
}

export function buildLaneBoundaryMetadata(lane_boundary: LaneBoundary): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "width",
      value: lane_boundary.boundary_line[0]?.width!.toString() ?? "0",
    },
    {
      key: "height",
      value: lane_boundary.boundary_line[0]?.height!.toString() ?? "0",
    },
  ];
  if (lane_boundary.classification) {
    metadata.push(
      {
        key: "type",
        value: LaneBoundary_Classification_Type[lane_boundary.classification.type],
      },
      {
        key: "color",
        value: LaneBoundary_Classification_Color[lane_boundary.classification.color],
      },
    );
  }
  return metadata;
}
