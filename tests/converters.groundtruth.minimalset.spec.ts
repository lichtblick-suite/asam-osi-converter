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
        },
        type: MovingObject_Type.VEHICLE,
      },
    ],
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
