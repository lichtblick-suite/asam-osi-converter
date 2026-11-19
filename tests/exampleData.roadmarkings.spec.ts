/**
 * @jest-environment node
 */
/**
 * Audits every road marking of the first frame of each example trace against OSI geometry:
 *
 * - G1/G2 (Orientation3d + BaseStationary box + "road surface marking"): the box's thinnest
 *   axis is perpendicular to the road and its bottom lies on the road surface. These checks
 *   do not depend on the road marking axis convention.
 * - S1 (RoadMarking base): local x, the view normal of the 2D image area, is the road normal.
 * - S2 (RoadMarking base note): for assigned lanes the image's bottom->top axis (local z)
 *   roughly matches the lane's driving direction (either direction for zebra crossings).
 * - E1 (enum docs): UNKNOWN values must not be used in ground truth.
 *
 * The road surface is a plane fitted to lane boundary points near the marking, so sloped
 * roads are handled. Markings outside the mapped lanes are checked against global up.
 */
import {
  RoadMarking_Classification_Color,
  RoadMarking_Classification_Type,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import fs from "fs";
import path from "path";

import { groundTruthOf, readProtobufMessages } from "./helpers/mcap";
import {
  add,
  Box,
  column,
  dot,
  halfExtentAlong,
  norm,
  normalize,
  RoadMarkingLike,
  rotationMatrix,
  scale,
  sub,
  Vec3,
} from "./helpers/osiGeometry";

const EXAMPLE_DATA = path.resolve(__dirname, "..", "example-data");
const FILES = fs
  .readdirSync(EXAMPLE_DATA)
  .filter((file) => file.endsWith(".mcap"))
  .sort();

const ROAD_SEARCH_RADIUS = 6; // m
const MAX_TILT_DEG = 2;
const MAX_GAP = 0.05; // m
const MAX_LANE_ANGLE_DEG = 10;

interface Vector3d {
  x: number;
  y: number;
  z: number;
}
/** The subset of osi3.GroundTruth used by the audit, as decoded with protobuf defaults. */
interface GroundTruth {
  lane_boundary: { boundary_line: { position: Vector3d }[] }[];
  lane: {
    id: { value: number } | null;
    classification: { centerline: Vector3d[]; centerline_is_driving_direction: boolean } | null;
  }[];
  road_marking: RoadMarkingLike[];
}
interface Plane {
  point: Vec3;
  normal: Vec3;
}

const toVec = (p: Vector3d): Vec3 => [p.x, p.y, p.z];
const degrees = (cos: number) => (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;

function closestOnSegment(p: Vec3, a: Vec3, b: Vec3): { point: Vec3; direction: Vec3 } {
  const ab = sub(b, a);
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / Math.max(dot(ab, ab), 1e-12)));
  return { point: add(a, scale(ab, t)), direction: ab };
}

/** Least-squares plane z = a*x + b*y + c through lane boundary samples around p. */
function roadPlane(gt: GroundTruth, p: Vec3): Plane | undefined {
  const samples: Vec3[] = [];
  for (const boundary of gt.lane_boundary) {
    const line = boundary.boundary_line.map((bp) => toVec(bp.position));
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1]!;
      const b = line[i]!;
      const { point, direction } = closestOnSegment(p, a, b);
      if (norm(sub(point, p)) > ROAD_SEARCH_RADIUS || norm(direction) < 1e-9) {
        continue;
      }
      // Sample along the segment as well, so parallel straight boundaries span a plane
      const step = scale(normalize(direction), 1);
      samples.push(point, closestOnSegment(add(point, step), a, b).point);
      samples.push(closestOnSegment(sub(point, step), a, b).point);
    }
  }
  if (samples.length < 3) {
    return undefined;
  }
  const mean = scale(samples.reduce(add), 1 / samples.length);
  let [sxx, sxy, syy, sxz, syz] = [0, 0, 0, 0, 0];
  for (const s of samples) {
    const [x, y, z] = sub(s, mean);
    sxx += x * x;
    sxy += x * y;
    syy += y * y;
    sxz += x * z;
    syz += y * z;
  }
  const det = sxx * syy - sxy * sxy;
  if (Math.abs(det) < 1e-9) {
    return undefined;
  }
  const a = (sxz * syy - syz * sxy) / det;
  const b = (syz * sxx - sxz * sxy) / det;
  const z = mean[2] + a * (p[0] - mean[0]) + b * (p[1] - mean[1]);
  return { point: [p[0], p[1], z], normal: normalize([-a, -b, 1]) };
}

