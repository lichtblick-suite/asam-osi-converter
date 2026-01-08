import { lightStateEnumStringMaps } from "@features/movingobjects/lightstates";
import { KeyValuePair } from "@foxglove/schemas";
import {
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification_Type,
} from "@lichtblick/asam-osi-types";

export function buildMovingObjectMetadata(moving_object: MovingObject): KeyValuePair[] {
  // mandatory metadata
  const metadata: KeyValuePair[] = [
    { key: "moving_object_type", value: MovingObject_Type[moving_object.type] },
  ];

  // optional metadata content
  if (moving_object.base?.velocity) {
    metadata.push({
      key: "velocity",
      value: `${moving_object.base.velocity.x.toString()}, ${moving_object.base.velocity.y.toString()}, ${moving_object.base.velocity.z.toString()}`,
    });
  }

  if (moving_object.base?.acceleration) {
    metadata.push({
      key: "acceleration",
      value: `${moving_object.base.acceleration.x.toString()}, ${moving_object.base.acceleration.y.toString()}, ${moving_object.base.acceleration.z.toString()}`,
    });
  }

  const classification = moving_object.moving_object_classification;
  if (classification && classification.assigned_lane_id.length > 0) {
    metadata.push({
      key: "assigned_lane_id",
      value: classification.assigned_lane_id.map((id) => id.value).join(","),
    });
  }

  if (moving_object.vehicle_classification) {
    metadata.push({
      key: "type",
      value: MovingObject_VehicleClassification_Type[moving_object.vehicle_classification.type],
    });
  }

  if (moving_object.vehicle_classification?.light_state) {
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
