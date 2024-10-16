import { ModelPrimitive } from "@foxglove/schemas";
import { convertDataURIToBinary } from "@utils/helper";
import { objectToModelPrimitive } from "@utils/marker";

import * as geometries from "./geometries";
import images from "./images";
import textureHandlerMap, { drawTrafficSignText } from "./textures";
import {
  OsiTrafficSignMainSignClassification,
  OsiTrafficSignSupplementarySignClassification,
  OsiTrafficSignMainSign,
  OsiTrafficSignSupplementarySign,
} from "../types/osiGroundTruth";

type TrafficSignCategory = keyof typeof images;

const modelSignCacheMap = {
  main: new Map<string | number, Uint8Array>(),
  supplementary: new Map<string | number, Uint8Array>(),
};

const textureBaseCacheMap = {
  main: new Map<number, HTMLImageElement>(),
  supplementary: new Map<number, HTMLImageElement>(),
};

export const buildTrafficSignModel = (
  category: TrafficSignCategory,
  item: OsiTrafficSignMainSign | OsiTrafficSignSupplementarySign,
): ModelPrimitive => {
  let mapKey: string | number = item.classification.type.value;

  if (textureHandlerMap[category].has(mapKey)) {
    mapKey = getTextureMapKey(item.classification);
  }

  if (!modelSignCacheMap[category].has(mapKey)) {
    modelSignCacheMap[category].set(
      mapKey,
      buildGltfModel("plane", processTexture(category, item.classification)),
    );
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
    { r: 0, g: 0, b: 0, a: 0 },
    modelSignCacheMap[category].get(mapKey)!,
  );
};

const buildGltfModel = (
  geometryType: keyof typeof geometries.default,
  imageData: string,
): Uint8Array => {
  const data = {
    ...geometries.default[geometryType],
  };
  data.images[0]!.uri = imageData;
  return convertDataURIToBinary(`data:model/gltf+json;base64,${btoa(JSON.stringify(data))}`);
};

const processTexture = (
  category: TrafficSignCategory,
  classification:
    | OsiTrafficSignMainSignClassification
    | OsiTrafficSignSupplementarySignClassification,
): string => {
  const typeKey = classification.type.value;
  let image = (images[category] as Record<number, string>)[typeKey] ?? images[category][0];

  if (textureHandlerMap[category].has(typeKey)) {
    const customization = textureHandlerMap[category].get(typeKey)!;
    image = drawTrafficSignText(
      textureBaseCacheMap[category].get(classification.type.value)!,
      customization.getText(classification),
      customization.getOptions(classification),
    );
  }

  return image;
};

const preloadDynamicTexturesByCategory = (category: TrafficSignCategory): HTMLImageElement[] => {
  const result = [];
  for (const [textureKey] of textureHandlerMap[category].entries()) {
    if (!textureBaseCacheMap[category].has(textureKey)) {
      const img = getImage((images[category] as Record<number, string>)[textureKey]!);
      textureBaseCacheMap[category].set(textureKey, img);
      result.push(img);
    }
  }
  return result;
};

export const preloadDynamicTextures = (): HTMLImageElement[] => {
  return [
    ...preloadDynamicTexturesByCategory("main"),
    ...preloadDynamicTexturesByCategory("supplementary"),
  ];
};

const getTextureMapKey = (
  classification:
    | OsiTrafficSignMainSignClassification
    | OsiTrafficSignSupplementarySignClassification,
): string => {
  return `${classification.type.value}|${classification.value.value}`;
};

const getImage = (file: string): HTMLImageElement => {
  const img = new Image();
  img.src = file;
  return img;
};
