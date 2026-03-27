---
sidebar_position: 2
---

# Panel Settings

The extension provides panel settings that control what is visualized in the [3D panel](https://lichtblick-suite.github.io/docs/docs/visualization/panels/3d). Settings are accessible via the topic configuration in panels that support `"3D"` or `"Image"` output.

## Configuration options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `caching` | boolean | `true` | Enable caching of lane and boundary geometry across frames |
| `showAxes` | boolean | `true` | Display coordinate axes on objects |
| `showPhysicalLanes` | boolean | `true` | Render physical lane geometry and boundaries |
| `showLogicalLanes` | boolean | `false` | Render logical lane geometry and boundaries |
| `showReferenceLines` | boolean | `true` | Render reference line geometry |
| `showBoundingBox` | boolean | `true` | Display bounding boxes for moving and stationary objects |
| `show3dModels` | boolean | `false` | Load and render 3D models from `model_reference` fields |
| `defaultModelPath` | string | `"/opt/models/vehicles/"` | Base file path for resolving 3D model references |

## How settings flow into converters

```
Panel UI → event.topicConfig (typed as GroundTruthPanelSettings)
         → converter function reads topicConfig
         → falls back to DEFAULT_CONFIG when topicConfig is undefined
```

Settings changes trigger **full cache invalidation** — all cached lane geometry, boundaries, and models are discarded and rebuilt on the next frame.

## Visibility toggles

- **Physical lanes** (`showPhysicalLanes`): Controls rendering of `Lane` and `LaneBoundary` entities. When disabled, these entities are not built and their caches are not populated.
- **Logical lanes** (`showLogicalLanes`): Controls rendering of `LogicalLane` and `LogicalLaneBoundary` entities. Off by default since these can be visually dense.
- **Reference lines** (`showReferenceLines`): Controls rendering of `ReferenceLine` entities.
- **Bounding boxes** (`showBoundingBox`): Toggles the wireframe cube around moving objects, stationary objects, and traffic lights.
- **3D models** (`show3dModels`): When enabled, the converter loads glTF/GLB models from disk using `defaultModelPath + model_reference`. Models are cached in memory after first load.

## 3D model loading

When `show3dModels` is `true`, the converter resolves model paths as:

```
defaultModelPath + object.model_reference
```

For example, with the default path `/opt/models/vehicles/` and a moving object with `model_reference = "sedan.glb"`, the converter loads `/opt/models/vehicles/sedan.glb`.

Models are cached in the `modelCache` (keyed by full path) and reused across frames until panel settings change.
