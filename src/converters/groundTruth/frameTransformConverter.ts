import { FrameTransform, FrameTransforms } from "@foxglove/schemas";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { MessageConverterAlert, MessageConverterContext, VariableValue } from "@lichtblick/suite";
import { osiTimestampToTime } from "@utils/helper";
import { eulerToQuaternion, invertQuaternion, pointRotationByQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  OSI_GLOBAL_FRAME,
  OSI_EGO_VEHICLE_BB_CENTER_FRAME,
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
  OSI_PROJ_FRAME,
} from "@/config/frameTransformNames";

export const convertGroundTruthToFrameTransforms = (
  message: GroundTruth,
  _event?: unknown,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
  hostVehicleIdFallback?: number,
): FrameTransforms => {
  const emitAlert = context?.emitAlert;
  const transforms = { transforms: [] } as FrameTransforms;
  const gtHostVehicleId = message.host_vehicle_id?.value;
  const hostVehicleId = gtHostVehicleId ?? hostVehicleIdFallback;
  const usingHostVehicleIdFallback =
    gtHostVehicleId == undefined && hostVehicleIdFallback != undefined;

  if (usingHostVehicleIdFallback) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message: "GroundTruth host_vehicle_id missing, using SensorView host_vehicle_id fallback",
      tip: "Set host_vehicle_id in GroundTruth to avoid fallback behavior.",
    };
    emitAlert?.(alert, "groundtruth-frametransforms-host-vehicle-fallback-used");
  }

  if (
    gtHostVehicleId != undefined &&
    hostVehicleIdFallback != undefined &&
    gtHostVehicleId !== hostVehicleIdFallback
  ) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message:
        "GroundTruth host_vehicle_id (" +
        String(gtHostVehicleId) +
        ") differs from SensorView host_vehicle_id (" +
        String(hostVehicleIdFallback) +
        ")",
      tip: "Using GroundTruth host_vehicle_id. Ensure both sources agree.",
    };
    emitAlert?.(alert, "groundtruth-frametransforms-host-vehicle-id-divergence");
  }

  try {
    // Host-dependent ego transforms require a resolvable host vehicle.
    // Host-independent transforms (e.g. global -> proj_frame) are handled below regardless.
    if (hostVehicleId == undefined) {
      console.warn("Missing host vehicle id in GroundTruth message. Skipping ego FrameTransforms.");
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "GroundTruth is missing host_vehicle_id; ego vehicle transforms skipped",
        tip: "Set host_vehicle_id in GroundTruth or SensorView fallback. global→proj_frame is still published when proj_frame_offset is present.",
      };
      emitAlert?.(alert, "groundtruth-frametransforms-missing-host-vehicle-id");
    } else {
      // Find host vehicle once — reuse for all subsequent checks
      const hostObject = message.moving_object?.find((obj) => obj.id?.value === hostVehicleId);

      if (!hostObject) {
        console.warn("Host vehicle not found in moving_object. Skipping ego FrameTransforms.");
        const alert: MessageConverterAlert = {
          severity: "warn",
          message: "GroundTruth host vehicle not found in moving_object; ego transforms skipped",
          tip: "Ensure host_vehicle_id refers to an entry in moving_object. global→proj_frame is still published when proj_frame_offset is present.",
        };
        emitAlert?.(alert, "groundtruth-frametransforms-host-vehicle-not-found");
      } else {
        transforms.transforms.push(
          buildEgoVehicleBBCenterFrameTransform(
            message as DeepRequired<GroundTruth>,
            hostObject as DeepRequired<GroundTruth>["moving_object"][number],
          ),
        );

        // Add rear axle FrameTransform if bbcenter_to_rear is set in vehicle attributes of ego vehicle
        if (hostObject.vehicle_attributes?.bbcenter_to_rear) {
          transforms.transforms.push(
            buildEgoVehicleRearAxleFrameTransform(
              message as DeepRequired<GroundTruth>,
              hostObject as DeepRequired<GroundTruth>["moving_object"][number],
            ),
          );
        } else {
          console.warn(
            "bbcenter_to_rear not found in ego vehicle attributes. Cannot build rear axle FrameTransform.",
          );
          const alert: MessageConverterAlert = {
            severity: "info",
            message: "GroundTruth ego vehicle has no bbcenter_to_rear",
            tip: "Rear-axle FrameTransform is skipped when bbcenter_to_rear is missing.",
          };
          emitAlert?.(alert, "groundtruth-frametransforms-missing-bbcenter-to-rear");
        }
      }
    }

    // [OSI §GT] Publish global → proj_frame when proj_frame_offset is present.
    // This allows OpenDRIVE map geometry (published in "proj_frame") to align
    // with OSI objects (published in "global").
    if (message.proj_frame_offset?.position) {
      transforms.transforms.push(buildProjFrameTransform(message as DeepRequired<GroundTruth>));
    }
  } catch (error) {
    console.error(
      "Error during FrameTransform message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
    const alert: MessageConverterAlert = {
      severity: "error",
      message: "GroundTruth FrameTransforms conversion failed",
      error: error instanceof Error ? error : new Error(String(error)),
      tip: "Check if input messages match the expected OSI GroundTruth schema.",
    };
    emitAlert?.(alert, "groundtruth-frametransforms-conversion-error");
  }

  return transforms;
};

