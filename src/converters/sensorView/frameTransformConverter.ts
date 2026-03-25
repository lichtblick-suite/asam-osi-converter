import { convertGroundTruthToFrameTransforms } from "@converters";
import { FrameTransforms } from "@foxglove/schemas";
import { SensorView } from "@lichtblick/asam-osi-types";
import {
  Immutable,
  MessageConverterAlert,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";

export function convertSensorViewToFrameTransforms(
  msg: SensorView,
  _event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): FrameTransforms {
  const groundTruth = msg.global_ground_truth;
  if (groundTruth == undefined) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message: "SensorView message has no global_ground_truth",
      tip: "FrameTransforms conversion requires global_ground_truth in SensorView.",
    };
    context?.emitAlert(alert, "sensorview-frametransforms-missing-groundtruth");
    return { transforms: [] };
  }

  return convertGroundTruthToFrameTransforms(
    groundTruth,
    undefined,
    undefined,
    context,
    msg.host_vehicle_id?.value,
  );
}
