import type { Quaternion, Vector3 } from "@foxglove/schemas";

/** ---------- Numerics & helpers (internal) ---------- */

const EPS = 1e-12; // generic small tolerance for near-zero checks
const EPS_NORM = 1e-8; // tolerance for "nearly unit length"
const TAU = Math.PI * 2;

/** Wrap an angle to [-π, π] to improve sin/cos accuracy for very large inputs */
function wrapPi(angle: number): number {
  let a = angle % TAU;
  if (a > Math.PI) {
    a -= TAU;
  }
  if (a < -Math.PI) {
    a += TAU;
  }
  return a;
}

/** Numerically stable quaternion norm using hypot */
function quatNorm(q: Quaternion): number {
  // Order doesn't matter; hypot is robust for very small/large components
  return Math.hypot(q.w, q.x, q.y, q.z);
}

/** Conjugate: inverse for unit quaternions */
function quatConjugate(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

/** Normalize with guard; returns identity if near-zero or non-finite */
function quatNormalize(q: Quaternion, eps = EPS): Quaternion {
  const n = quatNorm(q);
  if (!Number.isFinite(n) || n < eps) {
    // Fall back to identity to avoid NaN propagation in rotations
    return { w: 1, x: 0, y: 0, z: 0 };
  }
  const inv = 1 / n;
  return { w: q.w * inv, x: q.x * inv, y: q.y * inv, z: q.z * inv };
}

/** Check if quaternion is unit length within tolerance */
function quatIsUnit(q: Quaternion, eps = EPS_NORM): boolean {
  const n = quatNorm(q);
  return Number.isFinite(n) && Math.abs(n - 1) <= eps;
}

/** Zero-clean tiny magnitudes and -0 for prettier, stabler downstream math */
function clean0(x: number, eps = EPS): number {
  return Math.abs(x) < eps ? 0 : x;
}

/** Optional input sanity checks (not exported) */
function isFiniteQuat(q: Quaternion): boolean {
  return (
    Number.isFinite(q.w) && Number.isFinite(q.x) && Number.isFinite(q.y) && Number.isFinite(q.z)
  );
}
function isFiniteVec3(v: Vector3): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

/** ---------- Public API ---------- */

/**
 * Convert intrinsic Tait-Bryan z-y'-x'' (equiv. extrinsic x-y-z) Euler angles to a unit quaternion.
 * - Angles are in **radians**.
 * - Rotation order: intrinsic **Z-Y'-X"** (equivalently extrinsic **X-Y-Z**).
 * - Angles are wrapped to [-π, π] to improve trig accuracy for large inputs.
 */
export function eulerToQuaternion(roll: number, pitch: number, yaw: number): Quaternion {
  // Optional input check (kept cheap)
  if (!Number.isFinite(roll) || !Number.isFinite(pitch) || !Number.isFinite(yaw)) {
    // Return identity rather than throwing to keep pipeline resilient
    return { w: 1, x: 0, y: 0, z: 0 };
  }

  const hr = 0.5 * wrapPi(roll);
  const hp = 0.5 * wrapPi(pitch);
  const hy = 0.5 * wrapPi(yaw);

  const sr = Math.sin(hr),
    cr = Math.cos(hr);
  const sp = Math.sin(hp),
    cp = Math.cos(hp);
  const sy = Math.sin(hy),
    cy = Math.cos(hy);

  // Intrinsic Tait-Bryan convention z-y'-x''  (aka extrinsic x-y-z)
  const w = cr * cp * cy + sr * sp * sy;
  const x = sr * cp * cy - cr * sp * sy;
  const y = cr * sp * cy + sr * cp * sy;
  const z = cr * cp * sy - sr * sp * cy;

  const q = quatNormalize({ w, x, y, z });
  return { w: clean0(q.w), x: clean0(q.x), y: clean0(q.y), z: clean0(q.z) };
}

/**
 * Invert a quaternion. For near-unit quaternions, this returns the conjugate.
 * Falls back to robust inverse for non-unit inputs; throws on near-zero/non-finite.
 */
export function invertQuaternion(q: Quaternion): Quaternion {
  if (!isFiniteQuat(q)) {
    throw new Error("Cannot invert a non-finite quaternion.");
  }

  // Fast path: unit (within tolerance) -> conjugate
  if (quatIsUnit(q)) {
    const qc = quatConjugate(q);
    return { w: qc.w, x: clean0(qc.x), y: clean0(qc.y), z: clean0(qc.z) };
  }

  // Robust inverse: q* / ||q||^2
  const n = quatNorm(q);
  if (!Number.isFinite(n) || n < EPS) {
    throw new Error("Cannot invert a near-zero quaternion.");
  }
  const invNormSq = 1 / (n * n);
  return {
    w: q.w * invNormSq,
    x: -q.x * invNormSq,
    y: -q.y * invNormSq,
    z: -q.z * invNormSq,
  };
}

/**
 * Hamilton product a ⊗ b.
 * - With 2 args: defaults to { renormalize: true }.
 * - With 3 args: pass { renormalize: boolean } to control normalization.
 * - If `renormalize` is true, the product is renormalized **only when the result drifts**
 *   beyond EPS_NORM (result-based gating to minimize unnecessary work).
 */
export function quaternionMultiplication(a: Quaternion, b: Quaternion): Quaternion;
export function quaternionMultiplication(
  a: Quaternion,
  b: Quaternion,
  opts: { renormalize?: boolean },
): Quaternion;

export function quaternionMultiplication(
  a: Quaternion,
  b: Quaternion,
  opts?: { renormalize?: boolean },
): Quaternion {
  if (!isFiniteQuat(a) || !isFiniteQuat(b)) {
    // Return identity to keep downstream math from exploding
    return { w: 1, x: 0, y: 0, z: 0 };
  }

  const x = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
  const y = a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x;
  const z = a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w;
  const w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;

  let q = { w, x, y, z };

  // Result-based renormalization (more precise than checking inputs)
  const renormalize = opts?.renormalize ?? true;
  if (renormalize) {
    const n = quatNorm(q);
    if (Number.isFinite(n) && Math.abs(n - 1) > EPS_NORM) {
      q = quatNormalize(q);
    }
  }

  return { w: clean0(q.w), x: clean0(q.x), y: clean0(q.y), z: clean0(q.z) };
}

/**
 * Rotate a 3D point by a quaternion (pure rotation).
 *
 * Uses the stable cross-product formulation:
 *   t = 2 * (q_vec × v)
 *   v' = v + q_w * t + (q_vec × t)
 *
 * The quaternion is normalized internally to ensure length preservation.
 * **Fail-soft behavior:** If inputs are non-finite, returns the original point unchanged.
 */
export function pointRotationByQuaternion(point: Vector3, quaternion: Quaternion): Vector3 {
  if (!isFiniteVec3(point) || !isFiniteQuat(quaternion)) {
    // Non-finite input -> return original point (fail-soft)
    return { x: point.x, y: point.y, z: point.z };
  }

  // Ensure unit quaternion for a pure rotation
  const q = quatNormalize(quaternion);

  const vx = point.x,
    vy = point.y,
    vz = point.z;
  const qx = q.x,
    qy = q.y,
    qz = q.z,
    qw = q.w;

  // t = 2 * (q_vec × v)
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);

  // v' = v + qw * t + q_vec × t
  const rx = vx + qw * tx + (qy * tz - qz * ty);
  const ry = vy + qw * ty + (qz * tx - qx * tz);
  const rz = vz + qw * tz + (qx * ty - qy * tx);

  return { x: clean0(rx), y: clean0(ry), z: clean0(rz) };
}
