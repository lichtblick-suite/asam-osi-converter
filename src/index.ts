import {
  convertGroundTruthToFrameTransforms,
  registerGroundTruthConverter,
  convertSensorDataToSceneUpdate,
  registerSensorViewConverter,
} from "@converters";
import { preloadDynamicTextures } from "@features/trafficsigns";
import { SensorView } from "@lichtblick/asam-osi-types";
import { ExtensionContext } from "@lichtblick/suite";

import { generateGroundTruth3DPanelSettings } from "./converters/groundTruth/panelSettings";

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  const groundTruthConverter = registerGroundTruthConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.SceneUpdate",
    converter: groundTruthConverter,
    panelSettings: {
      "3D": generateGroundTruth3DPanelSettings(),
    },
  });

  const sensorViewConverter = registerSensorViewConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.SceneUpdate",
    converter: sensorViewConverter,
    panelSettings: {
      "3D": generateGroundTruth3DPanelSettings(),
    },
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorData",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertSensorDataToSceneUpdate,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertGroundTruthToFrameTransforms,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.FrameTransforms",
    converter: (message: SensorView) =>
      convertGroundTruthToFrameTransforms(message.global_ground_truth!),
  });
}
