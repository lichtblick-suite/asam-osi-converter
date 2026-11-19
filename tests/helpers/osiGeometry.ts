/**
 * Independent reference model of the OSI geometry for road marking verification.
 *
 * Implements the normative OSI v3.8.0 formulas directly with rotation matrices, without the
 * converter's quaternion utilities:
 * - Orientation3d: R = Rz(yaw) * Ry(pitch) * Rx(roll), v_global = R * v_local + position
 * - BaseStationary: position is the box center; length/width/height lie along local x/y/z
 * - RoadMarking: local x is the view normal of the 2D image area, local z points from the
 *   image's bottom to its top
 *
 * Shared by the Jest geometry proofs and the Playwright render probe.
 */
import {
  RoadMarking_Classification_Color,
  RoadMarking_Classification_Type,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";

import {
  ROAD_MARKING_COLOR,
  ZEBRA_CROSSING_STRIPE_GAP,
  ZEBRA_CROSSING_STRIPE_WIDTH,
} from "@/config/constants";

export type Vec3 = readonly [number, number, number];
/** Row-major 3x3 matrix. */
export type Mat3 = readonly [Vec3, Vec3, Vec3];

export interface Orientation {
  roll: number;
  pitch: number;
  yaw: number;
}
export interface Dimension {
  length: number;
  width: number;
  height: number;
}
export interface Box {
  center: Vec3;
  rotation: Mat3;
  /** Edge lengths along local x/y/z (length, width, height). */
  size: Vec3;
}

/** The subset of an OSI RoadMarking (snake_case, as in the proto) used by the model. */
export interface RoadMarkingLike {
  id: { value: number };
  base: {
    position: { x: number; y: number; z: number };
    orientation: Orientation;
    dimension: Dimension;
  };
  classification: {
    type: RoadMarking_Classification_Type;
    traffic_main_sign_type: TrafficSign_MainSign_Classification_Type;
    monochrome_color: RoadMarking_Classification_Color;
    assigned_lane_id?: { value: number }[];
  };
}

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: Vec3): number => Math.sqrt(dot(a, a));
export const normalize = (a: Vec3): Vec3 => scale(a, 1 / norm(a));

export function apply(m: Mat3, v: Vec3): Vec3 {
  return [dot(m[0], v), dot(m[1], v), dot(m[2], v)];
}

export function column(m: Mat3, i: 0 | 1 | 2): Vec3 {
  return [m[0][i], m[1][i], m[2][i]];
}

export function transpose(m: Mat3): Mat3 {
  return [column(m, 0), column(m, 1), column(m, 2)];
}

export function multiply(a: Mat3, b: Mat3): Mat3 {
  const bt = transpose(b);
  const row = (r: Vec3): Vec3 => [dot(r, bt[0]), dot(r, bt[1]), dot(r, bt[2])];
  return [row(a[0]), row(a[1]), row(a[2])];
}

export function maxAbsDifference(a: Mat3, b: Mat3): number {
  return Math.max(...a.flatMap((row, i) => row.map((v, j) => Math.abs(v - b[i]![j]!))));
}

export function rotX(a: number): Mat3 {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c],
  ];
}

export function rotY(a: number): Mat3 {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ];
}

export function rotZ(a: number): Mat3 {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}

/** OSI Orientation3d: R = Rz(yaw) * Ry(pitch) * Rx(roll). */
export function rotationMatrix({ roll, pitch, yaw }: Orientation): Mat3 {
  return multiply(rotZ(yaw), multiply(rotY(pitch), rotX(roll)));
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export function quaternionToMatrix({ x, y, z, w }: Quat): Mat3 {
  return [
    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
  ];
}

/** Shepperd's method: numerically stable rotation matrix to unit quaternion. */
export function matrixToQuaternion(m: Mat3): Quat {
  const trace = m[0][0] + m[1][1] + m[2][2];
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    return {
      x: (m[2][1] - m[1][2]) / s,
      y: (m[0][2] - m[2][0]) / s,
      z: (m[1][0] - m[0][1]) / s,
      w: s / 4,
    };
  }
  const diag = [m[0][0], m[1][1], m[2][2]];
  const i = diag.indexOf(Math.max(...diag)) as 0 | 1 | 2;
  const j = ((i + 1) % 3) as 0 | 1 | 2;
  const k = ((i + 2) % 3) as 0 | 1 | 2;
  const s = Math.sqrt(1 + m[i][i] - m[j][j] - m[k][k]) * 2;
  const q = [0, 0, 0];
  q[i] = s / 4;
  q[j] = (m[j][i] + m[i][j]) / s;
  q[k] = (m[k][i] + m[i][k]) / s;
  return { x: q[0]!, y: q[1]!, z: q[2]!, w: (m[k][j] - m[j][k]) / s };
}

