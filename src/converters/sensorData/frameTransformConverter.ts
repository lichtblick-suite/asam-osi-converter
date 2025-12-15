import { FrameTransforms } from "@foxglove/schemas";
import { SensorData } from "@lichtblick/asam-osi-types";
import { osiTimestampToTime } from "@utils/helper";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
  OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
} from "@/config/frameTransformNames";

export function convertSensorDataToFrameTransforms(message: SensorData): FrameTransforms {
  const transforms = { transforms: [] } as FrameTransforms;

  try {
    if (!message.mounting_position) {
      console.error(
        "Missing mounting position in SensorData message. Can not build FrameTransforms.",
      );
      return transforms;
    }
    transforms.transforms.push(
      buildVirtualMountingPositionFrameTransform(message as DeepRequired<SensorData>),
    );
  } catch (error) {
    console.error(
      "Error during FrameTransform message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
  }

  return transforms;
}

function buildVirtualMountingPositionFrameTransform(message: DeepRequired<SensorData>) {
  const mountingPosition = message.mounting_position;
  return {
    timestamp: osiTimestampToTime(message.timestamp),
    parent_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
    child_frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
    translation: {
      x: mountingPosition.position.x,
      y: mountingPosition.position.y,
      z: mountingPosition.position.z,
    },
    rotation: eulerToQuaternion(
      mountingPosition.orientation.roll,
      mountingPosition.orientation.pitch,
      mountingPosition.orientation.yaw,
    ),
  };
}
