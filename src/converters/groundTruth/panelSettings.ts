import { GroundTruthPanelSettings } from "@converters";
import { PanelSettings } from "@lichtblick/suite";

export const DEFAULT_CONFIG = {
  caching: true,
  showAxes: true,
  showPhysicalLanes: true,
  showLogicalLanes: false,
  showBoundingBox: true,
  show3dModels: false,
  defaultModelPath: "/opt/models/vehicles/",
};

export function generateGroundTruth3DPanelSettings(): PanelSettings<unknown> {
  const settings: PanelSettings<GroundTruthPanelSettings> = {
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

    handler: (action, config) => {
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

    defaultConfig: DEFAULT_CONFIG,
  };

  return settings as PanelSettings<unknown>;
}