export function boxCorners({ center, rotation, size }: Box): Vec3[] {
  const corners: Vec3[] = [];
  for (const sx of [-0.5, 0.5]) {
    for (const sy of [-0.5, 0.5]) {
      for (const sz of [-0.5, 0.5]) {
        corners.push(add(center, apply(rotation, [sx * size[0], sy * size[1], sz * size[2]])));
      }
    }
  }
  return corners;
}

/** Half of the box's extent along the unit vector n: 1/2 * sum(|n . R e_i| * size_i). */
export function halfExtentAlong({ rotation, size }: Box, n: Vec3): number {
  return (
    0.5 *
    ([0, 1, 2] as const).reduce<number>(
      (sum, i) => sum + Math.abs(dot(n, column(rotation, i))) * size[i],
      0,
    )
  );
}

/** Symmetric Hausdorff distance between two point sets (e.g. box corners). */
export function pointSetDistance(a: readonly Vec3[], b: readonly Vec3[]): number {
  const directed = (p: readonly Vec3[], q: readonly Vec3[]) =>
    Math.max(...p.map((x) => Math.min(...q.map((y) => norm(sub(x, y))))));
  return Math.max(directed(a, b), directed(b, a));
}

export type Convention = (o: Orientation, d: Dimension) => { rotation: Mat3; size: Vec3 };

export const OSI_CONVENTION: Convention = (o, d) => ({
  rotation: rotationMatrix(o),
  size: [d.length, d.width, d.height],
});

/** Plausible implementation mistakes; the probe set must be able to tell each one apart. */
export const WRONG_CONVENTIONS: Record<string, Convention> = {
  "transposed rotation R^T": (o, d) => ({
    rotation: transpose(rotationMatrix(o)),
    size: [d.length, d.width, d.height],
  }),
  "Euler order Rx*Ry*Rz": (o, d) => ({
    rotation: multiply(rotX(o.roll), multiply(rotY(o.pitch), rotZ(o.yaw))),
    size: [d.length, d.width, d.height],
  }),
  "length and width swapped": (o, d) => ({
    rotation: rotationMatrix(o),
    size: [d.width, d.length, d.height],
  }),
  "PR #186 correction R*Ry(-90deg)*Rx(180deg)": (o, d) => ({
    rotation: multiply(rotationMatrix(o), multiply(rotY(-Math.PI / 2), rotX(Math.PI))),
    size: [d.length, d.width, d.height],
  }),
  "mirrored yaw": (o, d) => ({
    rotation: rotationMatrix({ ...o, yaw: -o.yaw }),
    size: [d.length, d.width, d.height],
  }),
};

/**
 * Boxes the converter is expected to render for a road marking. Zebra crossings of type
 * SYMBOLIC_TRAFFIC_SIGN are split along local y into the converter's stripe pattern.
 */
