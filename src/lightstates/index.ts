import { CubePrimitive, Vector3, type Color } from "@foxglove/schemas";
import {
  MovingObject,
  MovingObject_VehicleClassification_LightState_IndicatorState,
} from "@lichtblick/asam-osi-types";
import { eulerToQuaternion, pointRotationByQuaternion } from "@utils/geometry";
import { objectToCubePrimitive } from "@utils/marker";
import { DeepRequired } from "ts-essentials";

import { BRAKE_LIGHT_COLOR } from "../config";

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

const BRAKE_LIGHT_DIMENSIONS: Vector3 = { x: 0.5, y: 0.25, z: 0.25 };
const BRAKE_LIGHT_POSITION_Y_OFFSET = 0.25;

const INDICATOR_ON_COLOR: Color = { r: 1.0, g: 0.8, b: 0.0, a: 0.7 };
const INDICATOR_OFF_COLOR: Color = { r: 0.5, g: 0.5, b: 0.0, a: 0.7 };
const INDICATOR_LIGHT_DIMENSIONS: Vector3 = { x: 0.25, y: 0.25, z: 0.25 };
const INDICATOR_LIGHT_POSITION_Y_OFFSET = 0.125;
const INDICATOR_LIGHT_POSITION_Z_OFFSET = 0.25;

export const buildBrakeLight = (
  moving_obj: DeepRequired<MovingObject>,
  side: BrakeLightSide,
): CubePrimitive => {
  const brakeLightColor =
    BRAKE_LIGHT_COLOR[moving_obj.vehicle_classification.light_state.brake_light_state];

  const directionMultiplier = side === BrakeLightSide.Left ? 1 : -1;
  const localAxisOffset: Vector3 = {
    x: -(moving_obj.base.dimension.length / 2),
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
    BRAKE_LIGHT_DIMENSIONS.x,
    BRAKE_LIGHT_DIMENSIONS.y,
    BRAKE_LIGHT_DIMENSIONS.z,
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
        ? moving_obj.base.dimension.length / 2
        : -(moving_obj.base.dimension.length / 2),
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
    INDICATOR_LIGHT_DIMENSIONS.x,
    INDICATOR_LIGHT_DIMENSIONS.y,
    INDICATOR_LIGHT_DIMENSIONS.z,
    lightOn ? INDICATOR_ON_COLOR : INDICATOR_OFF_COLOR,
  );
};
