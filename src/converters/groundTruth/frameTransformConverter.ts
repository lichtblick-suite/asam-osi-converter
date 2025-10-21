import { FrameTransform, FrameTransforms } from "@foxglove/schemas";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { eulerToQuaternion } from "@utils/geometry";
import { osiTimestampToTime } from "@utils/helper";
import { DeepRequired } from "ts-essentials";

import {
  OSI_GLOBAL_FRAME,
  OSI_EGO_VEHICLE_BB_CENTER_FRAME,
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
} from "@/config/frameTransformNames";

export const convertGroundTruthToFrameTransforms = (message: GroundTruth): FrameTransforms => {
  const transforms = { transforms: [] } as FrameTransforms;

  try {
    // Return empty FrameTransforms if host vehicle id is not set
    if (!message.host_vehicle_id) {
      console.error("Missing host vehicle id GroundTruth message. Can not build FrameTransforms.");
      return transforms;
    }

    // Return empty FrameTransforms if host vehicle is not contained in moving objects
    if (
      message.moving_object &&
      message.moving_object.some((obj) => obj.id?.value === message.host_vehicle_id?.value)
    ) {
      transforms.transforms.push(
        buildEgoVehicleBBCenterFrameTransform(message as DeepRequired<GroundTruth>),
      );
    } else {
      console.error("Host vehicle not found in moving objects");
      return transforms;
    }

    // Add rear axle FrameTransform if bbcenter_to_rear is set in vehicle attributes of ego vehicle
    if (
      message.moving_object.some(
        (obj) =>
          obj.id?.value === message.host_vehicle_id?.value &&
          obj.vehicle_attributes?.bbcenter_to_rear,
      )
    ) {
      transforms.transforms.push(
        buildEgoVehicleRearAxleFrameTransform(message as DeepRequired<GroundTruth>),
      );
    } else {
      console.warn(
        "bbcenter_to_rear not found in ego vehicle attributes. Can not build rear axle FrameTransform.",
      );
    }
  } catch (error) {
    console.error(
      "Error during FrameTransform message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
  }

  return transforms;
};

function buildEgoVehicleBBCenterFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;

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
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;

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
