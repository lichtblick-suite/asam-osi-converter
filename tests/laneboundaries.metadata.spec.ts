import { buildLaneBoundaryMetadata } from "@features/lanes/metadata";
import {
  LaneBoundary_BoundaryPoint,
  LaneBoundary_Classification_Type,
  LaneBoundary,
  LaneBoundary_Classification_Color,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

describe("OSI Visualizer: Lane Boundaries", () => {
  it("builds metadata for lane boundaries", () => {
    const mockLaneBoundaryPoint = {
      position: { x: 0, y: 0, z: 0 },
      width: 2.0,
      height: 0.0,
    } as DeepRequired<LaneBoundary_BoundaryPoint>;
    const mockLaneBoundary = {
      id: { value: 123 },
      classification: {
        type: LaneBoundary_Classification_Type.SOLID_LINE,
      },
      boundary_line: [mockLaneBoundaryPoint],
    } as DeepRequired<LaneBoundary>;

    expect(buildLaneBoundaryMetadata(mockLaneBoundary)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "type",
          value: LaneBoundary_Classification_Type[mockLaneBoundary.classification.type],
        }),
        expect.objectContaining({
          key: "color",
          value: LaneBoundary_Classification_Color[mockLaneBoundary.classification.color],
        }),
        expect.objectContaining({
          key: "width",
          value: mockLaneBoundaryPoint.width.toString(),
        }),
        expect.objectContaining({
          key: "height",
          value: mockLaneBoundaryPoint.height.toString(),
        }),
      ]),
    );
  });
});
