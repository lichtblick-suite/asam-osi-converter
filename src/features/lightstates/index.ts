import { CubePrimitive, Vector3, type Color } from "@foxglove/schemas";
import {
  MovingObject,
  MovingObject_VehicleClassification_LightState_IndicatorState,
  Dimension3d,
  MovingObject_VehicleClassification_LightState_BrakeLightState,
  MovingObject_VehicleClassification_LightState_GenericLightState,
} from "@lichtblick/asam-osi-types";
import { eulerToQuaternion, pointRotationByQuaternion } from "@utils/geometry";
import { objectToCubePrimitive } from "@utils/marker";
import { DeepRequired } from "ts-essentials";

import { BRAKE_LIGHT_COLOR } from "@/config/colors";

export interface IlightStateEnumStringMaps {
  generic_light_state: typeof MovingObject_VehicleClassification_LightState_GenericLightState;
  [key: string]: Record<number, string>;
}

export const lightStateEnumStringMaps: IlightStateEnumStringMaps = {
  indicator_state: MovingObject_VehicleClassification_LightState_IndicatorState,
  brake_light_state: MovingObject_VehicleClassification_LightState_BrakeLightState,
  generic_light_state: MovingObject_VehicleClassification_LightState_GenericLightState,
};

export enum BrakeLightSide {
  Left,
  Right,
}

export enum IndicatorLightSide {
  FrontLeft,
  FrontRight,
  RearLeft,
  RearRight,
}

const BRAKE_LIGHT_DIMENSIONS: Dimension3d = { width: 0.5, length: 0.25, height: 0.25 };
const BRAKE_LIGHT_POSITION_X_OFFSET = BRAKE_LIGHT_DIMENSIONS.length! / 2;
const BRAKE_LIGHT_POSITION_Y_OFFSET = BRAKE_LIGHT_DIMENSIONS.width! / 2;

const INDICATOR_ON_COLOR: Color = { r: 1.0, g: 0.8, b: 0.0, a: 0.7 };
const INDICATOR_OFF_COLOR: Color = { r: 0.5, g: 0.5, b: 0.0, a: 0.7 };
const INDICATOR_LIGHT_DIMENSIONS: Dimension3d = { width: 0.25, length: 0.25, height: 0.25 };
const INDICATOR_LIGHT_POSITION_X_OFFSET = INDICATOR_LIGHT_DIMENSIONS.length! / 2;
const INDICATOR_LIGHT_POSITION_Y_OFFSET = INDICATOR_LIGHT_DIMENSIONS.width! / 2;
const INDICATOR_LIGHT_POSITION_Z_OFFSET = BRAKE_LIGHT_DIMENSIONS.height!;

export const buildBrakeLight = (
  moving_obj: DeepRequired<MovingObject>,
  side: BrakeLightSide,
): CubePrimitive => {
  const brakeLightColor =
    BRAKE_LIGHT_COLOR[moving_obj.vehicle_classification.light_state.brake_light_state];

  const directionMultiplier = side === BrakeLightSide.Left ? 1 : -1;
  const localAxisOffset: Vector3 = {
    x: -(moving_obj.base.dimension.length / 2) + BRAKE_LIGHT_POSITION_X_OFFSET,
    y:
      directionMultiplier * (moving_obj.base.dimension.width / 2) -
      BRAKE_LIGHT_POSITION_Y_OFFSET * directionMultiplier,
    z: 0.0,
  };
  const baseOrientation = eulerToQuaternion(
    moving_obj.base.orientation.roll,
    moving_obj.base.orientation.pitch,
    moving_obj.base.orientation.yaw,
  );
  const globalOffset = pointRotationByQuaternion(localAxisOffset, baseOrientation);

  return objectToCubePrimitive(
    moving_obj.base.position.x + globalOffset.x,
    moving_obj.base.position.y + globalOffset.y,
    moving_obj.base.position.z + globalOffset.z,
    moving_obj.base.orientation.roll,
    moving_obj.base.orientation.pitch,
    moving_obj.base.orientation.yaw,
    BRAKE_LIGHT_DIMENSIONS.width!,
    BRAKE_LIGHT_DIMENSIONS.length!,
    BRAKE_LIGHT_DIMENSIONS.height!,
    brakeLightColor,
  );
};

export const buildIndicatorLight = (
  moving_obj: DeepRequired<MovingObject>,
  side: IndicatorLightSide,
): CubePrimitive => {
  let lightOn = false;
  switch (moving_obj.vehicle_classification.light_state.indicator_state) {
    case MovingObject_VehicleClassification_LightState_IndicatorState.LEFT:
      if (side === IndicatorLightSide.FrontLeft || side === IndicatorLightSide.RearLeft) {
        lightOn = true;
      } else {
        lightOn = false;
      }
      break;
    case MovingObject_VehicleClassification_LightState_IndicatorState.RIGHT:
      if (side === IndicatorLightSide.FrontRight || side === IndicatorLightSide.RearRight) {
        lightOn = true;
      } else {
        lightOn = false;
      }
      break;
    case MovingObject_VehicleClassification_LightState_IndicatorState.WARNING:
      lightOn = true;
      break;
    default:
      lightOn = false;
      break;
  }

  const localAxisOffset: Vector3 = {
    x:
      side === IndicatorLightSide.FrontLeft || side === IndicatorLightSide.FrontRight
        ? moving_obj.base.dimension.length / 2 - INDICATOR_LIGHT_POSITION_X_OFFSET
        : -(moving_obj.base.dimension.length / 2) + INDICATOR_LIGHT_POSITION_X_OFFSET,
    y:
      side === IndicatorLightSide.FrontLeft || side === IndicatorLightSide.RearLeft
        ? moving_obj.base.dimension.width / 2 - INDICATOR_LIGHT_POSITION_Y_OFFSET
        : -moving_obj.base.dimension.width / 2 + INDICATOR_LIGHT_POSITION_Y_OFFSET,
    z: INDICATOR_LIGHT_POSITION_Z_OFFSET,
  };
  const baseOrientation = eulerToQuaternion(
    moving_obj.base.orientation.roll,
    moving_obj.base.orientation.pitch,
    moving_obj.base.orientation.yaw,
  );
  const globalOffset = pointRotationByQuaternion(localAxisOffset, baseOrientation);

  return objectToCubePrimitive(
    moving_obj.base.position.x + globalOffset.x,
    moving_obj.base.position.y + globalOffset.y,
    moving_obj.base.position.z + globalOffset.z,
    moving_obj.base.orientation.roll,
    moving_obj.base.orientation.pitch,
    moving_obj.base.orientation.yaw,
    INDICATOR_LIGHT_DIMENSIONS.width!,
    INDICATOR_LIGHT_DIMENSIONS.length!,
    INDICATOR_LIGHT_DIMENSIONS.height!,
    lightOn ? INDICATOR_ON_COLOR : INDICATOR_OFF_COLOR,
  );
};
