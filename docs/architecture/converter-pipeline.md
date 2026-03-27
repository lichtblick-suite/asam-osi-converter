---
sidebar_position: 2
---

# Converter Pipeline

This page describes the end-to-end conversion flow for `osi3.GroundTruth → foxglove.SceneUpdate`, the primary converter. For general information about message converters, see the [Lichtblick message converter guide](https://lichtblick-suite.github.io/docs/guides/create-message-converter).

## Pipeline stages

### 1. Configuration

The converter reads panel settings from `event.topicConfig` (typed as `GroundTruthPanelSettings`). If no config is provided, it falls back to `DEFAULT_CONFIG`.

A **config signature** (JSON-stringified config) is computed. If the signature differs from the previous frame, all caches are invalidated.

### 2. Host vehicle resolution

The host vehicle is identified by `message.host_vehicle_id.value`. If absent, a fallback from the SensorView wrapper is used. Warnings are emitted via `emitAlert()` for:

- Missing host vehicle ID (both sources)
- Host vehicle ID not found in `moving_object` array
- Divergence between GroundTruth and SensorView host vehicle IDs

### 3. Frame cache check

If caching is enabled, the converter checks a `WeakMap<GroundTruth, entities>` keyed by config signature. If the exact same message object was already converted with the same config, the cached result is returned immediately.

### 4. Deletion detection

For each entity type, the converter compares current-frame entity IDs against a stored `Set<number>` from the previous frame. Missing IDs generate `SceneEntityDeletion` entries with the current timestamp.

### 5. Entity building

Entities are built by feature modules in this order:

| Step | Feature | Condition | Builder |
|------|---------|-----------|---------|
| 1 | Moving objects | Always | `buildMovingObjectEntity()` |
| 2 | Stationary objects | Always | `buildStationaryObjectEntity()` |
| 3 | Traffic signs | Always | `buildTrafficSignEntity()` |
| 4 | Traffic lights | Always | `buildTrafficLightEntity()` |
| 5 | Road markings | Always (STOP only) | `buildRoadMarkingEntity()` |
| 6 | Lane boundaries | `showPhysicalLanes` | `buildLaneBoundaryEntity()` |
| 7 | Lanes | `showPhysicalLanes` | `buildLaneEntity()` |
| 8 | Logical lane boundaries | `showLogicalLanes` | `buildLogicalLaneBoundaryEntity()` |
| 9 | Logical lanes | `showLogicalLanes` | `buildLogicalLaneEntity()` |
| 10 | Reference lines | `showReferenceLines` | `buildReferenceLineEntity()` |

### 6. Geometry cache reuse

Lane and boundary entities are expensive to rebuild. The converter uses geometry-aware caching:

```
Compute hash of lane_boundary IDs
  → If cached, reuse lane boundary entities (skip rebuild)
  → If boundaries unchanged, check lane cache too
  → Same logic for logical lanes/boundaries
```

See [Caching](caching.md) for details.

### 7. State update

After building entities:

- Update `previousXyzIds` sets for next frame's deletion detection
- Store current config and config signature
- Populate frame cache and geometry caches

### 8. Return

```typescript
{
  deletions: SceneEntityDeletion[],  // Entities removed since last frame
  entities: SceneEntity[]            // All current-frame entities
}
```

## Error handling

The entire conversion is wrapped in `try/catch`. On failure:

- Error is logged to `console.error`
- An alert is emitted with `severity: "error"`
- An empty `SceneUpdate` (no entities) is returned — deletions are still applied
- Exceptions never propagate to the Lichtblick runtime

## Feature builder pattern

Each feature module exports:

- `build*Entity()` — Creates a `PartialSceneEntity` with Foxglove primitives (cubes, models, triangles, arrows)
- `build*Metadata()` — Creates `KeyValuePair[]` metadata for panel displays

Builders receive the OSI entity cast as `DeepRequired<T>` (from `ts-essentials`), which satisfies TypeScript but does **not** validate field presence at runtime.
