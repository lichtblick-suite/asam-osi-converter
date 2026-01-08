import { GroundTruthPanelSettings } from "@converters";
import { ArrowPrimitive, Color, ModelPrimitive } from "@foxglove/schemas";
import { MovingObject, StationaryObject } from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { convertPathToFileUrl } from "@utils/helper";
import { eulerToQuaternion } from "@utils/math";
import {
  buildObjectAxes,
  objectToCubePrimitive,
  objectToModelPrimitive,
} from "@utils/primitives/objects";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";

import { buildStationaryMetadata } from "./metadata";

export function createModelPrimitive(
  movingObject: MovingObject,
  modelFullPath: string,
): ModelPrimitive {
  if (
    !movingObject.base?.position ||
    !movingObject.base.orientation ||
    !movingObject.base.dimension
  ) {
    throw Error("Missing moving object information");
  }
  const model_primitive = objectToModelPrimitive(
    movingObject.base.position.x,
    movingObject.base.position.y,
    movingObject.base.position.z - movingObject.base.dimension.height / 2,
    movingObject.base.orientation.roll,
    movingObject.base.orientation.pitch,
    movingObject.base.orientation.yaw,
    1,
    1,
    1,
    convertPathToFileUrl(modelFullPath),
  );
  return model_primitive;
}

function getUpdatedModelPrimitives(
  { show3dModels }: { show3dModels: boolean },
  defaultModelPath: string,
  modelRef: string,
  modelCache: Map<string, ModelPrimitive>,
  x: number,
  y: number,
  z: number,
  roll: number,
  pitch: number,
  yaw: number,
  height: number,
): ModelPrimitive[] {
  if (show3dModels) {
    const model_path = defaultModelPath + modelRef;
    const model_primitive = modelCache.get(model_path);
    if (model_primitive == undefined) {
      return [];
    }

    model_primitive.pose.position.x = x;
    model_primitive.pose.position.y = y;
    model_primitive.pose.position.z = z - height / 2;
    model_primitive.pose.orientation = eulerToQuaternion(roll, pitch, yaw);

    return [model_primitive];
  }

  return [];
}

export function buildStationaryObjectEntity(
  osiObject: StationaryObject,
  color: Color,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
  modelCache: Map<string, ModelPrimitive>,
): PartialSceneEntity {
  if (
    !osiObject.id ||
    !osiObject.base?.position ||
    !osiObject.base.orientation ||
    !osiObject.base.dimension
  ) {
    throw Error("Missing stationary object information");
  }
  const cube = objectToCubePrimitive(
    osiObject.base.position.x,
    osiObject.base.position.y,
    osiObject.base.position.z,
    osiObject.base.orientation.roll,
    osiObject.base.orientation.pitch,
    osiObject.base.orientation.yaw,
    osiObject.base.dimension.width,
    osiObject.base.dimension.length,
    osiObject.base.dimension.height,
    color,
  );

  function buildAxes(): ArrowPrimitive[] {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return buildObjectAxes(osiObject);
  }

  // Build metadata
  const metadata = buildStationaryMetadata(osiObject);

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, osiObject.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: config != null && config.showBoundingBox ? [cube] : [],
    arrows: buildAxes(),
    metadata,
    models: getUpdatedModelPrimitives(
      { show3dModels: config?.show3dModels ?? false },
      config?.defaultModelPath ?? "",
      osiObject.model_reference,
      modelCache,
      osiObject.base.position.x,
      osiObject.base.position.y,
      osiObject.base.position.z,
      osiObject.base.orientation.pitch,
      osiObject.base.orientation.roll,
      osiObject.base.orientation.yaw,
      osiObject.base.dimension.height,
    ),
  };
}
