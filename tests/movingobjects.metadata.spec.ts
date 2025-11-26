import { buildMovingObjectMetadata } from "@features/movingobjects/metadata";
import {
  MovingObject_Type,
  MovingObject,
  MovingObject_VehicleClassification_Type,
  MovingObject_VehicleClassification_LightState_IndicatorState,
  MovingObject_VehicleClassification_LightState_BrakeLightState,
  MovingObject_VehicleClassification_LightState_GenericLightState,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

describe("OSI Visualizer: Moving Objects", () => {
  const input = {
    type: MovingObject_Type.VEHICLE,
    base: {
      acceleration: {
        x: 20,
        y: 20,
        z: 0,
      },
      velocity: {
        x: 30,
        y: 40,
        z: 0,
      },
    },
    moving_object_classification: {
      assigned_lane_id: [99, 100],
    },
    vehicle_classification: {
      type: 5,
      light_state: {
        indicator_state: 5,
        brake_light_state: 4,
        head_light: 3,
      },
    },
  } as unknown as DeepRequired<MovingObject>;

  it("builds metadata  for vehicle moving objects", () => {
    expect(buildMovingObjectMetadata(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "moving_object_type",
          value: MovingObject_Type[input.type],
        }),
        expect.objectContaining({
          key: "acceleration",
          value: `${input.base.acceleration.x}, ${input.base.acceleration.y}, ${input.base.acceleration.z}`,
        }),
        expect.objectContaining({
          key: "velocity",
          value: `${input.base.velocity.x}, ${input.base.velocity.y}, ${input.base.velocity.z}`,
        }),
        expect.objectContaining({
          key: "assigned_lane_id",
          value: input.moving_object_classification.assigned_lane_id
            .map((id) => id.value)
            .join(","),
        }),
        expect.objectContaining({
          key: "type",
          value: MovingObject_VehicleClassification_Type[input.vehicle_classification.type],
        }),
        expect.objectContaining({
          key: "light_state.indicator_state",
          value:
            MovingObject_VehicleClassification_LightState_IndicatorState[
              input.vehicle_classification.light_state.indicator_state
            ],
        }),
        expect.objectContaining({
          key: "light_state.brake_light_state",
          value:
            MovingObject_VehicleClassification_LightState_BrakeLightState[
              input.vehicle_classification.light_state.brake_light_state
            ],
        }),
        expect.objectContaining({
          key: "light_state.head_light",
          value:
            MovingObject_VehicleClassification_LightState_GenericLightState[
              input.vehicle_classification.light_state.head_light
            ],
        }),
      ]),
    );
  });
});
