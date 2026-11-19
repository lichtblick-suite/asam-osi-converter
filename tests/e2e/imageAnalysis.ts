/**
 * Measures rendered probe screenshots against the OSI reference model.
 *
 * The camera is orthographic and looks straight down, so every world point maps to the image
 * through an affine map. The map is fitted from the silhouette centroids of the solid probe
 * boxes, which are centrally symmetric about the box centers, and then used to predict each
 * silhouette as the convex hull of the projected box corners.
 */
import { PNG } from "pngjs";

import { Box, boxCorners, Vec3 } from "../helpers/osiGeometry";

export interface Mask {
  width: number;
  height: number;
  data: Uint8Array;
}
type Point = [number, number];

/** Hue ranges (degrees) of the probe colors; wrap-around if from > to. */
const HUE_RANGES: Record<string, [number, number]> = {
  red: [340, 12],
  orange: [15, 45],
  yellow: [50, 70],
  green: [100, 160],
  blue: [220, 262],
  violet: [280, 325],
};
/** The panel toolbar overlays the top right corner of the canvas. */
const TOOLBAR = { height: 140, width: 80 };

function hsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let hue = 0;
  if (delta > 0) {
    if (max === r) {
      hue = ((g - b) / delta + 6) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }
  return [hue * 60, max > 0 ? delta / max : 0, max];
}

export function decodePng(png: Buffer): PNG {
  return PNG.sync.read(png);
}

/** Segments the probe colors by hue; dark, grey and toolbar pixels are ignored. */
export function colorMasks(image: PNG): Record<string, Mask> {
  const { width, height, data } = image;
  const masks = Object.fromEntries(
    Object.keys(HUE_RANGES).map((name) => [
      name,
      { width, height, data: new Uint8Array(width * height) },
    ]),
  );
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y < TOOLBAR.height && x >= width - TOOLBAR.width) {
        continue;
      }
      const i = y * width + x;
      const [h, s, v] = hsv(data[4 * i]! / 255, data[4 * i + 1]! / 255, data[4 * i + 2]! / 255);
      if (s <= 0.25 || v <= 0.3) {
        continue;
      }
      for (const [name, [from, to]] of Object.entries(HUE_RANGES)) {
        if (from > to ? h >= from || h <= to : h >= from && h <= to) {
          masks[name]!.data[i] = 1;
        }
      }
    }
  }
  return masks;
}

export function centroid(mask: Mask): Point | undefined {
  let [sx, sy, n] = [0, 0, 0];
  mask.data.forEach((v, i) => {
    if (v !== 0) {
      sx += i % mask.width;
      sy += Math.floor(i / mask.width);
      n++;
    }
  });
  return n > 0 ? [sx / n, sy / n] : undefined;
}

export function iou(a: Mask, b: Mask): number {
  let [intersection, union] = [0, 0];
  for (let i = 0; i < a.data.length; i++) {
    intersection += a.data[i]! & b.data[i]!;
    union += a.data[i]! | b.data[i]!;
  }
  return union > 0 ? intersection / union : 0;
}

export function shift(mask: Mask, dx: number, dy: number): Mask {
  const data = new Uint8Array(mask.data.length);
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      const [tx, ty] = [x + dx, y + dy];
      if (tx >= 0 && ty >= 0 && tx < mask.width && ty < mask.height) {
        data[ty * mask.width + tx] = mask.data[y * mask.width + x]!;
      }
    }
  }
  return { ...mask, data };
}

/** Number of 4-connected components, ignoring anti-aliasing specks below minSize pixels. */
export function countComponents(mask: Mask, minSize = 20): number {
  const seen = new Uint8Array(mask.data.length);
  let count = 0;
  for (let start = 0; start < mask.data.length; start++) {
    if (mask.data[start] === 0 || seen[start] === 1) {
      continue;
    }
    const queue = [start];
    seen[start] = 1;
    // The array iterator also visits elements pushed during the iteration
    for (const i of queue) {
      const [x, y] = [i % mask.width, Math.floor(i / mask.width)];
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ] as const) {
        const j = ny * mask.width + nx;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < mask.width &&
          ny < mask.height &&
          mask.data[j] === 1 &&
          seen[j] === 0
        ) {
          seen[j] = 1;
          queue.push(j);
        }
      }
    }
    count += queue.length >= minSize ? 1 : 0;
  }
  return count;
}

