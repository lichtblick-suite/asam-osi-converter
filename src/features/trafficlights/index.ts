import { GroundTruthPanelSettings } from "@converters";
import { ArrowPrimitive, Color, KeyValuePair, ModelPrimitive } from "@foxglove/schemas";
import {
  TrafficLight,
  TrafficLight_Classification,
  TrafficLight_Classification_Mode,
} from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { ColorCode, convertDataURIToBinary } from "@utils/helper";
import { eulerToQuaternion, pointRotationByQuaternion } from "@utils/math";
import {
  buildObjectAxes,
  objectToCubePrimitive,
  objectToModelPrimitive,
} from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import * as geometries from "./geometries";
import images from "./images";

import { TRAFFIC_LIGHT_COLOR } from "@/config/constants";

function computeFlashState(time: Time, period = 2n): "ON" | "OFF" {
  const sec = BigInt(time.sec);
  const nsec = BigInt(time.nsec);
  const t = sec + nsec / 1_000_000_000n;
  const phase = t % period;
  const onDuration = period / 2n;
  return phase < onDuration ? "ON" : "OFF";
}

const modelCacheMap = new Map<string | number, Uint8Array>();

export function buildTrafficLightEntity(
  obj: DeepRequired<TrafficLight>,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
  metadata?: KeyValuePair[],
): PartialSceneEntity {
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
    ColorCode("gray", 0.5),
  );

  const models = [];

  models.push(
    buildTrafficLightModel(obj, TRAFFIC_LIGHT_COLOR[obj.classification.color].code, time),
  );

  function buildAxes(): ArrowPrimitive[] {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return buildObjectAxes(obj);
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, obj.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    arrows: buildAxes(),
    cubes: config != null && config.showBoundingBox ? [cube] : [],
    models,
    metadata,
  };
}

export const buildTrafficLightModel = (
  item: DeepRequired<TrafficLight>,
  color: Color,
  time: Time,
): ModelPrimitive => {
  let mapKey = getMapKey(item.classification);
  if (item.classification.mode === TrafficLight_Classification_Mode.OFF) {
    color.a = 0.2;
  } else if (item.classification.mode === TrafficLight_Classification_Mode.CONSTANT) {
    color.a = 1.0;
  } else if (item.classification.mode === TrafficLight_Classification_Mode.FLASHING) {
    const flashState = computeFlashState(time);
    color.a = flashState === "ON" ? 1.0 : 0.2;
    mapKey = mapKey.concat(flashState);
  }

  if (!modelCacheMap.has(mapKey)) {
    modelCacheMap.set(mapKey, buildGltfModel("plane", processTexture(item.classification), color));
  }

  const localAxisOrientation = eulerToQuaternion(
    item.base.orientation.roll,
    item.base.orientation.pitch,
    item.base.orientation.yaw,
  );

  const textureOffsetX = item.base.dimension.length / 2 + 0.001;

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
    color,
    "",
    modelCacheMap.get(mapKey),
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

const processTexture = (classification: DeepRequired<TrafficLight_Classification>): string => {
  const typeKey = classification.icon;
  return images[typeKey];
};

const getMapKey = (classification: TrafficLight_Classification): string => {
  return `${classification.icon}|${classification.color}|${classification.mode}`;
};
