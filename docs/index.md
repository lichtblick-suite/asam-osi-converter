---
slug: /
sidebar_position: 1
---

# ASAM OSI Converter

A [Lichtblick](https://github.com/Lichtblick-Suite/lichtblick) extension that converts [ASAM Open Simulation Interface (OSI)](https://www.asam.net/standards/detail/osi/) messages into 3D visualizations using [message converters](https://lichtblick-suite.github.io/docs/docs/extensions/introduction#message-converters).

## Supported conversions

| Input | Output | Description |
|-------|--------|-------------|
| `osi3.GroundTruth` | `foxglove.SceneUpdate` | Full scene visualization with all entity types |
| `osi3.GroundTruth` | `foxglove.FrameTransforms` | Ego vehicle coordinate frame hierarchy |
| `osi3.SensorView` | `foxglove.SceneUpdate` | Scene via embedded ground truth |
| `osi3.SensorView` | `foxglove.FrameTransforms` | Frame transforms via embedded ground truth |
| `osi3.SensorData` | `foxglove.SceneUpdate` | Detected lane boundaries (limited) |
| `osi3.SensorData` | `foxglove.FrameTransforms` | Sensor mounting position transform |

## Quick start

See the [Getting Started](user-guide/getting-started.md) guide.

## Architecture

For developers and contributors, see the [Architecture Overview](architecture/overview.md).
