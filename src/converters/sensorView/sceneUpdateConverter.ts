import { createGroundTruthContext, convertGroundTruthToSceneUpdate } from "@converters";
import { SensorView } from "@lichtblick/asam-osi-types";
import {
  Immutable,
  MessageEvent
} from "@lichtblick/suite";

export function registerSensorViewConverter(): (
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  globalVariables?: unknown
) => unknown {
  const ctx = createGroundTruthContext();

  return (
    msg: SensorView,
    event: Immutable<MessageEvent<SensorView>>,
    _globalVariables?: unknown
  ) => {
    return convertGroundTruthToSceneUpdate(
      ctx,
      msg.global_ground_truth!,
      event,
      msg.host_vehicle_id?.value,
    );
  };
}
