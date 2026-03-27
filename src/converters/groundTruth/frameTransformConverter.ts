import { FrameTransform, FrameTransforms } from "@foxglove/schemas";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { MessageConverterAlert, MessageConverterContext, VariableValue } from "@lichtblick/suite";
import { osiTimestampToTime } from "@utils/helper";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  OSI_GLOBAL_FRAME,
  OSI_EGO_VEHICLE_BB_CENTER_FRAME,
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
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
    // Return empty FrameTransforms if host vehicle id is not set
    if (hostVehicleId == undefined) {
      console.error("Missing host vehicle id GroundTruth message. Cannot build FrameTransforms.");
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "GroundTruth is missing host_vehicle_id",
        tip: "FrameTransforms requires host_vehicle_id in GroundTruth or SensorView.",
      };
      emitAlert?.(alert, "groundtruth-frametransforms-missing-host-vehicle-id");
      return transforms;
    }

    // Find host vehicle once — reuse for all subsequent checks
    const hostObject = message.moving_object?.find((obj) => obj.id?.value === hostVehicleId);

    if (!hostObject) {
      console.error("Host vehicle not found in moving objects");
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "GroundTruth host vehicle not found in moving_object",
        tip: "Ensure host_vehicle_id refers to an entry in moving_object.",
      };
      emitAlert?.(alert, "groundtruth-frametransforms-host-vehicle-not-found");
      return transforms;
    }

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
