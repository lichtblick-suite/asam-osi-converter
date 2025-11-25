/**
 * @fileoverview Utilities for constructing object-related 3D primitives.
 *
 * These utilities translate OSI object state (position/orientation/size)
 * into ready-to-render Lichtblick schema primitives, and are used throughout
 * the visualization pipeline to consistently display simulated objects.
 */

import { Color, CubePrimitive, ModelPrimitive, Vector3, ArrowPrimitive } from "@foxglove/schemas";
import { StationaryObject, MovingObject } from "@lichtblick/asam-osi-types";
import { ColorCode } from "@utils/helper";
import { eulerToQuaternion, quaternionMultiplication } from "@utils/math";
import { DeepRequired } from "ts-essentials";

export function objectToCubePrimitive(
  x: number,
  y: number,
  z: number,
  roll: number,
  pitch: number,
  yaw: number,
  width: number,
  length: number,
  height: number,
  color: Color,
): CubePrimitive {
  return {
    pose: {
      position: {
        x,
        y,
        z,
      },
      orientation: eulerToQuaternion(roll, pitch, yaw),
    },
    size: {
      x: length,
      y: width,
      z: height,
    },
    color,
  };
}

export function objectToModelPrimitive(
  x: number,
  y: number,
  z: number,
  roll: number,
  pitch: number,
  yaw: number,
  width: number,
  length: number,
  height: number,
  color: Color,
  url = "",
  data: Uint8Array = new Uint8Array(),
): ModelPrimitive {
  return {
    pose: {
      position: {
        x,
        y,
        z,
      },
      orientation: eulerToQuaternion(roll, pitch, yaw),
    },
    scale: {
      x: length,
      y: width,
      z: height,
    },
    color,
    override_color: false,
    url,
    media_type: "model/gltf-binary",
    data: url.length === 0 ? data : new Uint8Array(),
  };
}

export function buildAxisArrow(
  osiObject: DeepRequired<StationaryObject> | DeepRequired<MovingObject>,
  axis_color: Color,
  orientation: Vector3 = { x: 0, y: 0, z: 0 },
  shaft_length: number,
  shaft_diameter: number,
  head_length: number,
  head_diameter: number,
  scale: number,
): ArrowPrimitive {
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
    shaft_length: shaft_length * scale,
    shaft_diameter: shaft_diameter * scale,
    head_length: head_length * scale,
    head_diameter: head_diameter * scale,
    color: axis_color,
  };
}

export function buildObjectAxes(
  osiObject: DeepRequired<StationaryObject> | DeepRequired<MovingObject>,
  shaft_length = 0.154,
  shaft_diameter = 0.02,
  head_length = 0.046,
  head_diameter = 0.05,
  scale = 2.0,
): ArrowPrimitive[] {
  return [
    buildAxisArrow(
      osiObject,
      ColorCode("r", 1),
      { x: 0, y: 0, z: 0 },
      shaft_length,
      shaft_diameter,
      head_length,
      head_diameter,
      scale,
    ),
    buildAxisArrow(
      osiObject,
      ColorCode("g", 1),
      { x: 0, y: 0, z: Math.PI / 2 },
      shaft_length,
      shaft_diameter,
      head_length,
      head_diameter,
      scale,
    ),
    buildAxisArrow(
      osiObject,
      ColorCode("b", 1),
      { x: 0, y: -Math.PI / 2, z: 0 },
      shaft_length,
      shaft_diameter,
      head_length,
      head_diameter,
      scale,
    ),
  ];
}
