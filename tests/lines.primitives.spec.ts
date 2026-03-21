import { Color } from "@foxglove/schemas";
import { LaneBoundary_BoundaryPoint_Dash, LaneBoundary_Classification_Type } from "@lichtblick/asam-osi-types";

import { MarkerPoint, pointListToTriangleListPrimitive } from "@/utils/primitives/lines";
import { LANE_BOUNDARY_OPACITY } from "@/config/constants";

describe("pointListToTriangleListPrimitive", () => {
  const color: Color = { r: 1, g: 1, b: 1, a: 1 };
  const options = { dashed: false, arrows: false, invertArrows: false };

  it("does not emit NaN vertices when consecutive points are identical", () => {
    const pointsWithDuplicate: MarkerPoint[] = [
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0 },
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0 },
      { position: { x: 1, y: 0, z: 0 }, width: 0.2, height: 0 },
    ];

    const primitive = pointListToTriangleListPrimitive(pointsWithDuplicate, color, options);

    expect(primitive.points).not.toHaveLength(0);
    for (const point of primitive.points) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(Number.isFinite(point.z)).toBe(true);
    }
  });

  it("does not advance implicit dash alternation on zero-length segments", () => {
    const pointsWithDuplicate: MarkerPoint[] = [
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0, dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN },
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0, dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN },
      { position: { x: 1, y: 0, z: 0 }, width: 0.2, height: 0, dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN },
      { position: { x: 2, y: 0, z: 0 }, width: 0.2, height: 0, dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN },
    ];

    const primitive = pointListToTriangleListPrimitive(
      pointsWithDuplicate,
      color,
      { dashed: true, arrows: false, invertArrows: false },
    );

    // First rendered section remains a dash because zero-length sections do not advance fallback phase.
    expect(primitive.colors[0]?.a).toBe(color.a);
  });

  it("applies explicit dash enums even when the segment is zero-length", () => {
    const pointsWithDuplicateAndExplicitDash: MarkerPoint[] = [
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0, dash: LaneBoundary_BoundaryPoint_Dash.GAP },
      {
        position: { x: 0, y: 0, z: 0 },
        width: 0.2,
        height: 0,
        dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN,
      },
      {
        position: { x: 1, y: 0, z: 0 },
        width: 0.2,
        height: 0,
        dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN,
      },
    ];

    const primitive = pointListToTriangleListPrimitive(
      pointsWithDuplicateAndExplicitDash,
      color,
      { dashed: true, arrows: false, invertArrows: false },
    );

    // GAP on the zero-length segment is still consumed and controls the first rendered segment.
    expect(primitive.colors[0]?.a).toBe(
      LANE_BOUNDARY_OPACITY[LaneBoundary_Classification_Type.NO_LINE],
    );
  });

  it("keeps extruded mesh continuity across a zero-length segment", () => {
    const pointsWithDuplicate: MarkerPoint[] = [
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0.3 },
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0.3 },
      { position: { x: 1, y: 0, z: 0 }, width: 0.2, height: 0.3 },
      { position: { x: 2, y: 0, z: 0 }, width: 0.2, height: 0.3 },
    ];
    const pointsWithoutDuplicate: MarkerPoint[] = [
      { position: { x: 0, y: 0, z: 0 }, width: 0.2, height: 0.3 },
      { position: { x: 1, y: 0, z: 0 }, width: 0.2, height: 0.3 },
      { position: { x: 2, y: 0, z: 0 }, width: 0.2, height: 0.3 },
    ];

    const withDuplicate = pointListToTriangleListPrimitive(pointsWithDuplicate, color, options);
    const withoutDuplicate = pointListToTriangleListPrimitive(pointsWithoutDuplicate, color, options);

    expect(withDuplicate.points).toHaveLength(withoutDuplicate.points.length);
    expect(withDuplicate.colors).toHaveLength(withoutDuplicate.colors.length);

    for (let i = 0; i < withDuplicate.points.length; i++) {
      const pWith = withDuplicate.points[i]!;
      const pWithout = withoutDuplicate.points[i]!;
      expect(pWith.x).toBeCloseTo(pWithout.x, 10);
      expect(pWith.y).toBeCloseTo(pWithout.y, 10);
      expect(pWith.z).toBeCloseTo(pWithout.z, 10);
    }
  });
});
