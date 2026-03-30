import {
  convertGroundTruthToFrameTransforms,
  registerGroundTruthConverter,
  convertSensorDataToSceneUpdate,
  registerSensorViewConverter,
  convertSensorViewToFrameTransforms,
  generateGroundTruth3DPanelSettings,
  convertSensorDataToFrameTransforms,
} from "@converters";
import { preloadDynamicTextures } from "@features/trafficsigns";
import { ExtensionContext } from "@lichtblick/suite";

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  const groundTruthConverter = registerGroundTruthConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.SceneUpdate",
    converter: groundTruthConverter,
    panelSettings: {
      "3D": generateGroundTruth3DPanelSettings(),
      Image: generateGroundTruth3DPanelSettings(),
    },
    supportsLatestPerRenderTick: true,
  });

  const sensorViewConverter = registerSensorViewConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.SceneUpdate",
    converter: sensorViewConverter,
    panelSettings: {
      "3D": generateGroundTruth3DPanelSettings(),
      Image: generateGroundTruth3DPanelSettings(),
    },
    supportsLatestPerRenderTick: true,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorData",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertSensorDataToSceneUpdate,
    supportsLatestPerRenderTick: true,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorData",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertSensorDataToFrameTransforms,
    supportsLatestPerRenderTick: true,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertGroundTruthToFrameTransforms,
    supportsLatestPerRenderTick: true,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertSensorViewToFrameTransforms,
    supportsLatestPerRenderTick: true,
  });
}
