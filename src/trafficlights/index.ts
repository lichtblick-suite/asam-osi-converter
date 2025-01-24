import { Color, KeyValuePair, ModelPrimitive } from "@foxglove/schemas";
import {
  TrafficLight,
  TrafficLight_Classification,
  TrafficLight_Classification_Color,
  TrafficLight_Classification_Icon,
  TrafficLight_Classification_Mode,
} from "@lichtblick/asam-osi-types";
import { convertDataURIToBinary } from "@utils/helper";
import { objectToModelPrimitive } from "@utils/marker";
import { DeepRequired } from "ts-essentials";

import * as geometries from "./geometries";
import images from "./images";

const modelCacheMap = new Map<string | number, Uint8Array>();

export const buildTrafficLightModel = (
  item: DeepRequired<TrafficLight>,
  color: Color,
): ModelPrimitive => {
  const mapKey = getMapKey(item.classification);

  if (item.classification.mode === TrafficLight_Classification_Mode.OFF) {
    color.a = 0.5;
  }

  if (!modelCacheMap.has(mapKey)) {
    modelCacheMap.set(mapKey, buildGltfModel("plane", processTexture(item.classification), color));
  }

  return objectToModelPrimitive(
    item.base.position.x,
    item.base.position.y,
    item.base.position.z,
    item.base.orientation.roll,
    item.base.orientation.pitch,
    item.base.orientation.yaw,
    item.base.dimension.width,
    item.base.dimension.length,
    item.base.dimension.height,
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

export function buildTrafficLightMetadata(obj: DeepRequired<TrafficLight>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "color",
      value: TrafficLight_Classification_Color[obj.classification.color],
    },
    {
      key: "icon",
      value: TrafficLight_Classification_Icon[obj.classification.icon],
    },
    {
      key: "mode",
      value: TrafficLight_Classification_Mode[obj.classification.mode],
    },
  ];

  return metadata;
}

const processTexture = (classification: DeepRequired<TrafficLight_Classification>): string => {
  const typeKey = classification.icon;
  return images[typeKey];
};

const getMapKey = (classification: TrafficLight_Classification): string => {
  return `${classification.icon}|${classification.color}|${classification.mode}`;
};
