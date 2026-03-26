import { Color } from "@foxglove/schemas";
import {
  LaneBoundary_BoundaryPoint_Dash,
  LaneBoundary_Classification_Type,
} from "@lichtblick/asam-osi-types";

import { LANE_BOUNDARY_OPACITY } from "@/config/constants";
import {
  MarkerPoint,
  laneToTriangleListPrimitive,
  pointListToTriangleListPrimitive,
} from "@/utils/primitives/lines";

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
      {
        position: { x: 0, y: 0, z: 0 },
        width: 0.2,
        height: 0,
        dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN,
      },
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
      {
        position: { x: 2, y: 0, z: 0 },
        width: 0.2,
        height: 0,
        dash: LaneBoundary_BoundaryPoint_Dash.UNKNOWN,
      },
    ];

    const primitive = pointListToTriangleListPrimitive(pointsWithDuplicate, color, {
      dashed: true,
      arrows: false,
      invertArrows: false,
    });

    // First rendered section remains a dash because zero-length sections do not advance fallback phase.
    expect(primitive.colors[0]?.a).toBe(color.a);
  });

  it("applies explicit dash enums even when the segment is zero-length", () => {
    const pointsWithDuplicateAndExplicitDash: MarkerPoint[] = [
      {
        position: { x: 0, y: 0, z: 0 },
        width: 0.2,
        height: 0,
        dash: LaneBoundary_BoundaryPoint_Dash.GAP,
      },
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

    const primitive = pointListToTriangleListPrimitive(pointsWithDuplicateAndExplicitDash, color, {
      dashed: true,
      arrows: false,
      invertArrows: false,
    });

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
    const withoutDuplicate = pointListToTriangleListPrimitive(
      pointsWithoutDuplicate,
      color,
      options,
    );

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

describe("laneToTriangleListPrimitive", () => {
  const color: Color = { r: 0.5, g: 0.5, b: 0.5, a: 0.8 };
  const laneWidth = 3;

  const mkPoint = (x: number, y: number, z = 0): MarkerPoint => ({
    position: { x, y, z },
    width: 0.2,
    height: 0,
  });

  it("generates 6 vertices per quad for a single boundary on each side", () => {
    // 3-point boundary → 2 quads → 12 vertices per side, 24 total
    const left: MarkerPoint[][] = [[mkPoint(0, 5), mkPoint(1, 5), mkPoint(2, 5)]];
    const right: MarkerPoint[][] = [[mkPoint(0, -5), mkPoint(1, -5), mkPoint(2, -5)]];

    const result = laneToTriangleListPrimitive(left, right, color, laneWidth);

    expect(result.points).toHaveLength(24);
    expect(result.colors).toHaveLength(24);
  });

  it("processes multiple boundaries per side independently without jump edges", () => {
    // Two separate left boundaries far apart — should never produce cross-boundary triangles
    const boundaryA: MarkerPoint[] = [mkPoint(0, 10), mkPoint(1, 10)];
    const boundaryB: MarkerPoint[] = [mkPoint(0, -10), mkPoint(1, -10)];
    const left: MarkerPoint[][] = [boundaryA, boundaryB];

    const result = laneToTriangleListPrimitive(left, [], color, laneWidth);

    // Each 2-point boundary → 1 quad → 6 vertices; two boundaries → 12 total
    expect(result.points).toHaveLength(12);

    // Vertices from the first quad (boundary A, y≈10) must not appear in the second quad (boundary B, y≈-10)
    const firstQuadY = result.points.slice(0, 6).map((p) => p.y);
    const secondQuadY = result.points.slice(6, 12).map((p) => p.y);

    for (const y of firstQuadY) {
      expect(y).toBeGreaterThan(0);
    }
    for (const y of secondQuadY) {
      expect(y).toBeLessThan(0);
    }
  });

  it("returns an empty primitive for empty boundary arrays", () => {
    const result = laneToTriangleListPrimitive([], [], color, laneWidth);

    expect(result.points).toHaveLength(0);
    expect(result.colors).toHaveLength(0);
  });

  it("skips single-point boundaries without crashing", () => {
    const left: MarkerPoint[][] = [[mkPoint(5, 5)]];
    const right: MarkerPoint[][] = [[mkPoint(5, -5)]];

    const result = laneToTriangleListPrimitive(left, right, color, laneWidth);

    expect(result.points).toHaveLength(0);
  });

  it("skips boundaries that deduplicate to fewer than 2 points", () => {
    const allDuplicates: MarkerPoint[][] = [[mkPoint(1, 1), mkPoint(1, 1), mkPoint(1, 1)]];

    const result = laneToTriangleListPrimitive(allDuplicates, [], color, laneWidth);

    expect(result.points).toHaveLength(0);
  });

  it("applies transparency gradient on offset vertices", () => {
    const left: MarkerPoint[][] = [[mkPoint(0, 0), mkPoint(1, 0)]];

    const result = laneToTriangleListPrimitive(left, [], color, laneWidth);

    // 1 quad = 6 vertices; boundary-edge vertices (indices 0,1,3) get full color,
    // offset vertices (indices 2,4,5) get a=0
    expect(result.colors[0]!.a).toBe(color.a);
    expect(result.colors[1]!.a).toBe(color.a);
    expect(result.colors[2]!.a).toBe(0);
    expect(result.colors[3]!.a).toBe(color.a);
    expect(result.colors[4]!.a).toBe(0);
    expect(result.colors[5]!.a).toBe(0);
  });

  describe("deduplication", () => {
    // Reference implementation: the old O(n²) filter+findIndex approach.
    // Used purely as an oracle to prove the optimised code produces identical output.
    function referenceDeduplicate(points: MarkerPoint[]): MarkerPoint[] {
      return points.filter(
        (point, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.position.x === point.position.x &&
              p.position.y === point.position.y &&
              p.position.z === point.position.z,
          ),
      );
    }

    it("produces identical output to the reference O(n²) dedup", () => {
      // Boundary with scattered duplicates in various positions
      const boundary: MarkerPoint[] = [
        mkPoint(0, 0),
        mkPoint(1, 0),
        mkPoint(1, 0), // dup of [1]
        mkPoint(2, 0),
        mkPoint(0, 0), // dup of [0]
        mkPoint(3, 0),
      ];
      const withDups: MarkerPoint[][] = [[...boundary]];
      const withoutDups: MarkerPoint[][] = [referenceDeduplicate(boundary)];

      const resultDups = laneToTriangleListPrimitive(withDups, [], color, laneWidth);
      const resultClean = laneToTriangleListPrimitive(withoutDups, [], color, laneWidth);

      expect(resultDups.points).toHaveLength(resultClean.points.length);
      for (let i = 0; i < resultDups.points.length; i++) {
        expect(resultDups.points[i]!.x).toBeCloseTo(resultClean.points[i]!.x, 10);
        expect(resultDups.points[i]!.y).toBeCloseTo(resultClean.points[i]!.y, 10);
        expect(resultDups.points[i]!.z).toBeCloseTo(resultClean.points[i]!.z, 10);
      }
    });

    it("preserves first-occurrence ordering when removing duplicates", () => {
      // Points where duplicate removal order matters for geometry:
      // A(0,0) B(1,2) A(0,0) C(2,4) → should keep [A, B, C] not [B, A, C]
      const boundary: MarkerPoint[][] = [
        [mkPoint(0, 0), mkPoint(1, 2), mkPoint(0, 0), mkPoint(2, 4)],
      ];

      const result = laneToTriangleListPrimitive(boundary, [], color, laneWidth);

      // 3 unique points → 2 quads → 12 vertices
      expect(result.points).toHaveLength(12);

      // First boundary-edge vertex (p1 of first quad) derives from A(0,0),
      // not B(1,2), proving the first occurrence is kept.
      // createOffsetLine shifts x slightly, so check it's closer to 0 than to 1.
      expect(Math.abs(result.points[0]!.x)).toBeLessThan(0.5);
    });

    it("handles consecutive duplicates the same as scattered duplicates", () => {
      const consecutive: MarkerPoint[][] = [
        [mkPoint(0, 0), mkPoint(0, 0), mkPoint(1, 0), mkPoint(2, 0)],
      ];
      const scattered: MarkerPoint[][] = [
        [mkPoint(0, 0), mkPoint(1, 0), mkPoint(0, 0), mkPoint(2, 0)],
      ];

      const resultConsec = laneToTriangleListPrimitive(consecutive, [], color, laneWidth);
      const resultScatter = laneToTriangleListPrimitive(scattered, [], color, laneWidth);

      // Both should produce the same number of triangles (3 unique points → 2 quads → 12 verts)
      expect(resultConsec.points).toHaveLength(12);
      expect(resultScatter.points).toHaveLength(12);
    });
  });
});
