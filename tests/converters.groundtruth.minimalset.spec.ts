import { registerGroundTruthConverter } from "@converters";
import { SceneUpdate } from "@foxglove/schemas";
import { GroundTruth, MovingObject_Type } from "@lichtblick/asam-osi-types";
import { DeepPartial } from "ts-essentials";

const mockImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

jest.mock("@features/trafficlights/images", () => ({
  get 2() {
    return mockImage;
  },
}));

jest.mock("@features/trafficsigns/images", () => ({
  get 2() {
    return mockImage;
  },
}));

describe("Run converter with minimal GroundTruth message", () => {
  let consoleErrorSpy: jest.SpyInstance;
  const minimalGroundTruth: GroundTruth = {
    timestamp: {
      seconds: 0,
      nanos: 0,
    },
    moving_object: [
      {
        id: { value: 0 },
        base: {
          position: { x: 0, y: 0, z: 0 },
          orientation: { yaw: 0, pitch: 0, roll: 0 },
          dimension: { length: 1, width: 1, height: 1 },
          base_polygon: [],
          bounding_box_section: [],
        },
        type: MovingObject_Type.TYPE_VEHICLE,
        assigned_lane_id: [],
        model_reference: "",
        future_trajectory: [],
        source_reference: [],
      },
    ],
    stationary_object: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    lane_boundary: [],
    lane: [],
    occupant: [],
    country_code: 0,
    proj_string: "",
    map_reference: "",
    model_reference: "",
    reference_line: [],
    logical_lane_boundary: [],
    logical_lane: [],
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("runs without throwing or logging errors", () => {
    const groundTruthConverter = registerGroundTruthConverter();

    let sceneUpdateOutput: DeepPartial<SceneUpdate> | undefined;

    expect(() => {
      sceneUpdateOutput = groundTruthConverter(minimalGroundTruth);
    }).not.toThrow();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(sceneUpdateOutput).toBeDefined();
  });
});
