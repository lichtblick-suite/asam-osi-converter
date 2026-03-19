# ASAM OSI Converter Extension for Lichtblick

A Lichtblick extension that converts ASAM Open Simulation Interface (OSI) messages into 3D visualizations.

## Related Agent Docs
| Document | Purpose | Location |
| --- | --- | --- |
| Repository Guidelines | Contributor guide with commands, testing, and PR expectations | `AGENTS.md` |

## Build, Test, and Lint Commands

```bash
# Development
yarn install              # Install dependencies
yarn build                # Build extension
yarn local-install        # Build and install into local Lichtblick app

# Package for distribution
yarn package              # Creates .foxe file

# Testing
yarn test                 # Run all tests
yarn test <filename>      # Run specific test file (e.g., yarn test trafficlights.spec.ts)

# Linting
yarn lint                 # Auto-fix lint errors
yarn lint:ci              # Lint without auto-fix (CI mode)
```

## Architecture Overview

This is a **Lichtblick extension** that registers message converters to transform OSI protocol buffer messages into Foxglove visualization schemas.

### Core Components

**Extension Entry Point** (`src/index.ts`)
- Registers message converters using `extensionContext.registerMessageConverter()`
- Converts three OSI message types:
  - `osi3.GroundTruth` → `foxglove.SceneUpdate` + `foxglove.FrameTransforms`
  - `osi3.SensorView` → `foxglove.SceneUpdate` + `foxglove.FrameTransforms`
  - `osi3.SensorData` → `foxglove.SceneUpdate` + `foxglove.FrameTransforms`

**Converters** (`src/converters/`)
- `groundTruth/`: Main converter for ground truth data, produces SceneUpdate with entities
- `sensorView/`: Converter for sensor view data
- `sensorData/`: Converter for sensor-specific data
- Each converter has: `sceneUpdateConverter.ts`, `frameTransformConverter.ts`, `panelSettings.ts`, `context.ts`

**Features** (`src/features/`)
- Each feature module builds specific OSI entity types into Foxglove scene entities:
  - `movingobjects/` - Vehicles, pedestrians, animals (with light states)
  - `stationaryobjects/` - Static scene objects
  - `lanes/` - Lane geometries and boundaries
  - `logicallanes/` - Logical lane definitions
  - `trafficlights/` - Traffic light states and positions
  - `trafficsigns/` - Traffic signs with dynamic texture loading
  - `referenceline/` - Reference line geometries
  - `roadmarkings/` - Road marking visualizations
- Each feature exports builder functions like `buildMovingObjectEntity()`, `buildTrafficLightEntity()`, etc.

**Utils** (`src/utils/`)
- `primitives/`: Converts OSI objects to Foxglove primitives (cubes, models, lines)
- `scene.ts`: Scene entity management, ID generation, entity diffing
- `math.ts`: Mathematical transformations (Euler to quaternion, etc.)
- `helper.ts`: Color codes, timestamp conversion, path utilities
- `hashing.ts`: Entity hashing for change detection

**Config** (`src/config/`)
- `constants.ts`: All visualization constants (colors, sizes, materials) organized by feature
- `entityPrefixes.ts`: String prefixes for entity IDs (e.g., `PREFIX_LANE`, `PREFIX_TRAFFIC_LIGHT`)
- `frameTransformNames.ts`: Coordinate frame naming constants

### Message Converter Pattern

Converters follow this structure:
1. Create a context object to maintain state across conversions
2. Extract entities from the OSI message
3. Build Foxglove scene entities using feature builders
4. Track entity lifecycle (additions/deletions) for efficient updates
5. Return SceneUpdate or FrameTransforms schema

The converter function is returned as a closure that captures the `GroundTruthContext` — this context persists across frames and holds caches, previous entity ID sets, and the last known panel config. It is created once per `register*Converter()` call.

**SensorView** delegates to the GroundTruth converter using `msg.global_ground_truth`. **SensorData** is currently limited — it only renders detected lane boundaries and displays a "not supported yet" text label.

Panel settings flow into the converter via `event.topicConfig` (typed as `GroundTruthPanelSettings`). Converters fall back to `DEFAULT_CONFIG` when `topicConfig` is undefined.

Error handling: all converters wrap their main logic in `try/catch`, log with `console.error`, and return an empty `SceneUpdate` on failure rather than propagating exceptions.

### Feature Builder Pattern

Each feature module exports:
- `build*Entity()` - Creates a `PartialSceneEntity` with primitives
- `build*Metadata()` - Creates metadata for panel displays
- Uses utilities from `@utils/primitives` to create geometric primitives
- Returns entities with unique IDs generated via `generateSceneEntityId(prefix, id)`

## Path Aliases

