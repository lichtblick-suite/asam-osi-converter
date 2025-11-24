import { lightStateEnumStringMaps } from "@features/movingobjects/lightstates";
import { KeyValuePair } from "@foxglove/schemas";
import {
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification_Type,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

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
