import { Lane, LaneBoundary, LogicalLane, LogicalLaneBoundary } from "@lichtblick/asam-osi-types";
import { hashBoundaries, hashLanes, hashLogicalLanes } from "@utils/hashing";

// --- Test helpers ---

function makeBoundaryPoint(x: number, y: number, z: number) {
  return { position: { x, y, z }, width: 0.15, height: 0.1, dash: 0 };
}

function makeLogicalBoundaryPoint(x: number, y: number, z: number) {
  return { position: { x, y, z }, s_position: 0, t_position: 0 };
}

function makeBoundary(
  id: number,
  points: { position: { x: number; y: number; z: number } }[],
  classificationType = 1,
  classificationColor = 2,
): LaneBoundary {
  return {
    id: { value: id },
    boundary_line: points,
    classification: { type: classificationType, color: classificationColor },
  } as LaneBoundary;
}

function makeLogicalBoundary(
  id: number,
  points: { position: { x: number; y: number; z: number } }[],
): LogicalLaneBoundary {
  return {
    id: { value: id },
    boundary_line: points,
  } as LogicalLaneBoundary;
}

function makeLane(
  id: number,
  centerline: { x: number; y: number; z: number }[],
  leftBoundaryIds: number[],
  rightBoundaryIds: number[],
  options: { type?: number; isHostVehicle?: boolean } = {},
): Lane {
  const { type = 2, isHostVehicle = false } = options;
  return {
    id: { value: id },
    classification: {
      type,
      is_host_vehicle_lane: isHostVehicle,
      centerline,
      left_lane_boundary_id: leftBoundaryIds.map((v) => ({ value: v })),
      right_lane_boundary_id: rightBoundaryIds.map((v) => ({ value: v })),
    },
  } as Lane;
}

function makeLogicalLane(
  id: number,
  leftBoundaryIds: number[],
  rightBoundaryIds: number[],
  type = 1,
): LogicalLane {
  return {
    id: { value: id },
    type,
    left_boundary_id: leftBoundaryIds.map((v) => ({ value: v })),
    right_boundary_id: rightBoundaryIds.map((v) => ({ value: v })),
  } as LogicalLane;
}

// --- Tests ---