TypeScript and Jest are configured with path aliases:

```typescript
@utils/*       → src/utils/*
@assets/*      → assets/*
@converters    → src/converters/index.ts
@converters/*  → src/converters/*
@features/*    → src/features/*
@/*            → src/*
```

Prefer these aliases for imports. They're configured in `tsconfig.json`, `jest.config.js`, and `config.ts`.

## Key Conventions

### Entity ID Generation
- Use `generateSceneEntityId(prefix, id)` from `@utils/scene` — produces `"${prefix}_${id}"`
- Prefixes defined in `src/config/entityPrefixes.ts` (e.g., `PREFIX_MOVING_OBJECT`)
- Entity IDs must be stable across frames; `getDeletedEntities()` uses Sets of previous-frame IDs to generate deletion messages when an entity disappears

### Caching System
The `GroundTruthContext` holds several layers of caches to avoid redundant work:
- **Frame cache** (`groundTruthFrameCache`): `Map<configSignature, WeakMap<GroundTruth, entities>>` — skips full conversion if the same message object is seen again
- **Lane/boundary caches**: keyed by hash of entity IDs (via `hashLanes` / `hashLaneBoundaries`) — reuses rendered entities when the set of lane IDs hasn't changed
- **Model cache**: keyed by `defaultModelPath + model_reference` — reuses loaded 3D model primitives

All caches are cleared whenever panel settings change (detected by comparing JSON-stringified config signatures).

### Color Management
- Use `ColorCode(name, opacity)` from `@utils/helper` for consistent colors
- All visualization colors defined in `src/config/constants.ts`
- Organized by feature (e.g., `MOVING_OBJECT_COLOR`, `LANE_BOUNDARY_TYPE`)

### Type Safety
- Use `DeepRequired<T>` from `ts-essentials` to cast OSI types for processing — this satisfies TypeScript but does not validate at runtime; actual field presence is not guaranteed
- Strict TypeScript settings enabled (noImplicitAny, noUncheckedIndexedAccess, etc.)

### Testing
- Tests located in `tests/` directory (separate from `src/`)
- Test files use `.spec.ts` extension
- Jest configured with ts-jest preset and jsdom environment
- Mock OSI objects using double cast: `{ id: { value: 0 }, ... } as unknown as DeepRequired<MovingObject>`
- Mock feature modules with `jest.mock("@features/trafficsigns", () => ({ preloadDynamicTextures: jest.fn() }))`
- Use `beforeEach()` for cache/mock cleanup between tests

### Error Handling
- All converters wrap main logic in `try/catch`, log with `console.error`, and return an empty `SceneUpdate` on failure — never propagate exceptions
- Math utilities (`src/utils/math.ts`) use fail-soft behavior: return identity/original values on invalid input (NaN, Infinity) instead of throwing
- Numeric precision: `clean0()` removes floating-point noise below `1e-12`

### Asset Handling
- PNG assets loaded as inline base64 via webpack config (`config.ts`)
- Traffic sign textures preloaded via `preloadDynamicTextures()` at extension activation

## Adding a New Feature

To add a new OSI entity type to the visualization:

1. **Create feature module** in `src/features/<name>/` with `build<Name>Entity()` and optionally `build<Name>Metadata()`
2. **Add entity prefix** in `src/config/entityPrefixes.ts` (e.g., `PREFIX_<NAME>`)
3. **Add color/rendering constants** in `src/config/constants.ts`
4. **Wire into GroundTruth converter** — call the builder in `src/converters/groundTruth/sceneUpdateConverter.ts` `buildSceneEntities()`, add ID tracking to `GroundTruthState` for deletion detection
5. **Add panel setting** if the feature needs a visibility toggle — update `GroundTruthPanelSettings` and `DEFAULT_CONFIG`
6. **Add tests** in `tests/<name>.spec.ts`

## Commit Guidelines

Follow Conventional Commits format:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, ci
```

Commits are validated by commitlint via the Husky `commit-msg` hook.

## Release Process

1. Audit dependencies: `yarn audit --summary`
2. Upgrade if needed: `yarn outdated` then `yarn upgrade`
3. Bump version in `package.json`
4. Commit and push changes
5. Tag release: `git tag -s -a v<version> -m "Release v<version>"`
6. Push tag: `git push origin v<version>`

The GitHub Actions workflow builds the `.foxe` extension file and creates a release automatically.

## Lichtblick SDK

This extension uses the `@lichtblick/suite` SDK for:
- `ExtensionContext` - Extension registration API
- `Time` - Timestamp types
- `MessageEvent<T>` - Message wrapper type
- Type definitions from `@lichtblick/asam-osi-types` for OSI protocol buffers
- Schema types from `@foxglove/schemas` for visualization outputs
