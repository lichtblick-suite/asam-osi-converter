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

export function invertQuaternion(quaternion: Quaternion): Quaternion {
  return { x: -quaternion.x, y: -quaternion.y, z: -quaternion.z, w: quaternion.w };
}

export function quaternionMultiplication(
  quaternion_lhs: Quaternion,
  quaternion_rhs: Quaternion,
): Quaternion {
  const w =
    quaternion_rhs.w * quaternion_lhs.w -
    quaternion_rhs.x * quaternion_lhs.x -
    quaternion_rhs.y * quaternion_lhs.y -
    quaternion_rhs.z * quaternion_lhs.z;
  const x =
    quaternion_rhs.w * quaternion_lhs.x +
    quaternion_rhs.x * quaternion_lhs.w -
    quaternion_rhs.y * quaternion_lhs.z +
    quaternion_rhs.z * quaternion_lhs.y;
  const y =
    quaternion_rhs.w * quaternion_lhs.y +
    quaternion_rhs.x * quaternion_lhs.z +
    quaternion_rhs.y * quaternion_lhs.w -
    quaternion_rhs.z * quaternion_lhs.x;
  const z =
    quaternion_rhs.w * quaternion_lhs.z -
    quaternion_rhs.x * quaternion_lhs.y +
    quaternion_rhs.y * quaternion_lhs.x +
    quaternion_rhs.z * quaternion_lhs.w;
  return { x, y, z, w };
}

export function pointRotationByQuaternion(point: Vector3, quaternion: Quaternion): Vector3 {
  const r: Quaternion = { w: 0, x: point.x, y: point.y, z: point.z };
  const q_conj = invertQuaternion(quaternion);
  const tmp = quaternionMultiplication(quaternion, r);
  const result = quaternionMultiplication(tmp, q_conj);
  return { x: result.x, y: result.y, z: result.z };
}
