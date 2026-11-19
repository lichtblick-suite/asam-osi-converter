import { buildRoadMarkingEntity } from "@features/roadmarkings";
import { Quaternion } from "@foxglove/schemas";
import {
  RoadMarking,
  RoadMarking_Classification_Color,
  RoadMarking_Classification_Type,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import { eulerToQuaternion, invertQuaternion, pointRotationByQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import { GroundTruthPanelSettings } from "@/converters/groundTruth/types";

const DEFAULT_TEST_CONFIG: GroundTruthPanelSettings = {
  caching: true,
  showAxes: true,
  showPhysicalLanes: true,
  showLogicalLanes: false,
  showReferenceLines: true,
  showBoundingBox: true,
  show3dModels: false,
  defaultModelPath: "/opt/models/vehicles/",
};

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
    type: number;
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
      type: overrides.type ?? RoadMarking_Classification_Type.PAINTED_TRAFFIC_SIGN,
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
    it("returns undefined for road markings other than STOP and ZEBRA_CROSSING", () => {
      const marking = createRoadMarking({ mainSignType: 0 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeUndefined();
    });

    it("returns entity for STOP road markings", () => {
      const marking = createRoadMarking();
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeDefined();
      expect(result!.id).toBe("road_marking_1");
    });

    it("returns entity for ZEBRA_CROSSING road markings", () => {
      const marking = createRoadMarking({
        mainSignType: TrafficSign_MainSign_Classification_Type.ZEBRA_CROSSING,
      });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeDefined();
      expect(result!.id).toBe("road_marking_1");
    });
  });

  describe("zebra crossing stripes", () => {
    const ZEBRA = TrafficSign_MainSign_Classification_Type.ZEBRA_CROSSING;
    const SYMBOLIC = RoadMarking_Classification_Type.SYMBOLIC_TRAFFIC_SIGN;

    it("renders non-symbolic zebra crossings (e.g. painted StVO 350 image) as one solid box", () => {
      const marking = createRoadMarking({
        type: RoadMarking_Classification_Type.PAINTED_TRAFFIC_SIGN,
        mainSignType: ZEBRA,
        width: 4,
      });
      const cubes = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined)!.cubes!;

      expect(cubes).toHaveLength(1);
      expect(cubes[0]!.size!.y).toBe(4);
    });

    it("splits the width into centered stripes along local y spanning the full height", () => {
      const marking = createRoadMarking({
        type: SYMBOLIC,
        mainSignType: ZEBRA,
        x: 10,
        y: 20,
        z: 1,
        width: 4,
        length: 0.1,
        height: 3,
      });
      const cubes = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined)!.cubes!;

      expect(cubes.map((c) => c!.pose!.position!.y)).toEqual([18.5, 19.5, 20.5, 21.5]);
      for (const cube of cubes) {
        expect(cube!.pose!.position!.x).toBe(10);
        expect(cube!.pose!.position!.z).toBe(1);
        expect(cube!.size).toEqual({ x: 0.1, y: 0.5, z: 3 });
        expect(cube!.pose!.orientation).toEqual(eulerToQuaternion(0, 0, 0));
      }
    });

    it("rotates stripe offsets with the OSI road marking orientation (flat on the road)", () => {
      // pitch = -pi/2 turns local x (view normal) to the sky; with yaw = pi/2 local y
      // points along global -x, so stripes are laid out along global x at constant z.
      const marking = createRoadMarking({
        type: SYMBOLIC,
        mainSignType: ZEBRA,
        x: 5,
        y: 7,
        z: 0.5,
        pitch: -Math.PI / 2,
        yaw: Math.PI / 2,
        width: 2,
        length: 0.1,
        height: 4,
      });
      const cubes = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined)!.cubes!;

      expect(cubes).toHaveLength(2);
      const expectedX = [5.5, 4.5];
      cubes.forEach((cube, i) => {
        expect(cube!.pose!.position!.x).toBeCloseTo(expectedX[i]!, 9);
        expect(cube!.pose!.position!.y).toBeCloseTo(7, 9);
        expect(cube!.pose!.position!.z).toBeCloseTo(0.5, 9);
        expect(cube!.pose!.orientation).toEqual(eulerToQuaternion(0, -Math.PI / 2, Math.PI / 2));
      });
    });

    it("renders a single stripe no wider than the marking for narrow widths", () => {
      const marking = createRoadMarking({
        type: SYMBOLIC,
        mainSignType: ZEBRA,
        x: 1,
        y: 2,
        width: 0.3,
      });
      const cubes = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined)!.cubes!;

      expect(cubes).toHaveLength(1);
      expect(cubes[0]!.pose!.position).toEqual({ x: 1, y: 2, z: 0 });
      expect(cubes[0]!.size!.y).toBeCloseTo(0.3);
    });

    it("does not throw for a non-finite width", () => {
      const marking = createRoadMarking({ type: SYMBOLIC, mainSignType: ZEBRA, width: Infinity });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);

      expect(result!.cubes).toHaveLength(1);
    });

    // Orientations from example-data/MovingHostWithStopLineVariations.mcap (gimbal lock,
    // roll/yaw trade-off, tilted markings).
    it.each([
      [0, -Math.PI / 2, 0],
      [0, -Math.PI / 2, Math.PI],
      [0.5236, -Math.PI / 2, 0],
      [0, -1.1345, 0],
      [0.5236, -1.1345, Math.PI / 2],
      [-0.5236, -2.0071, Math.PI / 2],
    ])("keeps stripes inside the STOP-rendered bounding box (rpy %f, %f, %f)", (r, p, y) => {
      const base = { x: 30, y: -35, z: 0.5, roll: r, pitch: p, yaw: y };
      const dims = { width: 4, length: 0.004, height: 3 };
      const stop = buildRoadMarkingEntity(
        createRoadMarking({ ...base, ...dims }),
        PREFIX,
        FRAME,
        TIME,
        undefined,
      )!.cubes![0]!;
      const stripes = buildRoadMarkingEntity(
        createRoadMarking({ ...base, ...dims, type: SYMBOLIC, mainSignType: ZEBRA }),
        PREFIX,
        FRAME,
        TIME,
        undefined,
      )!.cubes!;
      const toBoxFrame = invertQuaternion(stop.pose!.orientation as Quaternion);
      const center = stop.pose!.position!;

      expect(stripes).toHaveLength(4);
      for (const stripe of stripes) {
        expect(stripe!.pose!.orientation).toEqual(stop.pose!.orientation);
        const pos = stripe!.pose!.position!;
        const local = pointRotationByQuaternion(
          { x: pos.x! - center.x!, y: pos.y! - center.y!, z: pos.z! - center.z! },
          toBoxFrame,
        );
        expect(local.x).toBeCloseTo(0, 9);
        expect(local.z).toBeCloseTo(0, 9);
        expect(Math.abs(local.y) + stripe!.size!.y! / 2).toBeLessThanOrEqual(
          stop.size!.y! / 2 + 1e-9,
        );
        expect(stripe!.size!.x).toBe(stop.size!.x);
        expect(stripe!.size!.z).toBe(stop.size!.z);
      }
    });
  });

  describe("position and centering", () => {
    it("places the cube centered on base.position", () => {
      const marking = createRoadMarking({ x: 100, y: 200, z: 5 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeDefined();

      const cube = result!.cubes![0]!;
      expect(cube.pose!.position).toEqual({ x: 100, y: 200, z: 5 });
    });

    it("does not offset the cube from base.position (old bug: started at edge)", () => {
      const marking = createRoadMarking({ x: 50, y: 30, z: 0, length: 10 });
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
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
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeDefined();

      const metadata = result!.metadata!;
      expect(metadata).toEqual(
        expect.arrayContaining([
          { key: "type", value: "PAINTED_TRAFFIC_SIGN" },
          { key: "traffic_main_sign_type", value: "STOP" },
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
      const result = buildRoadMarkingEntity(
        marking,
        PREFIX,
        "test_frame",
        { sec: 10, nsec: 500 },
        undefined,
      );
      expect(result).toBeDefined();

      expect(result!.frame_id).toBe("test_frame");
      expect(result!.timestamp).toEqual({ sec: 10, nsec: 500 });
      expect(result!.frame_locked).toBe(true);
      expect(result!.id).toBe("road_marking_42");
    });
  });

  describe("axes display", () => {
    it("shows axes when config.showAxes is true", () => {
      const marking = createRoadMarking();
      const config = { ...DEFAULT_TEST_CONFIG, showAxes: true };
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, config);
      expect(result).toBeDefined();
      expect(result!.arrows).toBeDefined();
      expect(result!.arrows!.length).toBe(3);
    });

    it("hides axes when config.showAxes is false", () => {
      const marking = createRoadMarking();
      const config = { ...DEFAULT_TEST_CONFIG, showAxes: false };
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, config);
      expect(result).toBeDefined();
      expect(result!.arrows).toEqual([]);
    });

    it("hides axes when no config is provided", () => {
      const marking = createRoadMarking();
      const result = buildRoadMarkingEntity(marking, PREFIX, FRAME, TIME, undefined);
      expect(result).toBeDefined();
      expect(result!.arrows).toEqual([]);
    });
  });
});
