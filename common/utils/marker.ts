import {
  LinePrimitive,
  LineType,
  CubePrimitive,
  Color,
  Point3,
  ModelPrimitive,
  Vector3,
  TriangleListPrimitive,
} from "@foxglove/schemas";
import {
  LaneBoundary_BoundaryPoint_Dash,
  LaneBoundary_Classification_Type,
} from "@lichtblick/asam-osi-types";

import { eulerToQuaternion } from "./geometry";
import {
  LANE_BOUNDARY_OPACITY,
  LANE_BOUNDARY_ARROWS_LENGTH,
  LANE_BOUNDARY_ARROWS_WIDTH,
} from "../../src/config";

export interface ArrowProperties {
  shaft_diameter: number;
  shaft_length: number;
  head_diameter: number;
  head_length: number;
  color: Color;
}

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

  // Add vertices and colors for each lane boundary section between the current and next boundary point
  for (let i = 0; i < points.length - 1; i++) {
    // Handle dash opacity alternation
    const dashProperty = points[i]!.dash;
    if (dashed) {
      // Use 'dash' property to determine if the current section is dash or gap; if UNKNOWN or OTHER the flag alternates every step
      if (
        dashProperty === LaneBoundary_BoundaryPoint_Dash.GAP ||
        dashProperty === LaneBoundary_BoundaryPoint_Dash.END
      ) {
        dashSectionFlag = false; // override
      } else if (
        dashProperty === LaneBoundary_BoundaryPoint_Dash.START ||
        dashProperty === LaneBoundary_BoundaryPoint_Dash.CONTINUE
      ) {
        dashSectionFlag = true; // override
      }

      // Set opacity based on the flag
      if (dashSectionFlag) {
        currentColor = color;
      } else {
        currentColor = {
          ...color,
          a: LANE_BOUNDARY_OPACITY[LaneBoundary_Classification_Type.NO_LINE],
        };
      }
      dashSectionFlag = !dashSectionFlag; // alternate opacity for next section (will be overridden if 'dash' property is set)
    }
    const p1 = points[i]!.position;
    const p2 = points[i + 1]!.position;
    const w1 = points[i]!.width;
    const w2 = points[i + 1]!.width;
    const h1 = points[i]!.height;
    const h2 = points[i + 1]!.height;

    // Calculate the normal vector of the lane boundary
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const nx = dy / distance;
    const ny = -dx / distance;

    // Calculate top and bottom vertices for first boundary point of the lane boundary section
    let bottomLeft1 = undefined;
    let bottomRight1 = undefined;
    let topLeft1 = undefined;
    let topRight1 = undefined;
    if (i === 0) {
      // Do only for first lane boundary section otherwise use vertices from previous section
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
      if (previousSectionWasExtrudedFlag) {
        bottomLeft1 = vertices[vertices.length - 2]!;
        bottomRight1 = vertices[vertices.length - 1]!;
        topLeft1 = vertices[vertices.length - 8]!;
        topRight1 = vertices[vertices.length - 7]!;
      } else {
        bottomLeft1 = vertices[vertices.length - 2]!;
        bottomRight1 = vertices[vertices.length - 1]!;
        topLeft1 = vertices[vertices.length - 2]!; // will only be used when current section is extruded again
        topRight1 = vertices[vertices.length - 1]!; // will only be used when current section is extruded again
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
      if (i === points.length - 1) {
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

/**
 * Compares two lists of LaneBoundaryPoints based on their proximity of start and end points.
 * The function is used to sort lane boundaries.
 *
 * @returns Negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise.
 */
const compareStartToEnd = (a: MarkerPoint[], b: MarkerPoint[]) => {
  if (a.length === 0 || b.length === 0) {
    return 0; // return 0 to indicate that a and b are equal and don't have to be reordered
  }
  const aStart = a[0]?.position;
  const aEnd = a[a.length - 1]?.position;
  const bStart = b[0]?.position;
  const bEnd = b[b.length - 1]?.position;

  if (!aStart || !aEnd || !bStart || !bEnd) {
    return 0; // return 0 to indicate that a and b can not be reordered
  }

  const distanceAEndToBStart = Math.sqrt(
    Math.pow(aEnd.x - bStart.x, 2) +
      Math.pow(aEnd.y - bStart.y, 2) +
      Math.pow(aEnd.z - bStart.z, 2),
  );

  const distanceBEndToAStart = Math.sqrt(
    Math.pow(bEnd.x - aStart.x, 2) +
      Math.pow(bEnd.y - aStart.y, 2) +
      Math.pow(bEnd.z - aStart.z, 2),
  );
  return distanceAEndToBStart - distanceBEndToAStart;
};

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

    // Order multiple left and right boundaries based on start/end point proximity
    // Note that this sorting might not guarantee a correct order for all cases
    // Maybe each boundary line should be considered separately and not be merged so that they're not connected with each other and don't have to be sorted
    leftLaneBoundaries.sort(compareStartToEnd);
    rightLaneBoundaries.sort(compareStartToEnd);

    // Merge multiple right/left boundaries into one left and one right boundary
    let mergedLeftBoundaries: MarkerPoint[] = [];
    for (const boundary of leftLaneBoundaries) {
      mergedLeftBoundaries.push(...boundary);
    }
    let mergedRightBoundaries: MarkerPoint[] = [];
    for (const boundary of rightLaneBoundaries) {
      mergedRightBoundaries.push(...boundary);
    }

    // Remove duplicates from merged boundaries
    mergedLeftBoundaries = mergedLeftBoundaries.filter(
      (point, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.position.x === point.position.x &&
            p.position.y === point.position.y &&
            p.position.z === point.position.z,
        ),
    );

    mergedRightBoundaries = mergedRightBoundaries.filter(
      (point, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.position.x === point.position.x &&
            p.position.y === point.position.y &&
            p.position.z === point.position.z,
        ),
    );

    // Create edge line for both left and right boundaries using lane boundary width to prevent z-fighting of lane surface are and lane boundaries and facilitate clicking interactions
    const leftBoundariesEdge: Point3[] = createOffsetLine(mergedLeftBoundaries, add);
    const rightBoundariesEdge: Point3[] = createOffsetLine(mergedRightBoundaries, subtract);

    // Draw surface area pointing from the boundary line to the side of the lane
    // Create offset line for both left and right boundaries
    const offsetLeftBoundaries: Point3[] = createOffsetLine(mergedLeftBoundaries, add, laneWidth);
    const offsetRightBoundaries: Point3[] = createOffsetLine(
      mergedRightBoundaries,
      subtract,
      laneWidth,
    );

    // Check precondition for triangle list primitive creation
    if (
      leftBoundariesEdge.length !== offsetLeftBoundaries.length ||
      mergedRightBoundaries.length !== offsetRightBoundaries.length
    ) {
      throw new Error(
        "The length of offset point list does not equal the length of left boundary point list",
      );
    }

    // Create triangle list primitive that connect each left and right boundary point with their corresponding offset point list
    for (let i = 0; i < leftBoundariesEdge.length - 1; i++) {
      const p1 = leftBoundariesEdge[i]!;
      const p2 = leftBoundariesEdge[i + 1]!;

      const op1 = offsetLeftBoundaries[i]!;
      const op2 = offsetLeftBoundaries[i + 1]!;

      // Add vertices and colors for the surface area between the current and next lane boundary points
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

    for (let i = 0; i < rightBoundariesEdge.length - 1; i++) {
      const p1 = rightBoundariesEdge[i]!;
      const p2 = rightBoundariesEdge[i + 1]!;

      const op1 = offsetRightBoundaries[i]!;
      const op2 = offsetRightBoundaries[i + 1]!;

      // Add vertices and colors for the surface area between the current and next lane boundary points
      vertices.push(p1);
      colors.push(color);
      vertices.push(p2);
      colors.push(color);
      vertices.push(op1);
      colors.push({ r: color.r, g: color.g, b: color.b, a: 0 });
      vertices.push(p2);
      colors.push(color);
      vertices.push(op1);
      colors.push({ r: color.r, g: color.g, b: color.b, a: 0 });
      vertices.push(op2);
      colors.push({ r: color.r, g: color.g, b: color.b, a: 0 });
    }
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

export function objectToCubePrimitive(
  x: number,
  y: number,
  z: number,
  roll: number,
  pitch: number,
  yaw: number,
  width: number,
  length: number,
  height: number,
  color: Color,
): CubePrimitive {
  return {
    pose: {
      position: {
        x,
        y,
        z,
      },
      orientation: eulerToQuaternion(roll, pitch, yaw),
    },
    size: {
      x: length,
      y: width,
      z: height,
    },
    color,
  };
}

export function objectToModelPrimitive(
  x: number,
  y: number,
  z: number,
  roll: number,
  pitch: number,
  yaw: number,
  width: number,
  length: number,
  height: number,
  color: Color,
  data: Uint8Array,
): ModelPrimitive {
  return {
    pose: {
      position: {
        x,
        y,
        z,
      },
      orientation: eulerToQuaternion(roll, pitch, yaw),
    },
    scale: {
      x: length,
      y: width,
      z: height,
    },
    color,
    override_color: false,
    url: "",
    media_type: "model/gltf-binary",
    data,
  };
}