describe("hashBoundaries", () => {
  it("returns deterministic hash for identical input", () => {
    const boundaries = [
      makeBoundary(1, [makeBoundaryPoint(1, 2, 3), makeBoundaryPoint(4, 5, 6)]),
      makeBoundary(2, [makeBoundaryPoint(7, 8, 9)]),
    ];
    const result1 = hashBoundaries(boundaries);
    const result2 = hashBoundaries(boundaries);
    expect(result1.hash).toBe(result2.hash);
  });

  it("produces different hashes when geometry changes (same IDs)", () => {
    const original = [makeBoundary(1, [makeBoundaryPoint(1, 2, 3), makeBoundaryPoint(4, 5, 6)])];
    const modified = [makeBoundary(1, [makeBoundaryPoint(1, 2, 3), makeBoundaryPoint(4, 5, 99)])];
    expect(hashBoundaries(original).hash).not.toBe(hashBoundaries(modified).hash);
  });

  it("detects point count changes (partial chunking)", () => {
    const chunk1 = [makeBoundary(1, [makeBoundaryPoint(0, 0, 0), makeBoundaryPoint(10, 0, 0)])];
    const chunk2 = [
      makeBoundary(1, [
        makeBoundaryPoint(0, 0, 0),
        makeBoundaryPoint(5, 0, 0),
        makeBoundaryPoint(10, 0, 0),
      ]),
    ];
    expect(hashBoundaries(chunk1).hash).not.toBe(hashBoundaries(chunk2).hash);
  });

  it("detects classification changes", () => {
    const solidWhite = [makeBoundary(1, [makeBoundaryPoint(1, 2, 3)], 1, 1)];
    const dashedYellow = [makeBoundary(1, [makeBoundaryPoint(1, 2, 3)], 2, 2)];
    expect(hashBoundaries(solidWhite).hash).not.toBe(hashBoundaries(dashedYellow).hash);
  });

  it("is order-independent (sorted by ID)", () => {
    const b1 = makeBoundary(1, [makeBoundaryPoint(1, 2, 3)]);
    const b2 = makeBoundary(2, [makeBoundaryPoint(4, 5, 6)]);
    expect(hashBoundaries([b1, b2]).hash).toBe(hashBoundaries([b2, b1]).hash);
  });

  it("detects added/removed boundaries", () => {
    const b1 = makeBoundary(1, [makeBoundaryPoint(1, 2, 3)]);
    const b2 = makeBoundary(2, [makeBoundaryPoint(4, 5, 6)]);
    expect(hashBoundaries([b1]).hash).not.toBe(hashBoundaries([b1, b2]).hash);
  });

  it("avoids old ID concatenation collision (IDs 1,23 vs 12,3)", () => {
    const set1 = [
      makeBoundary(1, [makeBoundaryPoint(0, 0, 0)]),
      makeBoundary(23, [makeBoundaryPoint(0, 0, 0)]),
    ];
    const set2 = [
      makeBoundary(12, [makeBoundaryPoint(0, 0, 0)]),
      makeBoundary(3, [makeBoundaryPoint(0, 0, 0)]),
    ];
    expect(hashBoundaries(set1).hash).not.toBe(hashBoundaries(set2).hash);
  });

  it("handles empty boundary list", () => {
    const result = hashBoundaries([]);
    expect(result.hash).toBeDefined();
    expect(result.signatures.size).toBe(0);
  });

  it("handles boundary with empty boundary_line", () => {
    const result = hashBoundaries([makeBoundary(1, [])]);
    expect(result.hash).toBeDefined();
    expect(result.signatures.size).toBe(1);
  });

  it("returns per-boundary signatures for WL propagation", () => {
    const boundaries = [
      makeBoundary(10, [makeBoundaryPoint(1, 2, 3)]),
      makeBoundary(20, [makeBoundaryPoint(4, 5, 6)]),
    ];
    const result = hashBoundaries(boundaries);
    expect(result.signatures.size).toBe(2);
    expect(result.signatures.has(10)).toBe(true);
    expect(result.signatures.has(20)).toBe(true);
    expect(result.signatures.get(10)).not.toBe(result.signatures.get(20));
  });

  it("works with logical lane boundaries", () => {
    const boundaries = [
      makeLogicalBoundary(1, [makeLogicalBoundaryPoint(1, 2, 3)]),
      makeLogicalBoundary(2, [makeLogicalBoundaryPoint(4, 5, 6)]),
    ];
    const result = hashBoundaries(boundaries);
    expect(result.hash).toBeDefined();
    expect(result.signatures.size).toBe(2);
  });

  it("detects geometry changes in logical boundaries", () => {
    const original = [makeLogicalBoundary(1, [makeLogicalBoundaryPoint(1, 2, 3)])];
    const modified = [makeLogicalBoundary(1, [makeLogicalBoundaryPoint(1, 2, 99)])];
    expect(hashBoundaries(original).hash).not.toBe(hashBoundaries(modified).hash);
  });

  it("ignores sub-millimeter coordinate differences", () => {
    const a = [makeBoundary(1, [makeBoundaryPoint(1.00001, 2.00001, 3.00001)])];
    const b = [makeBoundary(1, [makeBoundaryPoint(1.00049, 2.00049, 3.00049)])];
    expect(hashBoundaries(a).hash).toBe(hashBoundaries(b).hash);
  });

  it("detects millimeter-level coordinate differences", () => {
    const a = [makeBoundary(1, [makeBoundaryPoint(1.0, 2.0, 3.0)])];
    const b = [makeBoundary(1, [makeBoundaryPoint(1.001, 2.0, 3.0)])];
    expect(hashBoundaries(a).hash).not.toBe(hashBoundaries(b).hash);
  });
});

