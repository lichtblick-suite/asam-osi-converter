import { buildRoadMarkingEntity } from "@features/roadmarkings";
import {
  RoadMarking,
  RoadMarking_Classification_Color,
  RoadMarking_Classification_Type,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

function createRoadMarking(
  overrides: Partial<{
    id: number;
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
    width: number;
    length: number;
    height: number;
    mainSignType: number;
    color: number;
  }> = {},
): DeepRequired<RoadMarking> {
  return {
    id: { value: overrides.id ?? 1 },
    base: {
      position: {
        x: overrides.x ?? 0,
        y: overrides.y ?? 0,
        z: overrides.z ?? 0,
      },
      orientation: {
        roll: overrides.roll ?? 0,
        pitch: overrides.pitch ?? 0,
        yaw: overrides.yaw ?? 0,
      },
      dimension: {
        width: overrides.width ?? 4,
        length: overrides.length ?? 0.3,
        height: overrides.height ?? 0.004,
      },
    },
    classification: {
      type: RoadMarking_Classification_Type.PAINTED_TRAFFIC_SIGN,
      monochrome_color: overrides.color ?? RoadMarking_Classification_Color.WHITE,
      traffic_main_sign_type:
        overrides.mainSignType ?? TrafficSign_MainSign_Classification_Type.STOP,
      value: 0,
      color_description: "",
      traffic_supplementary_sign_type: 0,
    },
  } as unknown as DeepRequired<RoadMarking>;
}

const PREFIX = "road_marking";
const FRAME = "global";
const TIME = { sec: 0, nsec: 0 };

describe("buildRoadMarkingEntity", () => {
  describe("filtering", () => {
    it("returns undefined for non-STOP road markings", () => {
      const marking = createRoadMarking({ mainSignType: 0 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeUndefined();
    });

    it("returns entity for STOP road markings", () => {
      const marking = createRoadMarking();
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();
      expect(result!.id).toBe("road_marking_1");
    });
  });

  describe("position and centering", () => {
    it("places the cube centered on base.position", () => {
      const marking = createRoadMarking({ x: 100, y: 200, z: 5 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      expect(cube.pose!.position).toEqual({ x: 100, y: 200, z: 5 });
    });

    it("does not offset the cube from base.position (old bug: started at edge)", () => {
      const marking = createRoadMarking({ x: 50, y: 30, z: 0, length: 10 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      // The cube must be centered at position, not shifted by length/height
      expect(cube.pose!.position).toEqual({ x: 50, y: 30, z: 0 });
    });
  });

  describe("orientation", () => {
    it("applies orientation from base.orientation", () => {
      const yaw = Math.PI / 4;
      const marking = createRoadMarking({ yaw });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      const expected = eulerToQuaternion(0, 0, yaw);
      expect(cube.pose!.orientation!.w).toBeCloseTo(expected.w, 6);
      expect(cube.pose!.orientation!.x).toBeCloseTo(expected.x, 6);
      expect(cube.pose!.orientation!.y).toBeCloseTo(expected.y, 6);
      expect(cube.pose!.orientation!.z).toBeCloseTo(expected.z, 6);
    });

    it("applies combined roll, pitch, yaw orientation", () => {
      const marking = createRoadMarking({
        roll: 0.1,
        pitch: -Math.PI / 2,
        yaw: Math.PI / 3,
      });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      const expected = eulerToQuaternion(0.1, -Math.PI / 2, Math.PI / 3);
      expect(cube.pose!.orientation!.w).toBeCloseTo(expected.w, 6);
      expect(cube.pose!.orientation!.x).toBeCloseTo(expected.x, 6);
      expect(cube.pose!.orientation!.y).toBeCloseTo(expected.y, 6);
      expect(cube.pose!.orientation!.z).toBeCloseTo(expected.z, 6);
    });
  });

  describe("dimension mapping", () => {
    it("maps OSI dimensions correctly to cube size", () => {
      // objectToCubePrimitive: size.x=length, size.y=width, size.z=height
      const marking = createRoadMarking({
        length: 0.3,
        width: 4.0,
        height: 0.004,
      });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      expect(cube.size!.x).toBeCloseTo(0.3); // length (along local x)
      expect(cube.size!.y).toBeCloseTo(4.0); // width (along local y)
      expect(cube.size!.z).toBeCloseTo(0.004); // height (along local z)
    });

    it("passes through non-trivial orientation as quaternion", () => {
      const marking = createRoadMarking({
        length: 0.3,
        width: 4.0,
        height: 0.004,
        roll: 0.1,
        pitch: 0.2,
        yaw: 0.3,
      });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      const expected = eulerToQuaternion(0.1, 0.2, 0.3);
      expect(cube.pose!.orientation).toEqual(expected);
      expect(cube.size).toEqual({ x: 0.3, y: 4.0, z: 0.004 });
    });
  });

  describe("color", () => {
    it("uses the classification color", () => {
      const marking = createRoadMarking({ color: RoadMarking_Classification_Color.RED });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      expect(cube.color!.a).toBe(1);
      // RED color should have high r component
      expect(cube.color!.r).toBeGreaterThan(0.5);
    });
  });

  describe("metadata", () => {
    it("includes type, color, width, and height in metadata", () => {
      const marking = createRoadMarking({ width: 5, height: 0.3 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME);
      expect(result).toBeDefined();

      const metadata = result!.metadata!;
      expect(metadata).toEqual(
        expect.arrayContaining([
          { key: "type", value: "PAINTED_TRAFFIC_SIGN" },
          { key: "color", value: "WHITE" },
          { key: "width", value: "5" },
          { key: "height", value: "0.3" },
        ]),
      );
    });
  });

  describe("scene entity properties", () => {
    it("sets correct frame_id, timestamp, and frame_locked", () => {
      const marking = createRoadMarking({ id: 42 });
      const result = buildRoadMarkingEntity(marking, PREFIX, "test_frame", { sec: 10, nsec: 500 });
      expect(result).toBeDefined();

      expect(result!.frame_id).toBe("test_frame");
      expect(result!.timestamp).toEqual({ sec: 10, nsec: 500 });
      expect(result!.frame_locked).toBe(true);
      expect(result!.id).toBe("road_marking_42");
    });
  });
});
