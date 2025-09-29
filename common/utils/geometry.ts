import type { Quaternion, Vector3 } from "@foxglove/schemas";

export function eulerToQuaternion(roll: number, pitch: number, yaw: number): Quaternion {
  const sr = Math.sin(roll * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cy = Math.cos(yaw * 0.5);

  // Intrinsic Tait-Bryan convention z-y'-x''
  // equivalent to extrinsic Tait-Bryan convention x-y-z
  const w = cr * cp * cy + sr * sp * sy;
  const x = sr * cp * cy - cr * sp * sy;
  const y = cr * sp * cy + sr * cp * sy;
  const z = cr * cp * sy - sr * sp * cy;

  return { x, y, z, w };
}

export function invertQuaternion(q: Quaternion): Quaternion {
  const normSquared = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
  if (normSquared === 0) {
    throw new Error("Cannot invert a zero quaternion.");
  }
  const invNormSquared = 1 / normSquared;
  return {
    x: -q.x * invNormSquared,
    y: -q.y * invNormSquared,
    z: -q.z * invNormSquared,
    w: q.w * invNormSquared,
  };
}

export function quaternionMultiplication(a: Quaternion, b: Quaternion): Quaternion {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

export function pointRotationByQuaternion(point: Vector3, quaternion: Quaternion): Vector3 {
  // Convert the point to a quaternion (pure imaginary)
  const pointAsQuaternion: Quaternion = {
    x: point.x,
    y: point.y,
    z: point.z,
    w: 0,
  };

  // Invert the quaternion
  const inverse = invertQuaternion(quaternion);

  // Apply the rotation: q * p * q^-1
  const temp = quaternionMultiplication(quaternion, pointAsQuaternion);
  const rotated = quaternionMultiplication(temp, inverse);

  // Return the rotated point (discard the scalar part)
  return {
    x: rotated.x,
    y: rotated.y,
    z: rotated.z,
  };
}
