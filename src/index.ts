import {
  convertGroundTruthToFrameTransforms,
  registerGroundTruthConverter,
  convertSensorDataToSceneUpdate,
  registerSensorViewConverter,
  generateGroundTruth3DPanelSettings,
  convertSensorDataToFrameTransforms,
} from "@converters";
import { preloadDynamicTextures } from "@features/trafficsigns";
import {
  SensorView,
  osi3GroundTruthDescriptor,
  osi3SensorDataDescriptor,
  osi3SensorViewDescriptor,
} from "@lichtblick/asam-osi-types";
import { ExtensionContext } from "@lichtblick/suite";

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  extensionContext.registerSchemaDefinition({
    name: "osi3.GroundTruth",
    encoding: "protobuf",
    data: osi3GroundTruthDescriptor,
    label: "v3.8.0"
  });

  extensionContext.registerSchemaDefinition({
    name: "osi3.SensorView",
    encoding: "protobuf",
    data: osi3GroundTruthDescriptor,
    label: "broken schema"
  });

  extensionContext.registerSchemaDefinition({
    name: "osi3.SensorView",
    encoding: "protobuf",
    data: osi3SensorViewDescriptor,
    label: "v3.8.0"
  });

  extensionContext.registerSchemaDefinition({
    name: "osi3.SensorView",
    encoding: "protobuf",
    data: osi3SensorViewDescriptor,
    label: "v3.8.0 numero 2"
  });

  extensionContext.registerSchemaDefinition({
    name: "osi3.SensorData",
    encoding: "protobuf",
    data: osi3SensorDataDescriptor,
    label: "v3.8.0"
  });

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
    fromSchemaName: "osi3.SensorData",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertSensorDataToFrameTransforms,
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
