import {
  convertGroundTruthToFrameTransforms,
  registerGroundTruthConverter,
  convertSensorDataToSceneUpdate,
  registerSensorViewConverter,
  GroundTruthPanelSettings,
} from "@converters";
import { preloadDynamicTextures } from "@features/trafficsigns";
import { SensorView } from "@lichtblick/asam-osi-types";
import { ExtensionContext, PanelSettings } from "@lichtblick/suite";

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  const generatePanelSettings = <T>(obj: PanelSettings<T>) => obj as PanelSettings<unknown>;

  const groundTruthConverter = registerGroundTruthConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.SceneUpdate",
    converter: groundTruthConverter,
  });

  const sensorViewConverter = registerSensorViewConverter();
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.SceneUpdate",
    converter: sensorViewConverter,
    panelSettings: {
      "3D": generatePanelSettings({
        settings: (config) => ({
          fields: {
            caching: {
              label: "Caching",
              input: "boolean",
              value: config?.caching,
              help: "Enables caching of lanes and lane boundaries.",
            },
            showAxes: {
              label: "Show axes",
              input: "boolean",
              value: config?.showAxes,
            },
            showPhysicalLanes: {
              label: "Show Physical Lanes",
              input: "boolean",
              value: config?.showPhysicalLanes,
            },
            showLogicalLanes: {
              label: "Show Logical Lanes",
              input: "boolean",
              value: config?.showLogicalLanes,
            },
            showBoundingBox: {
              label: "Show Bounding Box",
              input: "boolean",
              value: config?.showBoundingBox,
            },
            show3dModels: {
              label: "Show 3D Models",
              input: "boolean",
              value: config?.show3dModels,
            },
            defaultModelPath: {
              label: "Default 3D Model Path",
              input: "autocomplete",
              value: config?.defaultModelPath,
              items: [],
            },
          },
        }),
        handler: (action, config: GroundTruthPanelSettings | undefined) => {
          if (config == undefined) {
            return;
          }
          if (action.action === "update" && action.payload.path[2] === "caching") {
            config.caching = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showAxes") {
            config.showAxes = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showPhysicalLanes") {
            config.showPhysicalLanes = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showLogicalLanes") {
            config.showLogicalLanes = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showBoundingBox") {
            config.showBoundingBox = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "show3dModels") {
            config.show3dModels = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "defaultModelPath") {
            config.defaultModelPath = action.payload.value as string;
          }
        },
        defaultConfig: {
          caching: true,
          showAxes: true,
          showPhysicalLanes: true,
          showLogicalLanes: false,
          showBoundingBox: true,
          show3dModels: false,
          defaultModelPath: "/opt/models/vehicles/",
        },
      }),
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
