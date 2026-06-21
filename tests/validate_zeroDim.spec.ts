import {
  GroundTruth,
  MovingObject,
  MovingObject_Type,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

jest.mock("@features/trafficsigns", () => ({ preloadDynamicTextures: jest.fn() }));
jest.mock("@features/trafficlights", () => ({}));

import { convertGroundTruthToFrameTransforms, registerGroundTruthConverter } from "@converters";

const ego = {
  id: { value: 0 },
  base: {
    dimension: { width: 0, length: 0, height: 1.5 },
    position: { x: 0, y: 0, z: 0 },
    orientation: { roll: 0, pitch: 0, yaw: 0 },
  },
  type: MovingObject_Type.VEHICLE,
  vehicle_attributes: { bbcenter_to_rear: { x: 0, y: 0, z: -1.5 } },
  vehicle_classification: { type: {} },
  model_reference: "",
} as unknown as DeepRequired<MovingObject>;

const gt = {
  version: { version_major: 3, version_minor: 8, version_patch: 0 },
  timestamp: { seconds: 1702029612, nanos: 0 },
  host_vehicle_id: { value: 0 },
  moving_object: [ego],
  stationary_object: [],
  lane_boundary: [], lane: [], logical_lane: [], logical_lane_boundary: [],
  traffic_sign: [], traffic_light: [], road_marking: [], reference_line: [],
} as unknown as GroundTruth;

describe("Zero-dimension ego", () => {
  it("does NOT crash frame transforms", () => {
    const result = convertGroundTruthToFrameTransforms(gt);
    const frames = result.transforms.map((t: any) => t.child_frame_id);
    expect(frames).toContain("ego_vehicle_bb_center");
    expect(frames).toContain("ego_vehicle_rear_axle");
  });

  it("does NOT crash scene update", () => {
    const converter = registerGroundTruthConverter();
    const event = { topic: "gt", receiveTime: { sec: 0, nsec: 0 }, message: gt, schemaName: "osi3.GroundTruth", sizeInBytes: 0 };
    const result = converter(gt, event as any) as any;
    // Should have 1 entity (ego with zero-width box — renders but invisible)
    expect(result.entities?.length).toBeGreaterThanOrEqual(1);
  });
});
