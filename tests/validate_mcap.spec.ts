/**
 * Validate our generated MCAP messages against actual Lichtblick converters.
 * Reproduces bugs locally so we don't need trial-and-error in the GUI.
 */
import {
  GroundTruth,
  SensorData,
  StationaryObject,
  MovingObject,
  MovingObject_Type,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

// Must mock asset-heavy modules before importing converters
jest.mock("@features/trafficsigns", () => ({
  preloadDynamicTextures: jest.fn(),
  buildTrafficSignEntity: jest.fn(() => ({ id: "mock-sign" })),
}));
jest.mock("@features/trafficlights", () => ({
  buildTrafficLightEntity: jest.fn(() => ({ id: "mock-light" })),
  buildTrafficLightMetadata: jest.fn(() => []),
}));

import {
  convertGroundTruthToFrameTransforms,
  convertSensorDataToFrameTransforms,
  convertSensorDataToSceneUpdate,
  registerGroundTruthConverter,
} from "@converters";

// ── Our actual data (matches what Python serializes) ──────────────────────

const mockBase = {
  dimension: { width: 1.8, length: 4.06, height: 1.5 },
  position: { x: 0, y: 0, z: 0 },
  orientation: { roll: 0, pitch: 0, yaw: 0 },
};

const egoMovingObject = {
  id: { value: 0 },
  base: mockBase,
  type: MovingObject_Type.VEHICLE,
  vehicle_attributes: {
    bbcenter_to_rear: { x: 0, y: 0, z: -1.5 },
  },
  vehicle_classification: { type: {} },
  model_reference: "",
} as unknown as DeepRequired<MovingObject>;

// BUG: stationary_object without classification
const stationaryNoCls = {
  id: { value: 1 },
  base: {
    dimension: { width: 0.25, length: 0.25, height: 0.25 },
    position: { x: 15, y: 0, z: 0 },
    orientation: { roll: 0, pitch: 0, yaw: 0 },
  },
  model_reference: "",
} as unknown as DeepRequired<StationaryObject>;

// FIX: stationary_object WITH classification
const stationaryWithCls = {
  ...stationaryNoCls,
  classification: { color: 0, type: 0, material: 0, density: 0 },
} as unknown as DeepRequired<StationaryObject>;

function makeGT(stationaryObjects: any[]): GroundTruth {
  return {
    version: { version_major: 3, version_minor: 8, version_patch: 0 },
    timestamp: { seconds: 1702029612, nanos: 762052536 },
    host_vehicle_id: { value: 0 },
    moving_object: [egoMovingObject],
    stationary_object: stationaryObjects,
    lane_boundary: [],
    lane: [],
    logical_lane: [],
    logical_lane_boundary: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    reference_line: [],
  } as unknown as GroundTruth;
}

const ourSensorData = {
  timestamp: { seconds: 1702029613, nanos: 457074230 },
  sensor_id: { value: 1 },
  mounting_position: {
    position: { x: 1.335, y: 0, z: 0.4 },
    orientation: { roll: 0, pitch: 0, yaw: 0 },
  },
  lane_boundary: [],
} as unknown as SensorData;

// ── Tests ─────────────────────────────────────────────────────────────────

describe("GroundTruth -> FrameTransforms", () => {
  it("produces global -> ego_vehicle_bb_center -> ego_vehicle_rear_axle", () => {
    const gt = makeGT([stationaryWithCls]);
    const result = convertGroundTruthToFrameTransforms(gt);
    const childFrames = result.transforms.map((t: any) => t.child_frame_id);
    expect(childFrames).toContain("ego_vehicle_bb_center");
    expect(childFrames).toContain("ego_vehicle_rear_axle");
  });
});

describe("GroundTruth -> SceneUpdate", () => {
  it("CRASHES when stationary_object has no classification", () => {
    const gt = makeGT([stationaryNoCls]);
    const converter = registerGroundTruthConverter();
    const event = {
      topic: "ground_truth",
      receiveTime: { sec: 0, nsec: 0 },
      message: gt,
      schemaName: "osi3.GroundTruth",
      sizeInBytes: 0,
    };
    const result = converter(gt, event as any) as any;
    // Conversion catches the error internally → entities should be EMPTY
    // because the crash happens during the stationary_object.map() call
    // which kills the entire buildSceneEntities() call
    expect(result.entities?.length ?? 0).toBe(0);
  });

  it("renders boxes when stationary_object HAS classification", () => {
    const gt = makeGT([stationaryWithCls]);
    const converter = registerGroundTruthConverter();
    const event = {
      topic: "ground_truth",
      receiveTime: { sec: 0, nsec: 0 },
      message: gt,
      schemaName: "osi3.GroundTruth",
      sizeInBytes: 0,
    };
    const result = converter(gt, event as any) as any;
    // Should have entities for: 1 moving + 1 stationary = 2
    expect(result.entities?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("SensorData -> FrameTransforms", () => {
  it("produces per-sensor virtual_mounting_position frame", () => {
    const result = convertSensorDataToFrameTransforms(ourSensorData);
    expect(result.transforms).toHaveLength(1);
    expect(result.transforms[0]!.child_frame_id).toBe("virtual_mounting_position_1");
    expect(result.transforms[0]!.parent_frame_id).toBe("ego_vehicle_rear_axle");
    expect(result.transforms[0]!.translation.x).toBeCloseTo(1.335);
    expect(result.transforms[0]!.translation.z).toBeCloseTo(0.4);
  });
});

describe("SensorData -> SceneUpdate", () => {
  it("does not crash (radar has no visualization path)", () => {
    const result = convertSensorDataToSceneUpdate(ourSensorData);
    expect(result).toBeDefined();
    expect(result.deletions).toBeDefined();
  });
});
