import { GroundTruthPanelSettings } from "@converters";
import { ArrowPrimitive, Color, KeyValuePair, ModelPrimitive } from "@foxglove/schemas";
import {
  TrafficLight,
  TrafficLight_Classification,
  TrafficLight_Classification_Mode,
} from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { convertDataURIToBinary } from "@utils/helper";
import { eulerToQuaternion, pointRotationByQuaternion } from "@utils/math";
import {
  buildObjectAxes,
  objectToCubePrimitive,
  objectToModelPrimitive,
} from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";

import * as geometries from "./geometries";
import images from "./images";

import { TRAFFIC_LIGHT_COLOR, TRAFFIC_LIGHT_ICON_OFFSET } from "@/config/constants";

function computeFlashState(time: Time, period = 2n): "ON" | "OFF" {
  const sec = BigInt(time.sec);
  const nsec = BigInt(time.nsec);
  const t = sec + nsec / 1_000_000_000n;
  const phase = t % period;
  const onDuration = period / 2n;
  return phase < onDuration ? "ON" : "OFF";
}

const modelCacheMap = new Map<string | number, Uint8Array>();

function getAlpha(mode: TrafficLight_Classification_Mode, time: Time): number {
  switch (mode) {
    case TrafficLight_Classification_Mode.MODE_OFF:
      return 0.2;
    case TrafficLight_Classification_Mode.MODE_CONSTANT:
      return 1.0;
    case TrafficLight_Classification_Mode.MODE_FLASHING:
      return computeFlashState(time) === "ON" ? 1.0 : 0.2;
    default:
      return 0.8;
  }
}

export function buildTrafficLightEntity(
  obj: TrafficLight,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
  metadata?: KeyValuePair[],
): PartialSceneEntity {
  function buildAxes(): ArrowPrimitive[] {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return buildObjectAxes(obj);
  }

  if (obj.base?.position && obj.base.orientation && obj.base.dimension && obj.classification) {
    const trafficLightColor = { ...TRAFFIC_LIGHT_COLOR[obj.classification.color].code };

    trafficLightColor.a = getAlpha(obj.classification.mode, time);
    const modelCacheKey = getModelCacheKey(obj.classification, time);

    const cube = objectToCubePrimitive(
      obj.base.position.x,
      obj.base.position.y,
      obj.base.position.z,
      obj.base.orientation.roll,
      obj.base.orientation.pitch,
      obj.base.orientation.yaw,
      obj.base.dimension.width,
      obj.base.dimension.length,
      obj.base.dimension.height,
      trafficLightColor,
    );

    if (!obj.id) {
      throw Error("Missing TrafficLight id.");
    }

    return {
      timestamp: time,
      frame_id,
      id: generateSceneEntityId(id_prefix, obj.id.value),
      lifetime: { sec: 0, nsec: 0 },
      frame_locked: true,
      arrows: buildAxes(),
      cubes: config?.showBoundingBox ?? false ? [cube] : [],
      models: [buildTrafficLightModel(obj, trafficLightColor, modelCacheKey)],
      metadata,
    };
  } else {
    throw Error("Missing TrafficSign information.");
  }
}

export const buildTrafficLightModel = (
  item: TrafficLight,
  modelBaseColor: Color,
  modelCacheKey: string,
): ModelPrimitive => {
  if (item.classification && item.base?.orientation && item.base.position && item.base.dimension) {
    if (!modelCacheMap.has(modelCacheKey)) {
      modelCacheMap.set(
        modelCacheKey,
        buildGltfModel("plane", processTexture(item.classification), modelBaseColor),
      );
    }

    const localAxisOrientation = eulerToQuaternion(
      item.base.orientation.roll,
      item.base.orientation.pitch,
      item.base.orientation.yaw,
    );
    const textureOffsetX = item.base.dimension.length / 2 + TRAFFIC_LIGHT_ICON_OFFSET;
    const frontNormal = pointRotationByQuaternion({ x: 1, y: 0, z: 0 }, localAxisOrientation);
    const frontCenter = {
      x: item.base.position.x + frontNormal.x * textureOffsetX,
      y: item.base.position.y + frontNormal.y * textureOffsetX,
      z: item.base.position.z + frontNormal.z * textureOffsetX,
    };

    return objectToModelPrimitive(
      frontCenter.x,
      frontCenter.y,
      frontCenter.z,
      item.base.orientation.roll,
      item.base.orientation.pitch,
      item.base.orientation.yaw,
      item.base.dimension.width,
      item.base.dimension.length,
      item.base.dimension.height,
      "",
      modelCacheMap.get(modelCacheKey),
    );
  } else {
    throw Error("Missing TrafficLight information.");
  }
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

const processTexture = (classification: TrafficLight_Classification): string => {
  const typeKey = classification.icon;
  return images[typeKey];
};

export const getModelCacheKey = (
  classification: TrafficLight_Classification,
  time: Time,
): string => {
  let outputKey = `${classification.icon.toString()}|${classification.color.toString()}|${classification.mode.toString()}`;
  if (classification.mode === TrafficLight_Classification_Mode.MODE_FLASHING) {
    outputKey += `_${computeFlashState(time)}`;
  }
  return outputKey;
};
