import {
  LinePrimitive,
  LineType,
  Color,
  Point3,
  Vector3,
  TriangleListPrimitive,
} from "@foxglove/schemas";
import {
  LaneBoundary_BoundaryPoint_Dash,
  LaneBoundary_Classification_Type,
} from "@lichtblick/asam-osi-types";

import {
  LANE_BOUNDARY_OPACITY,
  LANE_BOUNDARY_ARROWS_LENGTH,
  LANE_BOUNDARY_ARROWS_WIDTH,
} from "../../config/constants";
import { eulerToQuaternion } from "../math";

export interface MarkerPoint {
  position: Point3;
  width: number;
  height: number;
  dash?: LaneBoundary_BoundaryPoint_Dash;
}

/**
 * Converts a point list with width/height/dash parameters into a triangle list primitive.
 * This function generates a 3D representation of lines, optionally with dashes and (inverted) arrows.
 *
 * @param points - An array of LaneBoundaryPoint objects representing the points of the lane boundary.
 * @param color - The color to be used for the lane boundary.
 * @param options - An object containing options for the conversion.
 * @param options.dashed - A boolean indicating whether the lane boundary should be dashed.
 * @param options.arrows - A boolean indicating whether arrows should be added to indicate the direction of the line.
 * @param options.invertArrows - A boolean indicating whether the arrows should be pointing in the opposite position from point definition direction.
 * @returns A TriangleListPrimitive object representing the 3D lane boundary.
 */
