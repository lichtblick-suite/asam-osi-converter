import {
  convertGroundTruthToFrameTransforms,
  convertSensorDataToFrameTransforms,
  convertSensorViewToFrameTransforms,
  registerSensorDataSceneUpdateConverter,
  registerSensorViewConverter,
} from "@converters";
import { GroundTruth, SensorData, SensorView } from "@lichtblick/asam-osi-types";
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
          position: { x: 0, y: 0, z: 0 },
          orientation: { yaw: 0, pitch: 0, roll: 0 },
        },
        vehicle_attributes: {
          bbcenter_to_rear: { x: -1.5, y: 0, z: 0 },
        },
      },
    ],
    ...overrides,
  } as GroundTruth;
}

describe("emitAlert — GroundTruth FrameTransforms", () => {
  it("does not emit alerts when all data is present", () => {
    const { context, emitAlert } = mockContext();
    const msg = minimalGroundTruth();

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(emitAlert).not.toHaveBeenCalled();
  });

  it("emits warn when using host_vehicle_id fallback", () => {
    const { context, emitAlert } = mockContext();
    const msg = minimalGroundTruth({ host_vehicle_id: undefined });

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context, 42);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-host-vehicle-fallback-used",
    );
  });

  it("emits warn when host_vehicle_id is missing entirely", () => {
    const { context, emitAlert } = mockContext();
    const msg = minimalGroundTruth({ host_vehicle_id: undefined });

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-missing-host-vehicle-id",
    );
  });

  it("emits warn when host vehicle not found in moving_object", () => {
    const { context, emitAlert } = mockContext();
    const msg = minimalGroundTruth({ moving_object: [] });

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "groundtruth-frametransforms-host-vehicle-not-found",
    );
  });

  it("emits info when bbcenter_to_rear is missing", () => {
    const { context, emitAlert } = mockContext();
    const msg = minimalGroundTruth({
      moving_object: [
        {
          id: { value: 42 },
          base: {
            dimension: { width: 2, height: 1.5, length: 4 },
            position: { x: 0, y: 0, z: 0 },
            orientation: { yaw: 0, pitch: 0, roll: 0 },
          },
          vehicle_attributes: {},
        },
      ],
    } as Partial<GroundTruth>);

    convertGroundTruthToFrameTransforms(msg, undefined, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
      "groundtruth-frametransforms-missing-bbcenter-to-rear",
    );
  });
});

describe("emitAlert — SensorView FrameTransforms", () => {
  const dummyEvent = {} as any;

  it("emits warn when global_ground_truth is missing", () => {
    const { context, emitAlert } = mockContext();
    const msg = {} as SensorView;

    convertSensorViewToFrameTransforms(msg, dummyEvent, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensorview-frametransforms-missing-groundtruth",
    );
  });

  it("returns empty transforms when global_ground_truth is missing", () => {
    const { context } = mockContext();
    const msg = {} as SensorView;

    const result = convertSensorViewToFrameTransforms(msg, dummyEvent, undefined, context);

    expect(result.transforms).toHaveLength(0);
  });
});

describe("emitAlert — SensorView SceneUpdate", () => {
  const dummyEvent = {} as any;

  it("emits warn when global_ground_truth is missing", () => {
    const { context, emitAlert } = mockContext();
    const converter = registerSensorViewConverter();

    converter({} as SensorView, dummyEvent, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensorview-missing-groundtruth",
    );
  });

  it("returns empty SceneUpdate when global_ground_truth is missing", () => {
    const { context } = mockContext();
    const converter = registerSensorViewConverter();

    const result = converter({} as SensorView, dummyEvent, undefined, context) as {
      deletions: unknown[];
      entities: unknown[];
    };

    expect(result.deletions).toEqual([]);
    expect(result.entities).toEqual([]);
  });
});

describe("emitAlert — SensorData FrameTransforms", () => {
  it("emits warn when mounting_position is missing", () => {
    const { context, emitAlert } = mockContext();
    const msg = { timestamp: baseTimestamp } as SensorData;

    convertSensorDataToFrameTransforms(msg, undefined, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensordata-frametransforms-missing-mounting-position",
    );
  });

  it("returns empty transforms when mounting_position is missing", () => {
    const { context } = mockContext();
    const msg = { timestamp: baseTimestamp } as SensorData;

    const result = convertSensorDataToFrameTransforms(msg, undefined, undefined, context);

    expect(result.transforms).toHaveLength(0);
  });
});

describe("emitAlert — SensorData SceneUpdate", () => {
  const dummyEvent = {} as any;

  it("emits info alert only once per registered converter instance", () => {
    const { context, emitAlert } = mockContext();
    const converter = registerSensorDataSceneUpdateConverter();
    const msg = {
      timestamp: baseTimestamp,
      lane_boundary: [],
    } as unknown as SensorData;

    converter(msg, dummyEvent, undefined, context);
    converter(msg, dummyEvent, undefined, context);

    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "info",
        message: "SensorData conversion is in early stages",
      }),
      "sensordata-conversion-info",
    );
    expect(emitAlert).toHaveBeenCalledTimes(1);
  });
});
