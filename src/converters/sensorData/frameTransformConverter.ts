import { FrameTransforms } from "@foxglove/schemas";
import { SensorData } from "@lichtblick/asam-osi-types";
import {
  Immutable,
  MessageConverterAlert,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";
import { osiTimestampToTime } from "@utils/helper";
import { eulerToQuaternion } from "@utils/math";
import { DeepRequired } from "ts-essentials";

import {
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
  OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
  sensorDataRadarFrameId,
} from "@/config/frameTransformNames";
import { sensorViewTimestamp } from "@/converters/sensorView/imageConverter";

export function convertSensorDataToFrameTransforms(
  message: SensorData,
  event?: Immutable<MessageEvent<SensorData>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): FrameTransforms {
  const emitAlert = context?.emitAlert;
  const transforms = { transforms: [] } as FrameTransforms;

  try {
    if (!message.mounting_position) {
      console.error(
        "Missing mounting position in SensorData message. Cannot build virtual mounting transform.",
      );
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "SensorData is missing mounting_position",
        tip: "The virtual mounting transform requires mounting_position in SensorData.",
      };
      emitAlert?.(alert, "sensordata-frametransforms-missing-mounting-position");
    } else {
      transforms.transforms.push(
        buildVirtualMountingPositionFrameTransform(message as DeepRequired<SensorData>),
      );
    }
    const timestamp = sensorViewTimestamp(message);
    if (timestamp != undefined) {
      (message.feature_data?.radar_sensor ?? []).forEach((radar, index) => {
        const mounting = radar.header?.mounting_position;
        if (mounting?.position == undefined || mounting.orientation == undefined) {
          emitAlert?.(
            {
              severity: "warn",
              message: `Radar ${String(index)} has no physical mounting pose`,
              tip: "Populate feature_data.radar_sensor.header.mounting_position for each radar.",
            },
            `sensordata-frametransforms-missing-radar-mounting-position-${String(index)}`,
          );
          return;
        }
        const translation = {
          x: mounting.position.x ?? 0,
          y: mounting.position.y ?? 0,
          z: mounting.position.z ?? 0,
        };
        const roll = mounting.orientation.roll ?? 0;
        const pitch = mounting.orientation.pitch ?? 0;
        const yaw = mounting.orientation.yaw ?? 0;
        if (
          ![translation.x, translation.y, translation.z, roll, pitch, yaw].every(Number.isFinite)
        ) {
          return;
        }
        transforms.transforms.push({
          timestamp,
          parent_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
          child_frame_id: sensorDataRadarFrameId(event?.topic, index),
          translation,
          rotation: eulerToQuaternion(roll, pitch, yaw),
        });
      });
    }
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