type DeepRequiredMovingObject = DeepRequired<GroundTruth>["moving_object"][number];

function buildEgoVehicleBBCenterFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
  hostObject: DeepRequiredMovingObject,
): FrameTransform {
  // Pose of EGO BB-CENTER in GLOBAL (parent -> child)
  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: OSI_GLOBAL_FRAME,
    child_frame_id: OSI_EGO_VEHICLE_BB_CENTER_FRAME,
    translation: {
      x: hostObject.base.position.x,
      y: hostObject.base.position.y,
      z: hostObject.base.position.z,
    },
    rotation: eulerToQuaternion(
      hostObject.base.orientation.roll,
      hostObject.base.orientation.pitch,
      hostObject.base.orientation.yaw,
    ),
  };
}

function buildEgoVehicleRearAxleFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
  hostObject: DeepRequiredMovingObject,
): FrameTransform {
  // OSI tree: BB_CENTER (parent) -> REAR_AXLE (child) with a pure translation in body frame
  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: OSI_EGO_VEHICLE_BB_CENTER_FRAME,
    child_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
    translation: {
      x: hostObject.vehicle_attributes.bbcenter_to_rear.x,
      y: hostObject.vehicle_attributes.bbcenter_to_rear.y,
      z: hostObject.vehicle_attributes.bbcenter_to_rear.z,
    },
    rotation: eulerToQuaternion(0, 0, 0),
  };
}

/**
 * Build FrameTransform placing "proj_frame" (CRS world) as a child of "global" (OSI inertial).
 *
 * The proj_frame_offset defines where the "global" origin sits in "proj_frame" coordinates:
 *   - position: translation of "global" origin in "proj_frame" (tx, ty, tz)
 *   - yaw: rotation of "global" axes relative to "proj_frame"
 *
 * We publish parent="global", child="proj_frame" so that "global" stays the root of the
 * frame tree (consistent with ego transforms: global → ego_vehicle_bb_center).
 * This requires inverting the offset using the existing math helpers:
 *   R_inv = invertQuaternion(R(yaw))
 *   t_inv = -pointRotationByQuaternion(t, R_inv)
 *
 * Lichtblick resolves entities in "proj_frame" (OpenDRIVE map) through this chain,
 * enabling alignment with OSI objects in "global".
 */
function buildProjFrameTransform(osiGroundTruth: DeepRequired<GroundTruth>): FrameTransform {
  const offset = osiGroundTruth.proj_frame_offset;

  // Original rotation: "global" rotated by yaw in "proj_frame"
  const rotation = eulerToQuaternion(0, 0, offset.yaw);
  // Inverse rotation: "proj_frame" rotated in "global"
  const rotationInv = invertQuaternion(rotation);

  // Inverse translation: rotate original offset by inverse, then negate
  const t = { x: offset.position.x, y: offset.position.y, z: offset.position.z };
  const rotatedT = pointRotationByQuaternion(t, rotationInv);

  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: OSI_GLOBAL_FRAME,
    child_frame_id: OSI_PROJ_FRAME,
    translation: {
      x: -rotatedT.x,
      y: -rotatedT.y,
      z: -rotatedT.z,
    },
    rotation: rotationInv,
  };
}
