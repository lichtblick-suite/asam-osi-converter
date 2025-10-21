import { GroundTruthPanelSettings } from "@converters";
import {
  BrakeLightSide,
  buildBrakeLight,
  buildIndicatorLight,
  IndicatorLightSide,
  lightStateEnumStringMaps,
} from "@features/lightstates";
import { Color, CubePrimitive, KeyValuePair, ModelPrimitive, Vector3 } from "@foxglove/schemas";
import {
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification_Type,
  StationaryObject,
} from "@lichtblick/asam-osi-types";
import { Time } from "@lichtblick/suite";
import { eulerToQuaternion, quaternionMultiplication } from "@utils/geometry";
import { ColorCode, convertPathToFileUrl } from "@utils/helper";
import { objectToCubePrimitive, objectToModelPrimitive } from "@utils/marker";
import { generateSceneEntityId, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import {
  STATIONARY_OBJECT_COLOR,
  STATIONARY_OBJECT_DENSITY,
  STATIONARY_OBJECT_MATERIAL,
  STATIONARY_OBJECT_TYPE,
} from "@/config/colors";

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
    { r: 0, g: 0, b: 0, a: 0 },
    convertPathToFileUrl(modelFullPath),
  );
  return model_primitive;
}

export function buildObjectEntity(
  osiObject: DeepRequired<MovingObject> | DeepRequired<StationaryObject>,
  color: Color,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: GroundTruthPanelSettings | undefined,
  modelCache: Map<string, ModelPrimitive>,
  metadata?: KeyValuePair[],
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

  const SHAFT_LENGTH = 0.154;
  const SHAFT_DIAMETER = 0.02;
  const HEAD_LENGTH = 0.046;
  const HEAD_DIAMETER = 0.05;
  const SCALE = 2.0;

  function buildAxisArrow(axis_color: Color, orientation: Vector3 = { x: 0, y: 0, z: 0 }) {
    const baseOrientation = eulerToQuaternion(
      osiObject.base.orientation.roll,
      osiObject.base.orientation.pitch,
      osiObject.base.orientation.yaw,
    );
    const localAxisOrientation = eulerToQuaternion(orientation.x, orientation.y, orientation.z);
    const globalAxisOrientation = quaternionMultiplication(baseOrientation, localAxisOrientation);
    return {
      pose: {
        position: {
          x: osiObject.base.position.x,
          y: osiObject.base.position.y,
          z: osiObject.base.position.z,
        },
        orientation: globalAxisOrientation,
      },
      shaft_length: SHAFT_LENGTH * SCALE,
      shaft_diameter: SHAFT_DIAMETER * SCALE,
      head_length: HEAD_LENGTH * SCALE,
      head_diameter: HEAD_DIAMETER * SCALE,
      color: axis_color,
    };
  }

  function buildAxes() {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return [
      buildAxisArrow(ColorCode("r", 1), { x: 0, y: 0, z: 0 }),
      buildAxisArrow(ColorCode("g", 1), { x: 0, y: 0, z: Math.PI / 2 }),
      buildAxisArrow(ColorCode("b", 1), { x: 0, y: -Math.PI / 2, z: 0 }),
    ];
  }

  function hasBrakeLightState(obj: MovingObject | StationaryObject): obj is MovingObject {
    return (
      "vehicle_classification" in obj &&
      obj.vehicle_classification?.light_state?.brake_light_state != undefined
    );
  }

  function hasIndicatorState(obj: MovingObject | StationaryObject): obj is MovingObject {
    return (
      "vehicle_classification" in obj &&
      obj.vehicle_classification?.light_state?.indicator_state != undefined
    );
  }

  function buildVehicleLights() {
    const lights: CubePrimitive[] = [];

    if (hasBrakeLightState(osiObject)) {
      lights.push(buildBrakeLight(osiObject, BrakeLightSide.Left));
      lights.push(buildBrakeLight(osiObject, BrakeLightSide.Right));
    }
    if (hasIndicatorState(osiObject)) {
      lights.push(buildIndicatorLight(osiObject, IndicatorLightSide.FrontLeft));
      lights.push(buildIndicatorLight(osiObject, IndicatorLightSide.FrontRight));
      lights.push(buildIndicatorLight(osiObject, IndicatorLightSide.RearLeft));
      lights.push(buildIndicatorLight(osiObject, IndicatorLightSide.RearRight));
    }
    return lights;
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

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, osiObject.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: config != null && config.showBoundingBox ? [cube, ...buildVehicleLights()] : [],
    arrows: buildAxes(),
    metadata,
    models: getUpdatedModelPrimitives(),
  };
}

export function buildMovingObjectMetadata(
  moving_object: DeepRequired<MovingObject>,
): KeyValuePair[] {
  // mandatory metadata
  const metadata: KeyValuePair[] = [
    { key: "moving_object_type", value: MovingObject_Type[moving_object.type] },
  ];

  // optional metadata content
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (moving_object.base.velocity != null) {
    metadata.push({
      key: "velocity",
      value: `${moving_object.base.velocity.x}, ${moving_object.base.velocity.y}, ${moving_object.base.velocity.z}`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (moving_object.base.acceleration != null) {
    metadata.push({
      key: "acceleration",
      value: `${moving_object.base.acceleration.x}, ${moving_object.base.acceleration.y}, ${moving_object.base.acceleration.z}`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (moving_object.moving_object_classification?.assigned_lane_id.length > 0) {
    metadata.push({
      key: "assigned_lane_id",
      value: moving_object.moving_object_classification.assigned_lane_id
        .map((id) => id.value)
        .join(","),
    });
  }

  if (
    moving_object.type === MovingObject_Type.VEHICLE &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    moving_object.vehicle_classification != null
  ) {
    metadata.push({
      key: "type",
      value: MovingObject_VehicleClassification_Type[moving_object.vehicle_classification.type],
    });
  }

  if (
    moving_object.type === MovingObject_Type.VEHICLE &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    moving_object.vehicle_classification?.light_state != null
  ) {
    metadata.push(
      ...Object.entries(moving_object.vehicle_classification.light_state).map(([key, value]) => {
        return {
          key: `light_state.${key}`,
          value:
            lightStateEnumStringMaps[key]?.[value] ??
            lightStateEnumStringMaps.generic_light_state[value]!,
        };
      }),
    );
  }
  return metadata;
}

export function buildStationaryMetadata(obj: DeepRequired<StationaryObject>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "density",
      value: STATIONARY_OBJECT_DENSITY[obj.classification.density] || STATIONARY_OBJECT_DENSITY[0],
    },
    {
      key: "material",
      value:
        STATIONARY_OBJECT_MATERIAL[obj.classification.material] || STATIONARY_OBJECT_MATERIAL[0],
    },
    {
      key: "color",
      value:
        STATIONARY_OBJECT_COLOR[obj.classification.color].name || STATIONARY_OBJECT_COLOR[0].name,
    },
    {
      key: "type",
      value: STATIONARY_OBJECT_TYPE[obj.classification.type] || STATIONARY_OBJECT_TYPE[0],
    },
  ];

  return metadata;
}
