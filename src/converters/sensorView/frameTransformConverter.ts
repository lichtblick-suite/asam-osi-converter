import { convertGroundTruthToFrameTransforms } from "@converters";
import { FrameTransform, FrameTransforms } from "@foxglove/schemas";
import { SensorView } from "@lichtblick/asam-osi-types";
import {
  Immutable,
  MessageConverterAlert,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";
import { eulerToQuaternion } from "@utils/math";

import {
  cameraMountingFrameId,
  cameraOpticalFrameId,
  lidarFrameId,
  sensorViewTimestamp,
} from "./imageConverter";

import { OSI_EGO_VEHICLE_REAR_AXLE_FRAME } from "@/config/frameTransformNames";

function cameraFrameTransforms(
  message: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
): FrameTransform[] {
  const cameraViews = message.camera_sensor_view ?? [];
  const timestamp = sensorViewTimestamp(message) ?? { sec: 0, nsec: 0 };

  return cameraViews.flatMap((cameraView, index) => {
    const mountingPosition =
      cameraView.view_configuration?.mounting_position ?? message.mounting_position;
    if (mountingPosition == undefined) {
      return [];
    }

    const position = mountingPosition.position ?? {};
    const orientation = mountingPosition.orientation ?? {};
    const mountingFrame = cameraMountingFrameId(event.topic, index, cameraViews.length);
    const opticalFrame = cameraOpticalFrameId(event.topic, index, cameraViews.length);
    return [
      {
        timestamp,
        parent_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
        child_frame_id: mountingFrame,
        translation: {
          x: position.x ?? 0,
          y: position.y ?? 0,
          z: position.z ?? 0,
        },
        rotation: eulerToQuaternion(
          orientation.roll ?? 0,
          orientation.pitch ?? 0,
          orientation.yaw ?? 0,
        ),
      },
      {
        timestamp,
        parent_frame_id: mountingFrame,
        child_frame_id: opticalFrame,
        translation: { x: 0, y: 0, z: 0 },
        rotation: eulerToQuaternion(-Math.PI / 2, 0, -Math.PI / 2),
      },
    ];
  });
}

function lidarFrameTransforms(
  message: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
): FrameTransform[] {
  const lidarViews = message.lidar_sensor_view ?? [];
  const timestamp = sensorViewTimestamp(message) ?? { sec: 0, nsec: 0 };

  return lidarViews.flatMap((lidarView, index) => {
    const mountingPosition =
      lidarView.view_configuration?.mounting_position ?? message.mounting_position;
    if (mountingPosition == undefined) {
      return [];
    }

    const position = mountingPosition.position ?? {};
    const orientation = mountingPosition.orientation ?? {};
    return [
      {
        timestamp,
        parent_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
        child_frame_id: lidarFrameId(event.topic, index, lidarViews.length),
        translation: {
          x: position.x ?? 0,
          y: position.y ?? 0,
          z: position.z ?? 0,
        },
        rotation: eulerToQuaternion(
          orientation.roll ?? 0,
          orientation.pitch ?? 0,
          orientation.yaw ?? 0,
        ),
      },
    ];
  });
}

export function convertSensorViewToFrameTransforms(
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): FrameTransforms {
  const groundTruth = msg.global_ground_truth;
  const cameraTransforms = cameraFrameTransforms(msg, event);
  const lidarTransforms = lidarFrameTransforms(msg, event);
  if (groundTruth == undefined) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message: "SensorView message has no global_ground_truth",
      tip: "Only camera mounting transforms are available without embedded global_ground_truth.",
    };
    context?.emitAlert(alert, "sensorview-frametransforms-missing-groundtruth");
    return { transforms: [...cameraTransforms, ...lidarTransforms] };
  }

  const groundTruthTransforms = convertGroundTruthToFrameTransforms(
    groundTruth,
    undefined,
    undefined,
    context,
    msg.host_vehicle_id?.value,
  );
  return {
    transforms: [...groundTruthTransforms.transforms, ...cameraTransforms, ...lidarTransforms],
  };
}