export function pointListToTriangleListPrimitive(
  points: MarkerPoint[],
  color: Color,
  { dashed, arrows, invertArrows }: { dashed: boolean; arrows: boolean; invertArrows: boolean },
): TriangleListPrimitive {
  const vertices: Point3[] = [];
  const colors: Color[] = [];

  let dashSectionFlag = true; // starts with a dash by default if not defined otherwise in 'dash' property of a boundary point
  let currentColor = color; // opacity ('a' value) of the color alternates for dashed lines
  let previousSectionWasExtrudedFlag = false; // flag is used to access the correct vertices from previous section
  let hasPreviousSectionVertices = false;
  // Cache "second point" vertices from the last valid section so the next valid section can
  // start from exactly the same edge. This keeps mesh continuity even when zero-length
  // sections are skipped (to avoid NaN normals) and avoids relying on indexing into the
  // already-emitted vertex buffer.
  let previousBottomLeft2: Point3 | undefined;
  let previousBottomRight2: Point3 | undefined;
  let previousTopLeft2: Point3 | undefined;
  let previousTopRight2: Point3 | undefined;

  // Add vertices and colors for each lane boundary section between the current and next boundary point
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!.position;
    const p2 = points[i + 1]!.position;
    const w1 = points[i]!.width;
    const w2 = points[i + 1]!.width;
    const h1 = points[i]!.height;
    const h2 = points[i + 1]!.height;

    // Consume explicit dash state before rendering decisions, even for zero-length segments.
    const dashProperty = points[i]!.dash;
    const hasExplicitDashProperty =
      dashProperty === LaneBoundary_BoundaryPoint_Dash.GAP ||
      dashProperty === LaneBoundary_BoundaryPoint_Dash.END ||
      dashProperty === LaneBoundary_BoundaryPoint_Dash.START ||
      dashProperty === LaneBoundary_BoundaryPoint_Dash.CONTINUE;
    if (dashed) {
      if (
        dashProperty === LaneBoundary_BoundaryPoint_Dash.GAP ||
        dashProperty === LaneBoundary_BoundaryPoint_Dash.END
      ) {
        dashSectionFlag = false;
      } else if (
        dashProperty === LaneBoundary_BoundaryPoint_Dash.START ||
        dashProperty === LaneBoundary_BoundaryPoint_Dash.CONTINUE
      ) {
        dashSectionFlag = true;
      }
    }

    // Calculate the normal vector of the lane boundary
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance === 0) {
      continue;
    }

    if (dashed) {
      currentColor = dashSectionFlag
        ? color
        : { ...color, a: LANE_BOUNDARY_OPACITY[LaneBoundary_Classification_Type.NO_LINE] };
      if (!hasExplicitDashProperty) {
        dashSectionFlag = !dashSectionFlag; // alternate only for implicit fallback on real segments
      }
    }

    const nx = dy / distance;
    const ny = -dx / distance;

    // Calculate top and bottom vertices for first boundary point of the lane boundary section
    let bottomLeft1 = undefined;
    let bottomRight1 = undefined;
    let topLeft1 = undefined;
    let topRight1 = undefined;
    if (!hasPreviousSectionVertices) {
      // Do only for first valid lane boundary section otherwise use vertices from previous section
      // Note: Normal vector is perpendicular to the z-axis as OSI does not define any orientation of the lane boundary width/height
      bottomLeft1 = {
        x: p1.x + nx * (w1 / 2),
        y: p1.y + ny * (w1 / 2),
        z: p1.z,
      };
      bottomRight1 = {
        x: p1.x - nx * (w1 / 2),
        y: p1.y - ny * (w1 / 2),
        z: p1.z,
      };
      topLeft1 = {
        x: p1.x + nx * (w1 / 2),
        y: p1.y + ny * (w1 / 2),
        z: p1.z + h1,
      };
      topRight1 = {
        x: p1.x - nx * (w1 / 2),
        y: p1.y - ny * (w1 / 2),
        z: p1.z + h1,
      };

      // Add front surface
      if (h1 > 0 && h2 > 0) {
        vertices.push(bottomLeft1);
        vertices.push(bottomRight1);
        vertices.push(topLeft1);
        vertices.push(bottomRight1);
        vertices.push(topLeft1);
        vertices.push(topRight1);
        for (let j = 0; j < 6; j++) {
          colors.push(currentColor);
        }
      }
    } else {
      // Assign vertices from previous section as first four vertices of the current section
      if (
        previousSectionWasExtrudedFlag &&
        previousBottomLeft2 &&
        previousBottomRight2 &&
        previousTopLeft2 &&
        previousTopRight2
      ) {
        bottomLeft1 = previousBottomLeft2;
        bottomRight1 = previousBottomRight2;
        topLeft1 = previousTopLeft2;
        topRight1 = previousTopRight2;
      } else if (previousBottomLeft2 && previousBottomRight2) {
        bottomLeft1 = previousBottomLeft2;
        bottomRight1 = previousBottomRight2;
        topLeft1 = previousBottomLeft2; // will only be used when current section is extruded again
        topRight1 = previousBottomRight2; // will only be used when current section is extruded again
      } else {
        // Fallback for inconsistent state: reinitialize from current point and normal.
        bottomLeft1 = {
          x: p1.x + nx * (w1 / 2),
          y: p1.y + ny * (w1 / 2),
          z: p1.z,
        };
        bottomRight1 = {
          x: p1.x - nx * (w1 / 2),
          y: p1.y - ny * (w1 / 2),
          z: p1.z,
        };
        topLeft1 = {
          x: p1.x + nx * (w1 / 2),
          y: p1.y + ny * (w1 / 2),
          z: p1.z + h1,
        };
        topRight1 = {
          x: p1.x - nx * (w1 / 2),
          y: p1.y - ny * (w1 / 2),
          z: p1.z + h1,
        };
      }
    }

    // Calculate top and bottom vertices for second boundary point of the lane boundary section
    const bottomLeft2 = {
      x: p2.x + nx * (w2 / 2),
      y: p2.y + ny * (w2 / 2),
      z: p2.z,
    };
    const bottomRight2 = {
      x: p2.x - nx * (w2 / 2),
      y: p2.y - ny * (w2 / 2),
      z: p2.z,
    };
    const topLeft2 = {
      x: p2.x + nx * (w2 / 2),
      y: p2.y + ny * (w2 / 2),
      z: p2.z + h2,
    };
    const topRight2 = {
      x: p2.x - nx * (w2 / 2),
      y: p2.y - ny * (w2 / 2),
      z: p2.z + h2,
    };

    // Add arrow for each boundary point to indicate the direction of the line
    if (arrows) {
      let yaw = Math.atan2(dy, dx);
      if (invertArrows) {
        yaw = yaw + Math.PI;
      }
      appendArrowVerticesAndColors(
        vertices,
        colors,
        color,
        p1,
        yaw,
        LANE_BOUNDARY_ARROWS_LENGTH,
        LANE_BOUNDARY_ARROWS_WIDTH,
      );
    }

    // Add left/right/top surfaces and corresponding colors only if extruded
    if (h1 > 0 && h2 > 0) {
      // Left surface
      previousSectionWasExtrudedFlag = true;
      vertices.push(bottomRight1);
      vertices.push(topRight1);
      vertices.push(topRight2);
      vertices.push(bottomRight1);
      vertices.push(bottomRight2);
      vertices.push(topRight2);
      for (let j = 0; j < 6; j++) {
        colors.push(currentColor);
      }

      // Right surface
      vertices.push(bottomLeft1);
      vertices.push(topLeft1);
      vertices.push(topLeft2);
      vertices.push(bottomLeft1);
      vertices.push(bottomLeft2);
      vertices.push(topLeft2);
      for (let j = 0; j < 6; j++) {
        colors.push(currentColor);
      }

      // Top surface
      vertices.push(topLeft1);
      vertices.push(topRight1);
      vertices.push(topLeft2);
      vertices.push(topRight1);
      vertices.push(topLeft2);
      vertices.push(topRight2);
      for (let j = 0; j < 6; j++) {
        colors.push(currentColor);
      }

      // Add "end" surface for last lane boundary section to close the 3d polygon
      if (i === points.length - 2) {
        vertices.push(bottomLeft2);
        vertices.push(bottomRight2);
        vertices.push(topLeft2);
        vertices.push(bottomRight2);
        vertices.push(topLeft2);
        vertices.push(topRight2);
        for (let j = 0; j < 6; j++) {
          colors.push(currentColor);
        }
      }
    } else {
      previousSectionWasExtrudedFlag = false;
    }

    previousBottomLeft2 = bottomLeft2;
    previousBottomRight2 = bottomRight2;
    previousTopLeft2 = topLeft2;
    previousTopRight2 = topRight2;
    hasPreviousSectionVertices = true;

    // Add bottom surface and corresponding colors (also for non-extruded/0-height sections)
    vertices.push(bottomLeft1);
    vertices.push(bottomRight1);
    vertices.push(bottomLeft2);
    vertices.push(bottomRight1);
    vertices.push(bottomLeft2);
    vertices.push(bottomRight2);
    for (let j = 0; j < 6; j++) {
      colors.push(currentColor);
    }
  }
  return {
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: eulerToQuaternion(0, 0, 0),
    },
    points: vertices,
    color,
    colors,
    indices: [],
  };
}

