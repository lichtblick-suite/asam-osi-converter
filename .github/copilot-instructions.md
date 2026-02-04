# ASAM OSI Converter Extension for Lichtblick

A Lichtblick extension that converts ASAM Open Simulation Interface (OSI) messages into 3D visualizations.

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

### Feature Builder Pattern

Each feature module exports:
- `build*Entity()` - Creates a `PartialSceneEntity` with primitives
- `build*Metadata()` - Creates metadata for panel displays
- Uses utilities from `@utils/primitives` to create geometric primitives
- Returns entities with unique IDs generated via `generateSceneEntityId()`

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

Always use these aliases for imports. They're configured in `tsconfig.json`, `jest.config.js`, and `config.ts`.

## Key Conventions

### Entity ID Generation
- Use `generateSceneEntityId(prefix, osiId, property?)` from `@utils/scene`
- Prefixes defined in `src/config/entityPrefixes.ts` (e.g., `PREFIX_MOVING_OBJECT`)
- Ensures unique IDs for entity tracking and deletion

### Color Management
- Use `ColorCode(name, opacity)` from `@utils/helper` for consistent colors
- All visualization colors defined in `src/config/constants.ts`
- Organized by feature (e.g., `MOVING_OBJECT_COLOR`, `LANE_BOUNDARY_TYPE`)

### Type Safety
- Use `DeepRequired<T>` from `ts-essentials` for OSI types to handle optional fields
- Strict TypeScript settings enabled (noImplicitAny, noUncheckedIndexedAccess, etc.)

### Testing
- Tests located in `tests/` directory (separate from `src/`)
- Test files use `.spec.ts` extension
- Jest configured with ts-jest preset and jsdom environment

### Asset Handling
- PNG assets loaded as inline base64 via webpack config (`config.ts`)
- Traffic sign textures preloaded via `preloadDynamicTextures()` at extension activation

## Commit Guidelines

Follow Conventional Commits format:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, ci
```

Commits are validated by commitlint via Husky pre-commit hooks.

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
