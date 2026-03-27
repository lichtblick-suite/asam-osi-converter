---
sidebar_position: 1
---

# Architecture Overview

## Project structure

```
src/
├── index.ts                    # Extension entry point — registers all converters
├── converters/
│   ├── groundTruth/            # GroundTruth → SceneUpdate + FrameTransforms
│   ├── sensorView/             # SensorView → delegates to GroundTruth converter
│   └── sensorData/             # SensorData → limited SceneUpdate + FrameTransforms
├── features/
│   ├── movingobjects/          # Vehicles, pedestrians, animals
│   ├── stationaryobjects/      # Static scene objects
│   ├── lanes/                  # Lane geometry and boundaries
│   ├── logicallanes/           # Logical lane definitions
│   ├── trafficlights/          # Traffic light states and positions
│   ├── trafficsigns/           # Traffic signs with dynamic textures
│   ├── roadmarkings/           # Road marking visualizations
│   └── referenceline/          # Reference line geometry
├── utils/
│   ├── primitives/             # Foxglove primitive builders (cubes, models, lines)
│   ├── scene.ts                # Entity ID generation, deletion tracking
│   ├── math.ts                 # Quaternion math, Euler conversions
│   ├── helper.ts               # Colors, timestamps, path utilities
│   └── hashing.ts              # Entity hashing for cache keys
└── config/
    ├── constants.ts            # Colors, sizes, materials by feature
    ├── entityPrefixes.ts       # String prefixes for entity IDs
    └── frameTransformNames.ts  # Coordinate frame naming constants
```

## Message flow

```
OSI Message (GroundTruth / SensorView / SensorData)
    │
    ▼
Converter (registered via registerMessageConverter)
    │
    ├──► SceneUpdate converter
    │       │
    │       ├── Check frame cache → return cached if hit
    │       ├── Build entities via feature builders
    │       ├── Compute deletions (previous IDs − current IDs)
    │       ├── Update caches
    │       └── Return { entities, deletions }
    │
    └──► FrameTransform converter
            │
            ├── Find host vehicle by ID
            ├── Build Global → BB Center transform
            ├── Build BB Center → Rear Axle transform
            └── Return FrameTransforms
```

## Converter registration

Converters are registered as [Lichtblick message converters](https://lichtblick-suite.github.io/docs/guides/create-message-converter) in the extension entry point (`src/index.ts`). Each converter is a closure that captures a context object which persists across frames and holds caches, previous entity ID sets, and the last known panel config.

## Converter delegation

- **SensorView**: Extracts `msg.global_ground_truth` and delegates to the GroundTruth converter
- **SensorData**: Limited implementation — only renders detected lane boundaries and displays a "not supported yet" text label

## Entity ID convention

Every scene entity has a stable ID generated via:

```typescript
generateSceneEntityId(prefix, id.value)  // → "moving_object_42"
```

Prefixes are defined in `src/config/entityPrefixes.ts`:

| Prefix | Entity type |
|--------|-------------|
| `moving_object` | Vehicles, pedestrians, animals |
| `stationary_object` | Static objects |
| `traffic_sign` | Traffic signs |
| `traffic_light` | Traffic lights |
| `road_marking` | Road markings |
| `lane` | Physical lanes |
| `lane_boundary` | Physical lane boundaries |
| `logical_lane` | Logical lanes |
| `logical_lane_boundary` | Logical lane boundaries |
| `ref_line` | Reference lines |
| `detected_lane_boundaries` | SensorData detected boundaries |

Stable IDs are critical for the deletion system — `getDeletedEntities()` compares the current frame's ID set against the previous frame's to generate deletion messages for entities that disappeared.
