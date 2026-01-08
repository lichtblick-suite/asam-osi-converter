import { createGroundTruthContext, convertGroundTruthToSceneUpdate } from "@converters";
import { SceneUpdate } from "@foxglove/schemas";
import { SensorView } from "@lichtblick/asam-osi-types";
import { Immutable, MessageEvent } from "@lichtblick/suite";
import { DeepPartial } from "ts-essentials";

export function registerSensorViewConverter(): (
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
) => DeepPartial<SceneUpdate> {
  const ctx = createGroundTruthContext();

  return (msg: SensorView, event: Immutable<MessageEvent<SensorView>>) =>
    convertGroundTruthToSceneUpdate(ctx, msg.global_ground_truth!, event);
}