describe("hashLanes (WL-inspired, physical)", () => {
  const emptySigs = new Map<number, number>();

  it("returns deterministic hash for identical input", () => {
    const lanes = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [10], [20])];
    expect(hashLanes(lanes, emptySigs)).toBe(hashLanes(lanes, emptySigs));
  });

  it("detects centerline geometry changes", () => {
    const original = [
      makeLane(
        1,
        [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
        ],
        [],
        [],
      ),
    ];
    const modified = [
      makeLane(
        1,
        [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 5, z: 0 },
        ],
        [],
        [],
      ),
    ];
    expect(hashLanes(original, emptySigs)).not.toBe(hashLanes(modified, emptySigs));
  });

  it("detects lane type changes", () => {
    const driving = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [], [], { type: 2 })];
    const intersection = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [], [], { type: 3 })];
    expect(hashLanes(driving, emptySigs)).not.toBe(hashLanes(intersection, emptySigs));
  });

  it("detects host vehicle lane flag change", () => {
    const notHost = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [], [], { isHostVehicle: false })];
    const isHost = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [], [], { isHostVehicle: true })];
    expect(hashLanes(notHost, emptySigs)).not.toBe(hashLanes(isHost, emptySigs));
  });

  it("WL: boundary signature change propagates into lane hash", () => {
    const lanes = [makeLane(1, [{ x: 0, y: 0, z: 0 }], [10], [20])];

    const sigsA = new Map<number, number>([
      [10, 111],
      [20, 222],
    ]);
    const sigsB = new Map<number, number>([
      [10, 999],
      [20, 222],
    ]);

    expect(hashLanes(lanes, sigsA)).not.toBe(hashLanes(lanes, sigsB));
  });

  it("WL: boundary geometry change causes lane hash change (end-to-end)", () => {
    const boundaries1 = [
      makeBoundary(10, [makeBoundaryPoint(0, 0, 0), makeBoundaryPoint(10, 0, 0)]),
      makeBoundary(20, [makeBoundaryPoint(0, 1, 0), makeBoundaryPoint(10, 1, 0)]),
    ];
    const boundaries2 = [
      makeBoundary(10, [makeBoundaryPoint(0, 0, 0), makeBoundaryPoint(10, 0, 5)]),
      makeBoundary(20, [makeBoundaryPoint(0, 1, 0), makeBoundaryPoint(10, 1, 0)]),
    ];
    const lanes = [makeLane(1, [{ x: 5, y: 0.5, z: 0 }], [10], [20])];

    const { signatures: sigs1 } = hashBoundaries(boundaries1);
    const { signatures: sigs2 } = hashBoundaries(boundaries2);

    expect(hashLanes(lanes, sigs1)).not.toBe(hashLanes(lanes, sigs2));
  });

  it("is order-independent", () => {
    const l1 = makeLane(1, [{ x: 0, y: 0, z: 0 }], [], []);
    const l2 = makeLane(2, [{ x: 5, y: 5, z: 0 }], [], []);
    expect(hashLanes([l1, l2], emptySigs)).toBe(hashLanes([l2, l1], emptySigs));
  });

  it("handles empty lane list", () => {
    expect(hashLanes([], emptySigs)).toBeDefined();
  });
});

describe("hashLogicalLanes (WL-inspired)", () => {
  const emptySigs = new Map<number, number>();

  it("returns deterministic hash", () => {
    const lanes = [makeLogicalLane(1, [10], [20])];
    expect(hashLogicalLanes(lanes, emptySigs)).toBe(hashLogicalLanes(lanes, emptySigs));
  });

  it("detects type changes", () => {
    const typeA = [makeLogicalLane(1, [], [], 1)];
    const typeB = [makeLogicalLane(1, [], [], 2)];
    expect(hashLogicalLanes(typeA, emptySigs)).not.toBe(hashLogicalLanes(typeB, emptySigs));
  });

  it("WL: boundary signature change propagates", () => {
    const lanes = [makeLogicalLane(1, [10], [20])];
    const sigsA = new Map<number, number>([
      [10, 111],
      [20, 222],
    ]);
    const sigsB = new Map<number, number>([
      [10, 111],
      [20, 888],
    ]);
    expect(hashLogicalLanes(lanes, sigsA)).not.toBe(hashLogicalLanes(lanes, sigsB));
  });

  it("WL: logical boundary geometry change causes lane hash change (end-to-end)", () => {
    const boundaries1 = [makeLogicalBoundary(10, [makeLogicalBoundaryPoint(0, 0, 0)])];
    const boundaries2 = [makeLogicalBoundary(10, [makeLogicalBoundaryPoint(0, 0, 99)])];
    const lanes = [makeLogicalLane(1, [10], [])];

    const { signatures: sigs1 } = hashBoundaries(boundaries1);
    const { signatures: sigs2 } = hashBoundaries(boundaries2);

    expect(hashLogicalLanes(lanes, sigs1)).not.toBe(hashLogicalLanes(lanes, sigs2));
  });

  it("is order-independent", () => {
    const l1 = makeLogicalLane(1, [], []);
    const l2 = makeLogicalLane(2, [], []);
    expect(hashLogicalLanes([l1, l2], emptySigs)).toBe(hashLogicalLanes([l2, l1], emptySigs));
  });

  it("handles empty lane list", () => {
    expect(hashLogicalLanes([], emptySigs)).toBeDefined();
  });
});
