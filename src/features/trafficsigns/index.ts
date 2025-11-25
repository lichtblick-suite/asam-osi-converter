import { ModelPrimitive } from "@foxglove/schemas";
import {
  TrafficSign,
  TrafficSign_MainSign,
  TrafficSign_MainSign_Classification,
  TrafficSign_SupplementarySign,
  TrafficSign_SupplementarySign_Classification,
  TrafficSignValue,
} from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { convertDataURIToBinary } from "@utils/helper";
import { objectToModelPrimitive } from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import * as geometries from "./geometries";
import images from "./images";
import { buildTrafficSignMetadata } from "./metadata";
import textureHandlerMap, { drawTrafficSignText } from "./textures";

type TrafficSignCategory = keyof typeof images;

const modelSignCacheMap = {
  main: new Map<string | number, Uint8Array>(),
  supplementary: new Map<string | number, Uint8Array>(),
};

const textureBaseCacheMap = {
  main: new Map<number, HTMLImageElement>(),
  supplementary: new Map<number, HTMLImageElement>(),
};

export function buildTrafficSignEntity(
  obj: DeepRequired<TrafficSign>,
  id_prefix: string,
  frame_id: string,
  time: Time,
): PartialSceneEntity {
  const models = [];

  models.push(buildTrafficSignModel("main", obj.main_sign));

  if (obj.supplementary_sign.length > 0) {
    for (const item of obj.supplementary_sign) {
      models.push(buildTrafficSignModel("main", item));
    }
  }

  const metadata = buildTrafficSignMetadata(obj);

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, obj.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    // texts,
    models,
    metadata,
  };
}

export const buildTrafficSignModel = (
  category: TrafficSignCategory,
  item: DeepRequired<TrafficSign_MainSign> | DeepRequired<TrafficSign_SupplementarySign>,
): ModelPrimitive => {
  let mapKey: string | number = item.classification.type;

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
    item.base.position.x,
    item.base.position.y,
    item.base.position.z,
    item.base.orientation.roll,
    item.base.orientation.pitch,
    item.base.orientation.yaw,
    item.base.dimension.width,
    item.base.dimension.length,
    item.base.dimension.height,
    { r: 0, g: 0, b: 0, a: 0 },
    "",
    modelSignCacheMap[category].get(mapKey),
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
  category: DeepRequired<TrafficSignCategory>,
  classification:
    | TrafficSign_MainSign_Classification
    | TrafficSign_SupplementarySign_Classification,
): string => {
  const typeKey = classification.type as number;
  let image = (images[category] as Record<number, string>)[typeKey] ?? images[category][0];

  if (textureHandlerMap[category].has(typeKey)) {
    const customization = textureHandlerMap[category].get(typeKey)!;
    image = drawTrafficSignText(
      textureBaseCacheMap[category].get(typeKey)!,
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
    | TrafficSign_MainSign_Classification
    | TrafficSign_SupplementarySign_Classification,
): string => {
  const tsValue = classification.value as DeepRequired<TrafficSignValue>;
  return `${classification.type}|${tsValue.value.toString()}`;
};

const getImage = (file: string): HTMLImageElement => {
  const img = new Image();
  img.src = file;
  return img;
};
