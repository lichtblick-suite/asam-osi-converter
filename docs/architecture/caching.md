---
sidebar_position: 3
---

# Caching

The converter uses a multi-layer caching system to avoid redundant work across frames. This is critical for performance — lane geometry and 3D models rarely change between frames but are expensive to rebuild.

## Cache layers

### Frame cache

**Purpose:** Skip entire conversion if the same message object arrives again with the same config.

| Property      | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| Structure     | `Map<configSignature, WeakMap<GroundTruth, PartialSceneEntity[]>>` |
| Key           | Config signature (outer), message object reference (inner)         |
| Hit condition | Same config + same message object identity                         |
| Invalidation  | Outer map entry cleared when config signature changes              |

The `WeakMap` allows garbage collection of message objects no longer referenced by the runtime.

### Lane boundary cache

**Purpose:** Reuse rendered lane boundary entities when the set of boundaries hasn't changed.

| Property      | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Structure     | `Map<string, PartialSceneEntity[]>`                    |
| Key           | Hash of all `lane_boundary[].id` values                |
| Hit condition | Same set of boundary IDs (regardless of data changes)  |
| Invalidation  | Cleared on config change or when `caching` is disabled |

### Lane cache

**Purpose:** Reuse rendered lane entities when both lanes and their referenced boundaries are unchanged.

| Property      | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Structure     | `Map<string, PartialSceneEntity[]>`                       |
| Key           | Hash of all `lane[].id` values                            |
| Hit condition | Boundary cache was hit **and** same set of lane IDs       |
| Invalidation  | Cleared on config change; depends on boundary cache state |

:::note[Cache dependency]

The lane cache is only checked if the boundary cache was hit. This ensures coherence — if boundaries changed, lanes must be rebuilt even if their IDs are the same.

:::

### Logical lane boundary / lane caches

Same pattern as physical lane caches, for `LogicalLaneBoundary` and `LogicalLane` entities.

### Model cache

**Purpose:** Reuse loaded 3D model primitives across frames.

| Property      | Value                                                 |
| ------------- | ----------------------------------------------------- |
| Structure     | `Map<string, ModelPrimitive>`                         |
| Key           | `defaultModelPath + model_reference` (full file path) |
| Hit condition | Same model path                                       |
| Invalidation  | Cleared on config change                              |

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

## Multi-panel behavior

A single converter instance (one `GroundTruthContext`) is shared by **every panel** that subscribes to the topic. The 3D panel and the Image (camera) panel are separate `PanelExtensionAdapter` instances; each one invokes the converter **independently, once per render tick**, passing its own `event.topicConfig`. Lichtblick does not deduplicate conversion across panels, and the message pipeline hands each subscriber its own array of **shared message references** — so both panels call the converter with the **same `GroundTruth` object**.

### Why the frame cache is keyed by config, not just the message

The cached value is the rendered `SceneUpdate`, which is a function of **(message, config)** — not the message alone. The same `GroundTruth` yields different entities depending on the panel's settings:

- `showPhysicalLanes` / `showLogicalLanes` / `showReferenceLines` — whether those categories appear at all
- `showBoundingBox` vs `show3dModels` — cubes vs glTF models for objects
- `showAxes` — whether axis arrows are added
- `defaultModelPath` — the model URLs

So two panels with **different** settings legitimately need **different** results from the same message and cannot share a cached `SceneUpdate`. Two panels with the **same** settings share a `configSignature` and therefore reuse the frame cache **across panels** (the second panel gets a cache hit).

Even across _different_ configs, the expensive per-feature geometry is still shared: lane/boundary/model entities are keyed by **data content** (entity IDs / model path), so whichever panel converts first builds them and the other reuses them. Only the cheap final assembly (which categories to concatenate, per-object cube primitives) is redone per config. Because the config signature is tracked **per consumer** (see below), two panels with different settings no longer thrash the shared caches.

### Why deletions are tracked per consumer

`SceneEntityDeletion`s are a **per-scene delta** — "what to remove from _this panel's_ accumulated scene since _its_ last frame" — not a per-timestamp value. Each panel keeps its own scene, and the same timestamp can require different deletions per panel (e.g. one panel just toggled a category off and must delete it; the other did not). The `previous*Ids` sets therefore live in a per-consumer `GroundTruthState`, stored in `ctx.consumerStates` keyed by the panel's `topicConfig` object identity (falling back to `DEFAULT_CONFIG`).

A single shared set is **incorrect**, not merely slower: panel invocation order is non-deterministic, so whichever panel converts first would consume the deletion and leave the others showing a stale entity. This previously caused a moving object that left the data to disappear in one panel while remaining in the other.

Two panels that are both at **default settings** are a special case: each has `topicConfig === undefined`, so both fall back to the shared `DEFAULT_CONFIG` key and therefore share one state. To keep deletions correct there, the deletion computation is **idempotent per message object** — both panels receive the same `GroundTruth` object, so only the first call diffs the previous-frame id sets; the others reuse the cached result (`state.previousDeletionMessage` / `previousDeletionResult`) instead of re-diffing.

:::note[Why we can't "compute once per timestamp"]

Lichtblick invokes message converters **per subscribing panel**, not once per message. We cannot change that from inside an extension. What we _can_ do — and do — is make the heavy work message-keyed (geometry caches shared across panels) while keeping the genuinely panel-specific work (config-gated assembly and per-scene deletions) cheap and isolated.

This per-consumer, data-driven deletion tracking is a workaround for a framework limitation — SceneUpdate converters are forced to be stateful to emit deletions. Tracked upstream in [lichtblick-suite/lichtblick#1195](https://github.com/lichtblick-suite/lichtblick/issues/1195); it can be simplified once the framework supports self-contained scene updates.

:::
