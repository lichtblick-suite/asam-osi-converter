import { buildTrafficLightModel, getModelCacheKey } from "@features/trafficlights";
import { TrafficLight } from "@lichtblick/asam-osi-types";

import { TRAFFIC_LIGHT_COLOR } from "@/config/constants";

const mockImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

jest.mock("@features/trafficlights/images", () => ({
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
    } as TrafficLight;
    const mockColor = TRAFFIC_LIGHT_COLOR[mockTrafficLightStatic.classification!.color].code;
    const modelCacheKey = getModelCacheKey(mockTrafficLightStatic.classification!, {
      sec: 0,
      nsec: 0,
    });

    expect(buildTrafficLightModel(mockTrafficLightStatic, mockColor, modelCacheKey)).toEqual(
      expect.objectContaining({
        data: expect.any(Uint8Array) as unknown,
      }),
    );
  });
});
