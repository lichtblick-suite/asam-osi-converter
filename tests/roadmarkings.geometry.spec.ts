import { buildRoadMarkingEntity } from "@features/roadmarkings";
import { CubePrimitive } from "@foxglove/schemas";
import { RoadMarking } from "@lichtblick/asam-osi-types";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  Box,
  boxCorners,
  column,
  halfExtentAlong,
  maxAbsDifference,
  norm,
  pointSetDistance,
  predictRoadMarkingBoxes,
  PROBE_MARKINGS,
  quaternionToMatrix,
  RoadMarkingLike,
  rotationMatrix,
  sub,
  Vec3,
  WRONG_CONVENTIONS,
} from "./helpers/osiGeometry";

const { PI } = Math;
const ANGLES = [
  -PI,
  (-3 * PI) / 4,
  -PI / 2,
  -PI / 4,
  -0.3,
  0,
  0.3,
  PI / 4,
  PI / 2,
  (3 * PI) / 4,
  PI,
];
const ANGLE_GRID = ANGLES.flatMap((roll) =>
  ANGLES.flatMap((pitch) => ANGLES.map((yaw) => ({ roll, pitch, yaw }))),
);
const UP: Vec3 = [0, 0, 1];
const ORIGIN: Vec3 = [0, 0, 0];

function convertedBoxes(marking: RoadMarkingLike): Box[] {
  const entity = buildRoadMarkingEntity(
    marking as unknown as DeepRequired<RoadMarking>,
    "road_marking",
    "global",
    { sec: 0, nsec: 0 },
    undefined,
  );
  return (entity!.cubes as CubePrimitive[]).map((cube) => ({
    center: [cube.pose.position.x, cube.pose.position.y, cube.pose.position.z],
    rotation: quaternionToMatrix(cube.pose.orientation),
    size: [cube.size.x, cube.size.y, cube.size.z],
  }));
}

describe("OSI road marking geometry (numeric proofs of the spec formulas)", () => {
  it("lays a marking flat only at pitch = -pi/2, since (R e_x)_z = -sin(pitch)", () => {
    for (const o of ANGLE_GRID) {
      expect(column(rotationMatrix(o), 0)[2]).toBeCloseTo(-Math.sin(o.pitch), 12);
    }
  });

  it("keeps only yaw + roll observable for flat markings (gimbal lock)", () => {
    for (const { roll, yaw } of ANGLE_GRID) {
      const flat = rotationMatrix({ roll, pitch: -PI / 2, yaw });
      const folded = rotationMatrix({ roll: 0, pitch: -PI / 2, yaw: yaw + roll });
      expect(maxAbsDifference(flat, folded)).toBeLessThan(1e-12);
      // The image's bottom->top axis lies on the ground and points to yaw + roll + pi
      const zAxis = column(flat, 2);
      expect(norm(sub(zAxis, [-Math.cos(yaw + roll), -Math.sin(yaw + roll), 0]))).toBeLessThan(
        1e-12,
      );
    }
  });

  it("makes a flat marking `length` thick and an identity-oriented one `height` tall", () => {
    const size: Vec3 = [0.01, 3.71, 4.54];
    for (const { roll, yaw } of ANGLE_GRID) {
      const flat: Box = {
        center: ORIGIN,
        rotation: rotationMatrix({ roll, pitch: -PI / 2, yaw }),
        size,
      };
      expect(2 * halfExtentAlong(flat, UP)).toBeCloseTo(size[0], 12);
    }
    const upright: Box = {
      center: ORIGIN,
      rotation: rotationMatrix({ roll: 0, pitch: 0, yaw: 0 }),
      size,
    };
    expect(2 * halfExtentAlong(upright, UP)).toBeCloseTo(size[2], 12);
  });

  it.each(Object.keys(WRONG_CONVENTIONS))(
    "probe set distinguishes the OSI convention from: %s",
    (name) => {
      const separation = Math.max(
        ...PROBE_MARKINGS.flatMap((marking) => {
          const expected = predictRoadMarkingBoxes(marking).flatMap(boxCorners);
          const wrong = predictRoadMarkingBoxes(marking, WRONG_CONVENTIONS[name]).flatMap(
            boxCorners,
          );
          return pointSetDistance(expected, wrong);
        }),
      );
      expect(separation).toBeGreaterThan(0.5);
    },
  );
});

describe("road marking converter vs. OSI reference model", () => {
  it("eulerToQuaternion equals Rz(yaw) * Ry(pitch) * Rx(roll) for all angles", () => {
    for (const o of ANGLE_GRID) {
      const actual = quaternionToMatrix(eulerToQuaternion(o.roll, o.pitch, o.yaw));
      expect(maxAbsDifference(actual, rotationMatrix(o))).toBeLessThan(1e-12);
    }
  });

  it.each(PROBE_MARKINGS.map((marking) => [marking.name, marking] as const))(
    "renders the %s probe marking exactly as predicted",
    (_name, marking) => {
      const actual = convertedBoxes(marking);
      const expected = predictRoadMarkingBoxes(marking);
      expect(actual).toHaveLength(expected.length);
      actual.forEach((box, i) => {
        const prediction = expected[i]!;
        expect(norm(sub(box.center, prediction.center))).toBeLessThan(1e-9);
        expect(maxAbsDifference(box.rotation, prediction.rotation)).toBeLessThan(1e-12);
        expect(box.size).toEqual(prediction.size);
      });
    },
  );
});
