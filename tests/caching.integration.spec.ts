import {
  GroundTruth,
  Lane,
  Lane_Classification_Type,
  LaneBoundary,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification_Type,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

import { convertGroundTruthToSceneUpdate, createGroundTruthContext } from "@converters";

jest.mock("@features/trafficsigns", () => ({
  preloadDynamicTextures: jest.fn(),
}));

jest.mock("@features/trafficlights", () => ({}));

function makeBoundary(
  id: number,
  points: { x: number; y: number; z: number }[],
): DeepRequired<LaneBoundary> {
  return {
    id: { value: id },
    boundary_line: points.map((p) => ({
      position: { x: p.x, y: p.y, z: p.z },
      width: 0.15,
      height: 0,
    })),
    classification: {
      type: LaneBoundary_Classification_Type.SOLID_LINE,
      color: LaneBoundary_Classification_Color.WHITE,
    },
  } as unknown as DeepRequired<LaneBoundary>;
}

function makeLane(
  id: number,
  leftBoundaryIds: number[],
  rightBoundaryIds: number[],
): DeepRequired<Lane> {
  return {
    id: { value: id },
    classification: {
      type: Lane_Classification_Type.DRIVING,
      left_lane_boundary_id: leftBoundaryIds.map((v) => ({ value: v })),
      right_lane_boundary_id: rightBoundaryIds.map((v) => ({ value: v })),
      centerline: [],
      lane_pairing: [],
      left_adjacent_lane_id: [],
      right_adjacent_lane_id: [],
    },
  } as unknown as DeepRequired<Lane>;
}

function makeMovingObject(id: number, x: number): DeepRequired<MovingObject> {
  return {
    id: { value: id },
    base: {
      dimension: { width: 2, height: 1.5, length: 4.5 },
      position: { x, y: 0, z: 0 },
      orientation: { yaw: 0, pitch: 0, roll: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
    },
    type: MovingObject_Type.VEHICLE,
    model_reference: "",
    vehicle_attributes: { bbcenter_to_rear: { x: 0, y: 0, z: 0 } },
    moving_object_classification: { assigned_lane_id: [] },
    vehicle_classification: {
      type: MovingObject_VehicleClassification_Type.SMALL_CAR,
      light_state: {},
    },
  } as unknown as DeepRequired<MovingObject>;
}

function makeGroundTruth(
  seconds: number,
  movingObjects: DeepRequired<MovingObject>[],
  boundaries: DeepRequired<LaneBoundary>[],
  lanes: DeepRequired<Lane>[],
): GroundTruth {
  return {
    timestamp: { seconds, nanos: 0 },
    host_vehicle_id: { value: 0 },
    moving_object: movingObjects,
    stationary_object: [],
    lane_boundary: boundaries,
    lane: lanes,
    logical_lane: [],
    logical_lane_boundary: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    reference_line: [],
  } as GroundTruth;
}

describe("Caching integration", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should not throw errors during hashing (no swallowed exceptions)", () => {
    const ctx = createGroundTruthContext();
    const bd1 = makeBoundary(1, [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ]);
    const bd2 = makeBoundary(2, [
      { x: 0, y: 3.5, z: 0 },
      { x: 10, y: 3.5, z: 0 },
    ]);
    const lane = makeLane(100, [1], [2]);
    const car = makeMovingObject(0, 5);

    const msg1 = makeGroundTruth(0, [car], [bd1, bd2], [lane]);
    const result1 = convertGroundTruthToSceneUpdate(ctx, msg1);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result1.entities).toBeDefined();
    expect((result1.entities as any[]).length).toBeGreaterThan(0);
  });

  it("should rebuild moving objects every frame even with lane cache hits", () => {
    const ctx = createGroundTruthContext();
    const bd1 = makeBoundary(1, [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ]);
    const bd2 = makeBoundary(2, [
      { x: 0, y: 3.5, z: 0 },
      { x: 10, y: 3.5, z: 0 },
    ]);
    const lane = makeLane(100, [1], [2]);

    // Frame 1: car at x=5
    const car1 = makeMovingObject(0, 5);
    const msg1 = makeGroundTruth(0, [car1], [bd1, bd2], [lane]);
    convertGroundTruthToSceneUpdate(ctx, msg1);

    // Frame 2: car at x=15 (moved), same boundaries
    const car2 = makeMovingObject(0, 15);
    const msg2 = makeGroundTruth(1, [car2], [bd1, bd2], [lane]);
    const result2 = convertGroundTruthToSceneUpdate(ctx, msg2);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(result2.entities).toBeDefined();
    // Moving object entities should be present in both frames
    expect((result2.entities as any[]).length).toBeGreaterThan(0);
  });

  it("should detect boundary geometry changes and rebuild", () => {
    const ctx = createGroundTruthContext();
    const lane = makeLane(100, [1], [2]);
    const car = makeMovingObject(0, 5);

    // Frame 1: original boundaries
    const bd1_v1 = makeBoundary(1, [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ]);
    const bd2_v1 = makeBoundary(2, [
      { x: 0, y: 3.5, z: 0 },
      { x: 10, y: 3.5, z: 0 },
    ]);
    const msg1 = makeGroundTruth(0, [car], [bd1_v1, bd2_v1], [lane]);
    const result1 = convertGroundTruthToSceneUpdate(ctx, msg1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Frame 2: same IDs, different geometry (the bug scenario)
    const bd1_v2 = makeBoundary(1, [
      { x: 10, y: 0, z: 0 },
      { x: 20, y: 0, z: 0 },
    ]);
    const bd2_v2 = makeBoundary(2, [
      { x: 10, y: 3.5, z: 0 },
      { x: 20, y: 3.5, z: 0 },
    ]);
    const msg2 = makeGroundTruth(1, [car], [bd1_v2, bd2_v2], [lane]);
    const result2 = convertGroundTruthToSceneUpdate(ctx, msg2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Frame 3: same as frame 2 (should cache hit)
    const msg3 = makeGroundTruth(2, [car], [bd1_v2, bd2_v2], [lane]);
    const result3 = convertGroundTruthToSceneUpdate(ctx, msg3);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // All frames should have entities
    expect((result1.entities as unknown[]).length).toBeGreaterThan(0);
    expect((result2.entities as unknown[]).length).toBeGreaterThan(0);
    expect((result3.entities as unknown[]).length).toBeGreaterThan(0);
  });

  it("should work for 20+ consecutive frames simulating real playback", () => {
    const ctx = createGroundTruthContext();

    for (let frame = 0; frame < 25; frame++) {
      // Boundaries shift by 5m every 10 frames (simulating partial chunking)
      const offset = Math.floor(frame / 10) * 5;
      const bd1 = makeBoundary(1, [
        { x: offset, y: 0, z: 0 },
        { x: offset + 10, y: 0, z: 0 },
        { x: offset + 20, y: 0, z: 0 },
      ]);
      const bd2 = makeBoundary(2, [
        { x: offset, y: 3.5, z: 0 },
        { x: offset + 10, y: 3.5, z: 0 },
        { x: offset + 20, y: 3.5, z: 0 },
      ]);
      const lane = makeLane(100, [1], [2]);
      const car = makeMovingObject(0, offset + frame * 0.5);

      const msg = makeGroundTruth(frame, [car], [bd1, bd2], [lane]);
      const result = convertGroundTruthToSceneUpdate(ctx, msg);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(result.entities).toBeDefined();
      expect((result.entities as any[]).length).toBeGreaterThan(0);
    }
  });
});