/**
 * Creates vertices (and color objects) for a simple triangle arrow pointing in the direction of the yaw angle at the given position and appends it to the vertices/colors parameter.
 *
 * @param vertices - The list of vertices to which the arrow vertices are added.
 * @param colors - The list of colors to which the arrow colors are added.
 * @param color - The color of the arrow.
 * @param position - The position that the arrow points at.
 * @param yaw - The yaw angle of the arrow.
 * @param arrowheadLength - The length of the arrowhead.
 * @param arrowheadWidth - The width of the arrowhead.
 * @returns No return value; the arrow vertices and colors are added to the given lists (vertices, colors).
 */
function appendArrowVerticesAndColors(
  vertices: Point3[],
  colors: Color[],
  color: Color,
  position: Point3,
  yaw: number,
  arrowheadLength = 0.3,
  arrowheadWidth = 0.2,
) {
  // Calculate the direction vector based on the yaw angle
  // Note: Does not yet consider pitch or roll, meaning the arrow will always be perpendicular to the xy-plane.
  const directionX = Math.cos(yaw);
  const directionY = Math.sin(yaw);

  const base: Point3 = { x: position.x, y: position.y, z: position.z };

  const leftHead: Point3 = {
    x: base.x - arrowheadLength * directionX - arrowheadWidth * directionY,
    y: base.y - arrowheadLength * directionY + arrowheadWidth * directionX,
    z: position.z,
  };
  const rightHead: Point3 = {
    x: base.x - arrowheadLength * directionX + arrowheadWidth * directionY,
    y: base.y - arrowheadLength * directionY - arrowheadWidth * directionX,
    z: position.z,
  };

  vertices.push(base, leftHead, rightHead);
  for (let j = 0; j < 3; j++) {
    colors.push(color);
  }
}

