---
sidebar_position: 3
---

# Caching

The converter uses a multi-layer caching system to avoid redundant work across frames. This is critical for performance — lane geometry and 3D models rarely change between frames but are expensive to rebuild.

## Cache layers

### Frame cache

**Purpose:** Skip entire conversion if the same message object arrives again with the same config.

| Property | Value |
|----------|-------|
| Structure | `Map<configSignature, WeakMap<GroundTruth, PartialSceneEntity[]>>` |
| Key | Config signature (outer), message object reference (inner) |
| Hit condition | Same config + same message object identity |
| Invalidation | Outer map entry cleared when config signature changes |

The `WeakMap` allows garbage collection of message objects no longer referenced by the runtime.

### Lane boundary cache

**Purpose:** Reuse rendered lane boundary entities when the set of boundaries hasn't changed.

| Property | Value |
|----------|-------|
| Structure | `Map<string, PartialSceneEntity[]>` |
| Key | Hash of all `lane_boundary[].id` values |
| Hit condition | Same set of boundary IDs (regardless of data changes) |
| Invalidation | Cleared on config change or when `caching` is disabled |

### Lane cache

**Purpose:** Reuse rendered lane entities when both lanes and their referenced boundaries are unchanged.

| Property | Value |
|----------|-------|
| Structure | `Map<string, PartialSceneEntity[]>` |
| Key | Hash of all `lane[].id` values |
| Hit condition | Boundary cache was hit **and** same set of lane IDs |
| Invalidation | Cleared on config change; depends on boundary cache state |

:::note[Cache dependency]

The lane cache is only checked if the boundary cache was hit. This ensures coherence — if boundaries changed, lanes must be rebuilt even if their IDs are the same.

:::

### Logical lane boundary / lane caches

Same pattern as physical lane caches, for `LogicalLaneBoundary` and `LogicalLane` entities.

### Model cache

**Purpose:** Reuse loaded 3D model primitives across frames.

| Property | Value |
|----------|-------|
| Structure | `Map<string, ModelPrimitive>` |
| Key | `defaultModelPath + model_reference` (full file path) |
| Hit condition | Same model path |
| Invalidation | Cleared on config change |

## Invalidation triggers

All caches are cleared when:

- Panel settings change (detected by comparing JSON-stringified config signatures)
- The `caching` panel setting is `false` (geometry caches are bypassed entirely)

## Cache flow diagram

```
New frame arrives
    │
    ├── Config changed? → Clear ALL caches
    │
    ├── Frame cache hit? → Return cached entities (skip everything)
    │
    ├── Boundary IDs unchanged?
    │       ├── Yes → Reuse boundary entities
    │       │         └── Lane IDs unchanged? → Reuse lane entities
    │       └── No  → Rebuild boundaries and lanes
    │
    ├── Build remaining entities (moving objects, signs, etc.)
    │
    └── Update all caches
```

## Performance characteristics

- **Best case** (frame cache hit): O(1) — returns cached array directly
- **Static scene** (boundary/lane cache hits): Only moving objects, signs, and lights are rebuilt
- **Config change**: Full rebuild of all entities (unavoidable)
- **Typical frame**: Moving objects rebuilt (they change position), geometry reused from cache
