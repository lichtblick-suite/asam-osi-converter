import { buildTrafficSignModel, preloadDynamicTextures } from "@features/trafficsigns";
import { TrafficSign_MainSign, TrafficSignValue_Unit } from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

const mockImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const mockImagesMain = {
  0: mockImage,
  1: mockImage,
};
const mockImagesSupp = {};
jest.mock("@features/trafficsigns/images", () => ({
  get main() {
    return mockImagesMain;
  },
  get supplementary() {
    return mockImagesSupp;
  },
}));

const mockMainTextureHandlerMap = new Map([
  [
    1,
    {
      getText: () => "",
      getOptions: () => ({}),
    },
  ],
]);
const mockSuppTextureHandlerMap = new Map();
const mockFnDrawTrafficSignText = jest.fn().mockReturnValue(mockImage);
jest.mock("@features/trafficsigns/textures", () => ({
  drawTrafficSignText: () => mockFnDrawTrafficSignText() as unknown,
  get main() {
    return mockMainTextureHandlerMap;
  },
  get supplementary() {
    return mockSuppTextureHandlerMap;
  },
}));

describe("OsiGroundTruthVisualizer: 3D Models", () => {
  beforeEach(() => {
    mockFnDrawTrafficSignText.mockClear();
  });

  it("preloads the textures included in the handlers map", () => {
    const result = preloadDynamicTextures();
    expect(result).toHaveLength(mockMainTextureHandlerMap.size + mockSuppTextureHandlerMap.size);
  });

  it("builds a static traffic sign model", () => {
    const mockMainSignStatic = {
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
        type: 0,
        value: 1,
      },
    } as unknown as DeepRequired<TrafficSign_MainSign>;

    expect(buildTrafficSignModel("main", mockMainSignStatic)).toEqual(
      expect.objectContaining({
        data: expect.any(Uint8Array) as unknown,
      }),
    );
    expect(mockFnDrawTrafficSignText).not.toHaveBeenCalled();
  });

  it("builds a dynamic traffic sign model", () => {
    const mockMainSignDynamic = {
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
        type: 1,
        value: {
          value: 10,
          unit: TrafficSignValue_Unit.KILOMETER_PER_HOUR,
          text: "",
        },
      },
    } as unknown as DeepRequired<TrafficSign_MainSign>;

    expect(buildTrafficSignModel("main", mockMainSignDynamic)).toEqual(
      expect.objectContaining({
        data: expect.any(Uint8Array) as unknown,
      }),
    );
    expect(mockFnDrawTrafficSignText).toHaveBeenCalledTimes(1);
  });
});