function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Creates an offset line from the original boundary line by applying a specified operation (add or subtract) and offset.
 * To calculate the offset a normal vector perpendicular to the line orientation is used.
 * This function generates a new list of points that are offset from the original boundary line.
 *
 * @param originalBoundaryLine - An array of LaneBoundaryPoint objects representing the original boundary line.
 * @param operation - The passed function is used to calculate the normal vector perpendicular to the line orientation. ('add' is used for offset to the left, 'subtract' for offset to the right)
 * @param offset - Optional offset distance to be applied to the original boundary line. If not given, half of the width of each boundary point is used.
 * @returns An array of Point3 objects representing the offset boundary line.
 */
function createOffsetLine(
  originalBoundaryLine: MarkerPoint[],
  operation: (a: number, b: number) => number,
  offset?: number,
): Point3[] {
  const offsetBoundaryLine: Point3[] = [];
  let nx: number | undefined;
  let ny: number | undefined;
  let offsetValue: number;
  for (let i = 0; i < originalBoundaryLine.length; i++) {
    if (offset == undefined) {
      offsetValue = originalBoundaryLine[i]!.width / 2;
    } else {
      offsetValue = offset;
    }
    const p1 = originalBoundaryLine[i]!.position;
    if (i < originalBoundaryLine.length - 1) {
      const p2 = originalBoundaryLine[i + 1]!.position;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance === 0) {
        // two identical boundary points; add point without offset (should not happen because duplicates are removed beforehand)
        offsetBoundaryLine.push(originalBoundaryLine[i]!.position);
        continue;
      }
      nx = dy / distance;
      ny = -dx / distance;
    }

    if (nx != undefined && ny != undefined) {
      const offsetPoint: Point3 = {
        x: operation(p1.x, nx * offsetValue),
        y: operation(p1.y, ny * offsetValue),
        z: p1.z, // Normal vector is perpendicular to the z-axis as OSI does not define any orientation of the lane boundary width/height
      };
      offsetBoundaryLine.push(offsetPoint);
    }
  }
  return offsetBoundaryLine;
}