/** Image <- world map of an orthographic top view: [u, v] = A * [x, y] + t. */
export interface AffineMap {
  a: [[number, number], [number, number]];
  t: Point;
  /** Largest centroid residual of the fit in pixels. */
  residual: number;
  /** Pixels per meter along the principal directions (singular values of A). */
  scales: [number, number];
  det: number;
}

function solve3(m: number[][], rhs: number[]): number[] {
  const det3 = (q: number[][]) =>
    q[0]![0]! * (q[1]![1]! * q[2]![2]! - q[1]![2]! * q[2]![1]!) -
    q[0]![1]! * (q[1]![0]! * q[2]![2]! - q[1]![2]! * q[2]![0]!) +
    q[0]![2]! * (q[1]![0]! * q[2]![1]! - q[1]![1]! * q[2]![0]!);
  const d = det3(m);
  return [0, 1, 2].map(
    (c) => det3(m.map((row, r) => row.map((v, k) => (k === c ? rhs[r]! : v)))) / d,
  );
}

/** Least-squares affine fit from world xy to image points. */
export function fitAffine(world: Point[], image: Point[]): AffineMap {
  const rows = world.map(([x, y]) => [x, y, 1]);
  const normal = [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => rows.reduce((sum, r) => sum + r[i]! * r[j]!, 0)),
  );
  const [u, v] = [0, 1].map((k) =>
    solve3(
      normal,
      [0, 1, 2].map((i) => rows.reduce((sum, r, n) => sum + r[i]! * image[n]![k]!, 0)),
    ),
  ) as [number[], number[]];
  const a: AffineMap["a"] = [
    [u[0]!, u[1]!],
    [v[0]!, v[1]!],
  ];
  const t: Point = [u[2]!, v[2]!];
  const residual = Math.max(
    ...world.map(([x, y], n) =>
      Math.hypot(
        a[0][0] * x + a[0][1] * y + t[0] - image[n]![0],
        a[1][0] * x + a[1][1] * y + t[1] - image[n]![1],
      ),
    ),
  );
  const det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
  const frobenius = a.flat().reduce((sum, value) => sum + value * value, 0);
  const root = Math.sqrt(Math.max(0, frobenius * frobenius - 4 * det * det));
  const scales: [number, number] = [
    Math.sqrt((frobenius + root) / 2),
    Math.sqrt((frobenius - root) / 2),
  ];
  return { a, t, residual, scales, det };
}

export function project(map: AffineMap, [x, y]: Vec3): Point {
  return [
    map.a[0][0] * x + map.a[0][1] * y + map.t[0],
    map.a[1][0] * x + map.a[1][1] * y + map.t[1],
  ];
}

function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((p, q) => (p[0] !== q[0] ? p[0] - q[0] : p[1] - q[1]));
  const turn = (o: Point, a: Point, b: Point) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (pts: Point[]) => {
    const hull: Point[] = [];
    for (const p of pts) {
      while (hull.length >= 2 && turn(hull[hull.length - 2]!, hull[hull.length - 1]!, p) <= 0) {
        hull.pop();
      }
      hull.push(p);
    }
    return hull.slice(0, -1);
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

/** Predicted silhouette: union of the convex hulls of each box's projected corners. */
export function predictMask(boxes: Box[], map: AffineMap, width: number, height: number): Mask {
  const data = new Uint8Array(width * height);
  for (const box of boxes) {
    const hull = convexHull(boxCorners(box).map((corner) => project(map, corner)));
    const xs = hull.map((p) => p[0]);
    const ys = hull.map((p) => p[1]);
    for (
      let y = Math.max(0, Math.floor(Math.min(...ys)));
      y <= Math.min(height - 1, Math.max(...ys));
      y++
    ) {
      for (
        let x = Math.max(0, Math.floor(Math.min(...xs)));
        x <= Math.min(width - 1, Math.max(...xs));
        x++
      ) {
        const inside = hull.every((p, i) => {
          const q = hull[(i + 1) % hull.length]!;
          return (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]) >= 0;
        });
        if (inside) {
          data[y * width + x] = 1;
        }
      }
    }
  }
  return { width, height, data };
}

/** Number of pixels whose color differs by more than `threshold` (0..1) in any channel. */
export function countDifferentPixels(a: PNG, b: PNG, threshold = 0.1): number {
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const diff = Math.max(
      Math.abs(a.data[i]! - b.data[i]!),
      Math.abs(a.data[i + 1]! - b.data[i + 1]!),
      Math.abs(a.data[i + 2]! - b.data[i + 2]!),
    );
    count += diff > threshold * 255 ? 1 : 0;
  }
  return count;
}
