---
sidebar_position: 4
---

# Features

Each feature module in `src/features/` is responsible for converting one OSI entity type into [Foxglove scene primitives](https://lichtblick-suite.github.io/docs/docs/visualization/message-schemas).

## Moving objects

**Module:** `src/features/movingobjects/`
**OSI type:** `MovingObject`
**Primitives:** CubePrimitive, ModelPrimitive, ArrowPrimitive

Renders vehicles, pedestrians, and animals. The host vehicle is colored blue; others are colored by type:

| Type | Color |
|------|-------|
| VEHICLE | Red |
| PEDESTRIAN | Yellow |
| ANIMAL | Green |
| HOST_OBJECT | Blue |
| UNKNOWN | Gray |
| OTHER | Cyan |

Includes optional 3D model rendering (when `show3dModels` is enabled) and light state visualization for vehicles (brake lights, indicators).

## Stationary objects

**Module:** `src/features/stationaryobjects/`
**OSI type:** `StationaryObject`
**Primitives:** CubePrimitive, ModelPrimitive, ArrowPrimitive

Renders static scene objects with bounding boxes. Colors are determined by the object's `classification.color` field. Supports 3D model loading.

## Traffic lights

**Module:** `src/features/trafficlights/`
**OSI type:** `TrafficLight`
**Primitives:** ModelPrimitive (embedded glTF with texture), CubePrimitive, ArrowPrimitive

Renders traffic lights using built-in 3D models with dynamically colored textures based on the light state (red, yellow, green). Includes mode handling (standard, flashing, counting).

## Traffic signs

**Module:** `src/features/trafficsigns/`
**OSI type:** `TrafficSign` (main + supplementary)
**Primitives:** ModelPrimitive

Renders traffic signs using dynamically loaded PNG textures. Textures are preloaded at extension activation via `preloadDynamicTextures()` and cached for reuse.

## Road markings

**Module:** `src/features/roadmarkings/`
**OSI type:** `RoadMarking`
**Primitives:** CubePrimitive

Renders road markings (currently STOP and ZEBRA_CROSSING markings only) as oriented cubes. Position is centered on `base.position`, orientation applied from `base.orientation`, and dimensions follow the OSI road marking coordinate system where the x-axis is the surface normal (paint thickness = `length`), the y-axis spans the `width` and the z-axis spans the `height` from the 'bottom' to the 'top' of the marking image (normally the driving direction).

Zebra crossings of type `SYMBOLIC_TRAFFIC_SIGN` (StVO 293) are split into 0.5 m stripes with 0.5 m gaps along the local y-axis, each stripe spanning the full `height` along the local z-axis. Other zebra crossing types (e.g. a painted StVO 350 sign image) render as a single solid box.

:::note

Only road markings with `traffic_main_sign_type` of `STOP` or `ZEBRA_CROSSING` are currently rendered. Other marking types are filtered out.

Position and orientation are taken as-is from the global ground truth frame. A marking lying flat on the road therefore needs `pitch = -π/2` (x-axis up) and `yaw + roll = lane heading + π` (z-axis along the driving direction), as in `example-data/MovingHostWithStopLine.mcap`. Traces with identity orientation render as upright markings.

:::

## Lanes

**Module:** `src/features/lanes/`
**OSI type:** `Lane`, `LaneBoundary`
**Primitives:** TriangleListPrimitive

Renders lane surfaces and lane boundaries as triangle meshes. Lane boundaries are extruded from point lists with width and optional dashing. Lanes are filled surfaces connecting their left and right boundaries.

Lane colors vary by type:

| Type | Color |
|------|-------|
| DRIVING | Cyan |
| INTERSECTION | Red |
| NONDRIVING | Coral |
| UNKNOWN / OTHER | Gray |

The host vehicle's lane is highlighted in orange when identifiable.

See [Lanes Reference](../reference/lanes.md) for detailed color tables.

## Logical lanes

**Module:** `src/features/logicallanes/`
**OSI type:** `LogicalLane`, `LogicalLaneBoundary`
**Primitives:** TriangleListPrimitive

Same rendering approach as physical lanes but with distinct colors (green surfaces, red boundaries) and a slight height offset (`0.02m`) to visually separate them from physical lanes.

See [Logical Lanes Reference](../reference/logical-lanes.md) for details.

## Reference lines

**Module:** `src/features/referenceline/`
**OSI type:** `ReferenceLine`
**Primitives:** TriangleListPrimitive

Renders reference lines as green line strips with a configurable width (`0.2m`).
