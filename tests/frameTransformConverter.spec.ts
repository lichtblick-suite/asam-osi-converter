import { convertGroundTruthToFrameTransforms } from "@converters";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { MessageConverterContext } from "@lichtblick/suite";

jest.mock("@features/trafficsigns", () => ({
  preloadDynamicTextures: jest.fn(),
}));

jest.mock("@features/trafficlights", () => ({}));

function mockContext(): { context: MessageConverterContext; emitAlert: jest.Mock } {
  const emitAlert = jest.fn();
  return { context: { emitAlert }, emitAlert };
}

const baseTimestamp = { seconds: 1, nanos: 0 };

function minimalGroundTruth(overrides?: Partial<GroundTruth>): GroundTruth {
  return {
    timestamp: baseTimestamp,
    host_vehicle_id: { value: 42 },
    moving_object: [
      {
        id: { value: 42 },
        base: {
          dimension: { width: 2, height: 1.5, length: 4 },
          position: { x: 10, y: 20, z: 0.5 },
          orientation: { yaw: 1.57, pitch: 0, roll: 0 },
        },
        vehicle_attributes: {
          bbcenter_to_rear: { x: -1.5, y: 0, z: 0 },
        },
      },
      {
        id: { value: 99 },
        base: {
          dimension: { width: 1.8, height: 1.4, length: 3.5 },
          position: { x: 50, y: 30, z: 0 },
          orientation: { yaw: 0, pitch: 0, roll: 0 },
        },
      },
    ],
    ...overrides,
  } as GroundTruth;
}

describe("frameTransformConverter — host vehicle resolution", () => {
  it("produces BB center + rear axle transforms when host vehicle has bbcenter_to_rear", () => {
    const result = convertGroundTruthToFrameTransforms(
      minimalGroundTruth(),
      undefined,
      undefined,
      undefined,
    );

    expect(result.transforms).toHaveLength(2);

    const bbCenter = result.transforms[0]!;
    expect(bbCenter.parent_frame_id).toBe("global");
    expect(bbCenter.child_frame_id).toBe("ego_vehicle_bb_center");
    expect(bbCenter.translation).toEqual({ x: 10, y: 20, z: 0.5 });

    const rearAxle = result.transforms[1]!;
    expect(rearAxle.parent_frame_id).toBe("ego_vehicle_bb_center");
    expect(rearAxle.child_frame_id).toBe("ego_vehicle_rear_axle");
    expect(rearAxle.translation).toEqual({ x: -1.5, y: 0, z: 0 });
  });

  it("returns empty transforms when host vehicle not in moving_object", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: { value: 999 } });
    const { context, emitAlert } = mockContext();
    const result = convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(result.transforms).toHaveLength(0);
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-host-vehicle-not-found",
    );
  });

  it("returns empty transforms when both GT and fallback IDs are missing", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: undefined });
    const { context, emitAlert } = mockContext();
    const result = convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(result.transforms).toHaveLength(0);
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-missing-host-vehicle-id",
    );
  });

  it("uses fallback ID when GT host_vehicle_id is missing", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: undefined });
    const result = convertGroundTruthToFrameTransforms(msg, undefined, undefined, undefined, 42);

    expect(result.transforms).toHaveLength(2);
    expect(result.transforms[0]!.translation).toEqual({ x: 10, y: 20, z: 0.5 });
  });
});

describe("frameTransformConverter — rear axle handling", () => {
  it("produces only BB center transform when bbcenter_to_rear is missing", () => {
    const msg = minimalGroundTruth();
    // Remove bbcenter_to_rear from the host vehicle
    (msg.moving_object as Array<Record<string, unknown>>)[0]!.vehicle_attributes = {};

    const { context, emitAlert } = mockContext();
    const result = convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(result.transforms).toHaveLength(1);
    expect(result.transforms[0]!.child_frame_id).toBe("ego_vehicle_bb_center");
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
      "groundtruth-frametransforms-missing-bbcenter-to-rear",
    );
  });
});

describe("frameTransformConverter — host vehicle ID divergence", () => {
  it("emits warn when GT and fallback host_vehicle_id differ", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: { value: 42 } });
    const { context, emitAlert } = mockContext();

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context, 99);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "warn",
        message: expect.stringContaining("differs from SensorView"),
      }),
      "groundtruth-frametransforms-host-vehicle-id-divergence",
    );
  });

  it("uses GT host_vehicle_id when both are present but differ", () => {
    // GT says host is 42 (at position 10,20,0.5), SensorView says 99 (at 50,30,0)
    const msg = minimalGroundTruth({ host_vehicle_id: { value: 42 } });
    const result = convertGroundTruthToFrameTransforms(msg, undefined, undefined, undefined, 99);

    // Should use GT's value (42), producing transforms for vehicle at (10,20,0.5)
    expect(result.transforms).toHaveLength(2);
    expect(result.transforms[0]!.translation).toEqual({ x: 10, y: 20, z: 0.5 });
  });

  it("does not emit divergence alert when both IDs agree", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: { value: 42 } });
    const { context, emitAlert } = mockContext();

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context, 42);

    const divergenceCall = emitAlert.mock.calls.find(
      (call: unknown[]) => call[1] === "groundtruth-frametransforms-host-vehicle-id-divergence",
    );
    expect(divergenceCall).toBeUndefined();
  });

  it("does not emit divergence alert when only GT ID is present (no fallback)", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: { value: 42 } });
    const { context, emitAlert } = mockContext();

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    const divergenceCall = emitAlert.mock.calls.find(
      (call: unknown[]) => call[1] === "groundtruth-frametransforms-host-vehicle-id-divergence",
    );
    expect(divergenceCall).toBeUndefined();
  });

  it("does not emit divergence alert when only fallback is present (GT missing)", () => {
    const msg = minimalGroundTruth({ host_vehicle_id: undefined });
    const { context, emitAlert } = mockContext();

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context, 42);

    const divergenceCall = emitAlert.mock.calls.find(
      (call: unknown[]) => call[1] === "groundtruth-frametransforms-host-vehicle-id-divergence",
    );
    expect(divergenceCall).toBeUndefined();
    // Should emit fallback warning instead
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-host-vehicle-fallback-used",
    );
  });
});