function laneDirection(gt: GroundTruth, laneId: number, p: Vec3): Vec3 | undefined {
  const classification = gt.lane.find((l) => l.id?.value === laneId)?.classification;
  const centerline = (classification?.centerline ?? []).map(toVec);
  let best: { distance: number; direction: Vec3 } | undefined;
  for (let i = 1; i < centerline.length; i++) {
    const { point, direction } = closestOnSegment(p, centerline[i - 1]!, centerline[i]!);
    const distance = norm(sub(point, p));
    if (norm(direction) > 1e-9 && (!best || distance < best.distance)) {
      best = { distance, direction };
    }
  }
  if (!best) {
    return undefined;
  }
  return normalize(
    classification!.centerline_is_driving_direction ? best.direction : scale(best.direction, -1),
  );
}

function auditRoadMarking(gt: GroundTruth, marking: RoadMarkingLike): string[] {
  const { type, monochrome_color, traffic_main_sign_type } = marking.classification;
  const isZebra =
    traffic_main_sign_type === TrafficSign_MainSign_Classification_Type.ZEBRA_CROSSING;
  const violations: string[] = [];
  const report = (rule: string, text: string) =>
    violations.push(`#${String(marking.id.value)} ${rule}: ${text}`);

  if (type === RoadMarking_Classification_Type.UNKNOWN) {
    report("E1", "classification.type is UNKNOWN");
  }
  if (
    type !== RoadMarking_Classification_Type.PAINTED_TRAFFIC_SIGN &&
    monochrome_color === RoadMarking_Classification_Color.UNKNOWN
  ) {
    report("E1", "classification.monochrome_color is UNKNOWN");
  }
  if (
    type >= RoadMarking_Classification_Type.PAINTED_TRAFFIC_SIGN &&
    type <= RoadMarking_Classification_Type.TEXTUAL_TRAFFIC_SIGN &&
    traffic_main_sign_type === TrafficSign_MainSign_Classification_Type.UNKNOWN
  ) {
    report("E1", "classification.traffic_main_sign_type is UNKNOWN");
  }

  const { position, orientation, dimension } = marking.base;
  const box: Box = {
    center: toVec(position),
    rotation: rotationMatrix(orientation),
    size: [dimension.length, dimension.width, dimension.height],
  };
  // Outside the mapped lanes, fall back to the spec's "normally points to the sky"
  const road = roadPlane(gt, box.center);
  const n = road?.normal ?? [0, 0, 1];

  const thinAxis = box.size.indexOf(Math.min(...box.size)) as 0 | 1 | 2;
  const tilt = degrees(Math.abs(dot(column(box.rotation, thinAxis), n)));
  if (tilt > MAX_TILT_DEG) {
    report("G1", `thinnest box axis is tilted ${tilt.toFixed(1)} deg from the road normal`);
  }
  if (road) {
    const gap = dot(sub(box.center, road.point), n) - halfExtentAlong(box, n);
    if (Math.abs(gap) > MAX_GAP) {
      report("G2", `box bottom is ${gap.toFixed(2)} m from the road surface`);
    }
  }
  const viewNormal = degrees(dot(column(box.rotation, 0), n));
  if (viewNormal > MAX_TILT_DEG) {
    report("S1", `local x (view normal) is ${viewNormal.toFixed(1)} deg from the road normal`);
  }

  const zAxis = column(box.rotation, 2);
  const zOnRoad = sub(zAxis, scale(n, dot(zAxis, n)));
  for (const { value: laneId } of marking.classification.assigned_lane_id ?? []) {
    const direction = laneDirection(gt, laneId, box.center);
    if (!direction || norm(zOnRoad) < 1e-6) {
      report("S2", `local z cannot be compared with assigned lane ${String(laneId)}`);
      continue;
    }
    const cos = dot(normalize(zOnRoad), direction);
    const angle = degrees(isZebra ? Math.abs(cos) : cos);
    if (angle > MAX_LANE_ANGLE_DEG) {
      report(
        "S2",
        `local z is ${angle.toFixed(1)} deg off the driving direction of lane ${String(laneId)}`,
      );
    }
  }
  return violations;
}

describe("example data road markings follow OSI geometry", () => {
  it.each(FILES)(
    "%s",
    async (file) => {
      const [first] = await readProtobufMessages(path.join(EXAMPLE_DATA, file), 1);
      const gt = first ? (groundTruthOf(first) as GroundTruth | undefined) : undefined;
      const markings = gt?.road_marking ?? [];
      expect(markings.flatMap((marking) => auditRoadMarking(gt!, marking))).toEqual([]);
    },
    60_000,
  );
});
