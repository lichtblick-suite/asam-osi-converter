import { createGroundTruthContext, convertGroundTruthToSceneUpdate } from "@converters";
import { SensorView } from "@lichtblick/asam-osi-types";
import {
  Immutable,
  MessageConverterAlert,
  MessageConverterContext,
  MessageConverterEmitAlert,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";

export function registerSensorViewConverter(): (
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
) => unknown {
  const ctx = createGroundTruthContext();

  return (
    msg: SensorView,
    event: Immutable<MessageEvent<SensorView>>,
    _globalVariables?: Readonly<Record<string, VariableValue>>,
    context?: MessageConverterContext,
  ) => {
    const emitAlert: MessageConverterEmitAlert | undefined = context?.emitAlert;
    const osiGroundTruth = msg.global_ground_truth;
    if (osiGroundTruth == undefined) {
      const alert: MessageConverterAlert = {
        severity: "warn",
        message: "SensorView message has no global_ground_truth",
        tip: "Use SensorView messages that include global_ground_truth for SceneUpdate conversion.",
      };
      emitAlert?.(alert, "sensorview-missing-groundtruth");
      return { deletions: [], entities: [] };
    }

    return convertGroundTruthToSceneUpdate(
      ctx,
      osiGroundTruth,
      event,
      msg.host_vehicle_id?.value,
      emitAlert,
    );
  };
}
