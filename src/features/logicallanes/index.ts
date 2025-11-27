import { type Point3 } from "@foxglove/schemas";
import { Time } from "@foxglove/schemas/schemas/typescript/Time";
import { LogicalLane, LogicalLaneBoundary } from "@lichtblick/asam-osi-types";
import {
  pointListToTriangleListPrimitive,
  laneToTriangleListPrimitive,
  MarkerPoint,
} from "@utils/primitives/lines";
import { PartialSceneEntity, generateSceneEntityId } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { buildLogicalLaneBoundaryMetadata, buildLogicalLaneMetadata } from "./metadata";

import {
  LANE_BOUNDARY_ARROWS,
  LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH,
  LOGICAL_LANE_BOUNDARY_COLOR,
  LOGICAL_LANE_RENDERING_HEIGHT_OFFSET,
  LOGICAL_LANE_COLOR,
  LOGICAL_LANE_VISUALIZATION_WIDTH,
} from "@/config/constants";
import { PREFIX_LOGICAL_LANE, PREFIX_LOGICAL_LANE_BOUNDARY } from "@/config/entityPrefixes";

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
