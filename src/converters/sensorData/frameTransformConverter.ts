import { FrameTransforms } from "@foxglove/schemas";
import { SensorData } from "@lichtblick/asam-osi-types";
import { MessageConverterAlert, MessageConverterContext, VariableValue } from "@lichtblick/suite";
import { osiTimestampToTime } from "@utils/helper";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
  OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
} from "@/config/frameTransformNames";

export function convertSensorDataToFrameTransforms(
  message: SensorData,
  _event?: unknown,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): FrameTransforms {
  const emitAlert = context?.emitAlert;
  const transforms = { transforms: [] } as FrameTransforms;

  try {
    if (!message.mounting_position) {
      console.error(
        "Missing mounting position in SensorData message. Cannot build FrameTransforms.",
      );
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "SensorData is missing mounting_position",
        tip: "FrameTransforms requires mounting_position in SensorData.",
      };
      emitAlert?.(alert, "sensordata-frametransforms-missing-mounting-position");
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
    const alert: MessageConverterAlert = {
      severity: "error",
      message: "SensorData FrameTransforms conversion failed",
      error: error instanceof Error ? error : new Error(String(error)),
      tip: "Check if input messages match the expected OSI SensorData schema.",
    };
    emitAlert?.(alert, "sensordata-frametransforms-conversion-error");
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