export function laneToTriangleListPrimitive(
  leftLaneBoundaries: MarkerPoint[][],
  rightLaneBoundaries: MarkerPoint[][],
  color: Color,
  laneWidth: number,
): TriangleListPrimitive {
  try {
    const vertices: Point3[] = [];
    const colors: Color[] = [];

    const appendLaneSideTriangles = (
      boundaries: MarkerPoint[][],
      operation: (a: number, b: number) => number,
    ) => {
      for (const boundary of boundaries) {
        // De-duplicate within each segment only. Do not merge segments, as
        // that can introduce long artificial jump edges between boundaries.
        const seen = new Set<string>();
        const deduplicatedBoundary: MarkerPoint[] = [];
        for (const point of boundary) {
          const key =
            String(point.position.x) +
            "," +
            String(point.position.y) +
            "," +
            String(point.position.z);
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedBoundary.push(point);
          }
        }

        if (deduplicatedBoundary.length < 2) {
          continue;
        }

        const boundaryEdge = createOffsetLine(deduplicatedBoundary, operation);
        const offsetBoundary = createOffsetLine(deduplicatedBoundary, operation, laneWidth);
        if (boundaryEdge.length !== offsetBoundary.length) {
          throw new Error(
            "The length of offset point list does not equal the length of boundary point list",
          );
        }

        for (let i = 0; i < boundaryEdge.length - 1; i++) {
          const p1 = boundaryEdge[i]!;
          const p2 = boundaryEdge[i + 1]!;
          const op1 = offsetBoundary[i]!;
          const op2 = offsetBoundary[i + 1]!;

          vertices.push(p1);
          colors.push(color);
          vertices.push(p2);
          colors.push(color);
          vertices.push(op1);
          colors.push({ r: color.r, g: color.g, b: color.b, a: 0 }); // create transparency gradient towards the offset line
          vertices.push(p2);
          colors.push(color);
          vertices.push(op1);
          colors.push({ r: color.r, g: color.g, b: color.b, a: 0 });
          vertices.push(op2);
          colors.push({ r: color.r, g: color.g, b: color.b, a: 0 });
        }
      }
    };

    appendLaneSideTriangles(leftLaneBoundaries, add);
    appendLaneSideTriangles(rightLaneBoundaries, subtract);

    return {
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: eulerToQuaternion(0, 0, 0),
      },
      points: vertices,
      color, // 'colors' is used instead of 'color' if both are given
      colors,
      indices: [],
    };
  } catch (e) {
    console.error(e);
    return {
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: eulerToQuaternion(0, 0, 0),
      },
      points: [],
      color: { r: 0, g: 0, b: 0, a: 0 },
      colors: [],
      indices: [],
    };
  }
}

export function pointListToLinePrimitive(
  points: Point3[],
  thickness: number,
  color: Color,
): LinePrimitive {
  return {
    type: LineType.LINE_STRIP,
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: eulerToQuaternion(0, 0, 0),
    },
    thickness,
    scale_invariant: false,
    points: points.map((p) => {
      return { x: p.x, y: p.y, z: p.z };
    }),
    color,
    colors: [],
    indices: [],
  };
}

export function pointListToDashedLinePrimitive(
  points: Vector3[],
  length_segment: number,
  length_gap: number,
  thickness: number,
  color: Color,
): LinePrimitive {
  const new_points: Point3[] = [];
  const new_colors: Color[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    // line p1 --> p2, vector: p2-p1, linear equation: x = p1 + t * (p2-p1)
    // distance: sqrt((p2.x - p1.x)^2 + (p2.y - p1.y)^2 + (p2.z - p1.z)^2)
    const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2),
    );
    if (distance === 0) {
      continue;
    }

    let current = 0;
    let segment = true;
    while (current < distance) {
      let t = current / distance;
      let pos_x = p1.x + t * (p2.x - p1.x);
      let pos_y = p1.y + t * (p2.y - p1.y);
      let pos_z = p1.z + t * (p2.z - p1.z);

      const point1 = { x: pos_x, y: pos_y, z: pos_z };

      if (segment) {
        current += length_segment;
      } else {
        current += length_gap;
      }

      t = current / distance;
      pos_x = p1.x + t * (p2.x - p1.x);
      pos_y = p1.y + t * (p2.y - p1.y);
      pos_z = p1.z + t * (p2.z - p1.z);

      let point2 = { x: pos_x, y: pos_y, z: pos_z };

      if (t > 1) {
        point2 = { x: p2.x, y: p2.y, z: p2.z };
      }

      // line from point1 to point2
      new_points.push(point1);
      new_points.push(point2);
      if (segment) {
        new_colors.push(color);
        new_colors.push(color);
      } else {
        new_colors.push({ r: 1, g: 1, b: 1, a: 0 });
        new_colors.push({ r: 1, g: 1, b: 1, a: 0 });
      }

      segment = !segment;
    }
  }

  return {
    type: LineType.LINE_STRIP,
    pose: {
      position: { x: 0, y: 0, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: -10 },
    },
    thickness,
    scale_invariant: false,
    points: new_points,
    color: { r: 0, g: 0, b: 0, a: 0 },
    colors: new_colors,
    indices: [],
  } as LinePrimitive;
}
