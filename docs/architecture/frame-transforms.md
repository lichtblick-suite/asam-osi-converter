---
sidebar_position: 5
---

# Frame Transforms

The extension produces `foxglove.FrameTransforms` messages that define the coordinate frame hierarchy for the ego vehicle. These frames are used by Lichtblick's [3D panel](https://lichtblick-suite.github.io/docs/docs/visualization/panels/3d) to correctly position camera views and sensor data relative to the vehicle.

## Frame hierarchy

```
global
  └── ego_vehicle_bb_center        (vehicle bounding box center in world coords)
        └── ego_vehicle_rear_axle  (rear axle, offset from BB center)
              └── virtual_mounting_position  (SensorData only: sensor mount point)
```

## Frame names

| Frame | Constant | Description |
|-------|----------|-------------|
| `global` | `OSI_GLOBAL_FRAME` | World coordinate system (root frame) |
| `ego_vehicle_bb_center` | `OSI_EGO_VEHICLE_BB_CENTER_FRAME` | Center of the ego vehicle's bounding box |
| `ego_vehicle_rear_axle` | `OSI_EGO_VEHICLE_REAR_AXLE_FRAME` | Rear axle position (translated from BB center) |
| `virtual_mounting_position` | `OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME` | Sensor mounting position (SensorData only) |

## Transforms by message type

### GroundTruth / SensorView

Produces **2 transforms**:

1. **Global → BB Center**: Uses `host_vehicle.base.position` and `host_vehicle.base.orientation`
2. **BB Center → Rear Axle**: Uses `host_vehicle.vehicle_attributes.bbcenter_to_rear` (pure translation in body frame)

### SensorData

Produces **1 transform**:

- **Rear Axle → Virtual Mounting Position**: Uses `mounting_position.position` and `mounting_position.orientation`

:::warning[Incomplete SensorData support]

The SensorData converter does not produce the Global → BB Center and BB Center → Rear Axle transforms. This means the virtual mounting position frame has no parent chain back to global. See [issue #147](https://github.com/lichtblick-suite/asam-osi-converter/issues/147).

:::

## Host vehicle resolution

The host vehicle is identified by `message.host_vehicle_id.value`, then located in the `moving_object` array via a single `.find()` call. The resolved object is passed directly to the transform builder functions.

**Fallback chain:**

1. Use `GroundTruth.host_vehicle_id` if present
2. Fall back to `SensorView.host_vehicle_id` if the GroundTruth value is missing
3. Warn if both are present but disagree (divergence detection)
4. Return empty transforms if neither source provides an ID

All warnings are emitted via `emitAlert()` so they appear in the Lichtblick panel UI.