export function predictRoadMarkingBoxes(
  marking: RoadMarkingLike,
  convention: Convention = OSI_CONVENTION,
): Box[] {
  const { position, orientation, dimension } = marking.base;
  const center: Vec3 = [position.x, position.y, position.z];
  const { rotation, size } = convention(orientation, dimension);
  const isStripedZebra =
    marking.classification.traffic_main_sign_type ===
      TrafficSign_MainSign_Classification_Type.ZEBRA_CROSSING &&
    marking.classification.type === RoadMarking_Classification_Type.SYMBOLIC_TRAFFIC_SIGN;
  if (!isStripedZebra) {
    return [{ center, rotation, size }];
  }
  const spacing = ZEBRA_CROSSING_STRIPE_WIDTH + ZEBRA_CROSSING_STRIPE_GAP;
  const count = Math.max(1, Math.floor((size[1] + ZEBRA_CROSSING_STRIPE_GAP) / spacing));
  const stripeWidth = Math.min(ZEBRA_CROSSING_STRIPE_WIDTH, size[1]);
  const pattern = count * stripeWidth + (count - 1) * ZEBRA_CROSSING_STRIPE_GAP;
  return Array.from({ length: count }, (_, i) => ({
    center: add(center, apply(rotation, [0, -pattern / 2 + stripeWidth / 2 + i * spacing, 0])),
    rotation,
    size: [size[0], stripeWidth, size[2]],
  }));
}

export const PROBE_CENTER: Vec3 = [1000, 1000, 0];

export interface ProbeMarking extends RoadMarkingLike {
  name: string;
  rgb: Vec3;
}

function probe(
  id: number,
  name: string,
  color: RoadMarking_Classification_Color,
  mainSignType: TrafficSign_MainSign_Classification_Type,
  offset: Vec3,
  orientation: Orientation,
  dimension: Dimension,
): ProbeMarking {
  const c = ROAD_MARKING_COLOR[color];
  const [x, y, z] = add(PROBE_CENTER, offset);
  return {
    name,
    rgb: [c.r, c.g, c.b],
    id: { value: id },
    base: { position: { x, y, z }, orientation, dimension },
    classification: {
      type: RoadMarking_Classification_Type.SYMBOLIC_TRAFFIC_SIGN,
      traffic_main_sign_type: mainSignType,
      monochrome_color: color,
    },
  };
}

const { PI } = Math;
const { STOP, ZEBRA_CROSSING } = TrafficSign_MainSign_Classification_Type;
const COLOR = RoadMarking_Classification_Color;

/**
 * Six road markings with distinct colors. Flat (spec-compliant) poses, a gimbal-lock twin
 * (green/blue describe the same rotation), the identity pose of an upright marking (yellow),
 * a general rotation (orange) and a striped zebra crossing (violet).
 */
export const PROBE_MARKINGS: readonly ProbeMarking[] = [
  probe(
    9000,
    "red",
    COLOR.RED,
    STOP,
    [-6, 3.5, 0.005],
    { roll: 0, pitch: -PI / 2, yaw: PI },
    {
      length: 0.01,
      width: 4,
      height: 1,
    },
  ),
  probe(
    9001,
    "green",
    COLOR.GREEN,
    STOP,
    [0, 3.5, 0.005],
    { roll: 0, pitch: -PI / 2, yaw: PI + PI / 6 },
    { length: 0.01, width: 4, height: 1 },
  ),
  probe(
    9002,
    "blue",
    COLOR.BLUE,
    STOP,
    [6, 3.5, 0.005],
    { roll: PI / 6, pitch: -PI / 2, yaw: PI },
    { length: 0.01, width: 4, height: 1 },
  ),
  probe(
    9003,
    "yellow",
    COLOR.YELLOW,
    STOP,
    [-6, -3.5, 0],
    { roll: 0, pitch: 0, yaw: 0 },
    {
      length: 0.5,
      width: 3.7,
      height: 4.5,
    },
  ),
  probe(
    9004,
    "orange",
    COLOR.ORANGE,
    STOP,
    [0, -3.5, 1],
    { roll: 0.4, pitch: -0.9, yaw: 2.2 },
    { length: 0.3, width: 2.5, height: 1.5 },
  ),
  probe(
    9005,
    "violet",
    COLOR.VIOLET,
    ZEBRA_CROSSING,
    [6, -3.5, 0.005],
    { roll: 0, pitch: -PI / 2, yaw: PI + PI / 6 },
    { length: 0.01, width: 4, height: 3 },
  ),
];
