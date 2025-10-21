import { TRAFFIC_LIGHT_COLOR } from "@/config/colors";
import { buildTrafficLightModel } from "@features/trafficlights";
import { TrafficLight } from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

const mockImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

jest.mock("../trafficlights/images", () => ({
  get 2() {
    return mockImage;
  },
}));

describe("OsiGroundTruthVisualizer: 3D Models", () => {
  it("builds a static traffic light model", () => {
    const mockTrafficLightStatic = {
      base: {
        dimension: {
          width: 1,
          height: 1,
          length: 1,
        },
        position: {
          x: 1,
          y: 1,
          z: 1,
        },
        orientation: {
          pitch: 0,
          yaw: 0,
          roll: 1,
        },
      },
      classification: {
        icon: 2,
        color: 2,
        mode: 2,
      },
    } as DeepRequired<TrafficLight>;
    const mockColor = TRAFFIC_LIGHT_COLOR[mockTrafficLightStatic.classification.color].code;

    expect(buildTrafficLightModel(mockTrafficLightStatic, mockColor)).toEqual(
      expect.objectContaining({
        data: expect.any(Uint8Array),
      }),
    );
  });
});
