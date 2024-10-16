import { Color, KeyValuePair, ModelPrimitive } from "@foxglove/schemas";
import { convertDataURIToBinary } from "@utils/helper";
import { objectToModelPrimitive } from "@utils/marker";

import {
  TrafficLight_Classification_Color,
  TrafficLight_Classification_Icon,
  TrafficLight_Classification_Mode,
} from "asam-osi-types";

import * as geometries from "./geometries";
import images from "./images";
import { OsiTrafficLight, OsiTrafficLightClassification } from "../types/osiGroundTruth";

const modelCacheMap = new Map<string | number, Uint8Array>();

export const buildTrafficLightModel = (item: OsiTrafficLight, color: Color): ModelPrimitive => {
  const mapKey = getMapKey(item.classification);

  if (item.classification.mode.value === TrafficLight_Classification_Mode.OFF) {
    color.a = 0.5;
  }

  if (!modelCacheMap.has(mapKey)) {
    modelCacheMap.set(mapKey, buildGltfModel("plane", processTexture(item.classification), color));
  }

  return objectToModelPrimitive(
    item.base.position!.x!,
    item.base.position!.y!,
    item.base.position!.z!,
    item.base.orientation!.yaw!,
    0,
    0,
    item.base.dimension!.width!,
    item.base.dimension!.length!,
    item.base.dimension!.height!,
    color,
    modelCacheMap.get(mapKey)!,
  );
};

const buildGltfModel = (
  geometryType: keyof typeof geometries.default,
  imageData: string,
  color: Color,
): Uint8Array => {
  const data = {
    ...geometries.default[geometryType],
  };
  data.images[0]!.uri = imageData;
  data.materials[0]!.pbrMetallicRoughness.baseColorFactor = [color.r, color.g, color.b, color.a];
  return convertDataURIToBinary(`data:model/gltf+json;base64,${btoa(JSON.stringify(data))}`);
};

export function buildTrafficLightMetadata(obj: OsiTrafficLight): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "color",
      value: TrafficLight_Classification_Color[obj.classification.color.value],
    },
    {
      key: "icon",
      value: TrafficLight_Classification_Icon[obj.classification.icon.value],
    },
    {
      key: "mode",
      value: TrafficLight_Classification_Mode[obj.classification.mode.value],
    },
  ];

  return metadata;
}

const processTexture = (classification: OsiTrafficLightClassification): string => {
  const typeKey = classification.icon.value;
  return images[typeKey] ?? images[0];
};

const getMapKey = (classification: OsiTrafficLightClassification): string => {
  return `${classification.icon.value}|${classification.color.value}|${classification.mode.value}`;
};
