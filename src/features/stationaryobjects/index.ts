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
import { DeepRequired } from "ts-essentials";

import { buildStationaryMetadata } from "./metadata";

export function createModelPrimitive(
  movingObject: DeepRequired<MovingObject>,
  modelFullPath: string,
): ModelPrimitive {
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

export function buildStationaryObjectEntity(
  osiObject: DeepRequired<StationaryObject>,
  color: Color,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
  modelCache: Map<string, ModelPrimitive>,
): PartialSceneEntity {
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

  function getUpdatedModelPrimitives(): ModelPrimitive[] {
    if (config != null && config.show3dModels) {
      const model_path = config.defaultModelPath + osiObject.model_reference;
      const model_primitive = modelCache.get(model_path);
      if (model_primitive == undefined) {
        return [];
      }

      model_primitive.pose.position.x = osiObject.base.position.x;
      model_primitive.pose.position.y = osiObject.base.position.y;
      model_primitive.pose.position.z =
        osiObject.base.position.z - osiObject.base.dimension.height / 2;
      model_primitive.pose.orientation = eulerToQuaternion(
        osiObject.base.orientation.roll,
        osiObject.base.orientation.pitch,
        osiObject.base.orientation.yaw,
      );

      return [model_primitive];
    }

    return [];
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
    models: getUpdatedModelPrimitives(),
  };
}
