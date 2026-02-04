# Plan: Edge Case Hardening for ASAM OSI Converter Plugin

## Problem Statement

The plugin can crash when OSI messages contain incomplete or malformed data (e.g., missing `x`, `y`, `z` coordinates). The goal is to add defensive validation that logs errors but allows the plugin to continue gracefully.

## Approach

**Strategy:** Mixed validation approach
- Central validation utilities in `src/utils/validation.ts` for common patterns (e.g., base object validation, coordinate validation)
- Inline checks for feature-specific logic

**Error Handling:** Log errors via `console.error()` but skip invalid entities and continue processing valid ones

**Conventions:**
- Reusable validation functions
- Small, focused functions  
- Comprehensive test coverage

## Project Context

- **Package manager:** yarn
- **Test command:** `yarn test` (Jest with ts-jest)
- **Lint command:** `yarn lint`
- **Build command:** `yarn build`
- **Path aliases:** `@utils/*`, `@converters`, `@features/*`, `@/*` (configured in tsconfig.json, jest.config.js, config.ts)

---

## Workplan

### Phase 1: Create Validation Utilities

#### Task 1.1: Create `src/utils/validation.ts`

Create a new file with the following validation functions:

```typescript
// src/utils/validation.ts

import { BaseStationary, BaseMoving, Timestamp } from "@lichtblick/asam-osi-types";

/**
 * Logs a validation error with consistent formatting.
 */
export function logValidationError(context: string, field: string, objectId?: number): void {
  const idStr = objectId !== undefined ? ` (id: ${objectId})` : "";
  console.error(`[OSI Validation] ${context}: Missing or invalid '${field}'${idStr}`);
}

/**
 * Checks if an object has a valid id with a numeric value.
 */
export function hasValidId(obj: { id?: { value?: number } } | undefined): obj is { id: { value: number } } {
  return obj?.id?.value !== undefined && typeof obj.id.value === "number";
}

/**
 * Checks if a position has valid x, y, z coordinates.
 */
export function hasValidPosition(position: { x?: number; y?: number; z?: number } | undefined): position is { x: number; y: number; z: number } {
  return (
    position !== undefined &&
    typeof position.x === "number" &&
    typeof position.y === "number" &&
    typeof position.z === "number"
  );
}

/**
 * Checks if an orientation has valid roll, pitch, yaw values.
 */
export function hasValidOrientation(orientation: { roll?: number; pitch?: number; yaw?: number } | undefined): orientation is { roll: number; pitch: number; yaw: number } {
  return (
    orientation !== undefined &&
    typeof orientation.roll === "number" &&
    typeof orientation.pitch === "number" &&
    typeof orientation.yaw === "number"
  );
}

/**
 * Checks if a dimension has valid width, length, height values.
 */
export function hasValidDimension(dimension: { width?: number; length?: number; height?: number } | undefined): dimension is { width: number; length: number; height: number } {
  return (
    dimension !== undefined &&
    typeof dimension.width === "number" &&
    typeof dimension.length === "number" &&
    typeof dimension.height === "number"
  );
}

/**
 * Checks if a base object (BaseStationary or BaseMoving) has all required fields.
 */
export function hasValidBaseObject(base: { position?: unknown; orientation?: unknown; dimension?: unknown } | undefined): boolean {
  if (!base) return false;
  return (
    hasValidPosition(base.position as { x?: number; y?: number; z?: number }) &&
    hasValidOrientation(base.orientation as { roll?: number; pitch?: number; yaw?: number }) &&
    hasValidDimension(base.dimension as { width?: number; length?: number; height?: number })
  );
}

/**
 * Checks if a timestamp has valid seconds and nanos.
 */
export function hasValidTimestamp(timestamp: { seconds?: number; nanos?: number } | undefined): timestamp is { seconds: number; nanos: number } {
  return (
    timestamp !== undefined &&
    typeof timestamp.seconds === "number" &&
    typeof timestamp.nanos === "number"
  );
}

/**
 * Checks if a boundary line array is valid (non-empty with valid first point).
 */
export function hasValidBoundaryLine(boundaryLine: Array<{ position?: unknown; width?: number; height?: number }> | undefined): boolean {
  if (!boundaryLine || boundaryLine.length === 0) return false;
  const firstPoint = boundaryLine[0];
  return firstPoint !== undefined && hasValidPosition(firstPoint.position as { x?: number; y?: number; z?: number });
}

/**
 * Checks if an array has elements and a valid first element.
 */
export function hasValidArrayElement<T>(arr: T[] | undefined, index: number = 0): arr is T[] & { [K in typeof index]: T } {
  return arr !== undefined && arr.length > index && arr[index] !== undefined;
}

/**
 * Filters an array to only include elements with valid IDs, logging errors for invalid ones.
 */
export function filterValidEntities<T extends { id?: { value?: number } }>(
  entities: T[] | undefined,
  context: string,
): T[] {
  if (!entities) return [];
  return entities.filter((entity, index) => {
    if (!hasValidId(entity)) {
      logValidationError(context, "id", index);
      return false;
    }
    return true;
  });
}
```

#### Task 1.2: Update `src/utils/index.ts`

Add export for validation module:

```typescript
export * from "./validation";
```

#### Task 1.3: Create `tests/validation.spec.ts`

```typescript
// tests/validation.spec.ts

import {
  hasValidId,
  hasValidPosition,
  hasValidOrientation,
  hasValidDimension,
  hasValidBaseObject,
  hasValidTimestamp,
  hasValidBoundaryLine,
  hasValidArrayElement,
  filterValidEntities,
  logValidationError,
} from "@utils/validation";

describe("validation utilities", () => {
  describe("hasValidId", () => {
    it("returns true for valid id", () => {
      expect(hasValidId({ id: { value: 123 } })).toBe(true);
    });

    it("returns false for missing id", () => {
      expect(hasValidId({})).toBe(false);
      expect(hasValidId(undefined)).toBe(false);
    });

    it("returns false for missing value", () => {
      expect(hasValidId({ id: {} })).toBe(false);
      expect(hasValidId({ id: { value: undefined } })).toBe(false);
    });
  });

  describe("hasValidPosition", () => {
    it("returns true for valid position", () => {
      expect(hasValidPosition({ x: 1.0, y: 2.0, z: 3.0 })).toBe(true);
    });

    it("returns false for missing coordinates", () => {
      expect(hasValidPosition({ x: 1.0, y: 2.0 })).toBe(false);
      expect(hasValidPosition({ x: 1.0 })).toBe(false);
      expect(hasValidPosition({})).toBe(false);
      expect(hasValidPosition(undefined)).toBe(false);
    });
  });

  describe("hasValidOrientation", () => {
    it("returns true for valid orientation", () => {
      expect(hasValidOrientation({ roll: 0.0, pitch: 0.0, yaw: 1.57 })).toBe(true);
    });

    it("returns false for missing values", () => {
      expect(hasValidOrientation({ roll: 0.0, pitch: 0.0 })).toBe(false);
      expect(hasValidOrientation(undefined)).toBe(false);
    });
  });

  describe("hasValidDimension", () => {
    it("returns true for valid dimension", () => {
      expect(hasValidDimension({ width: 2.0, length: 4.0, height: 1.5 })).toBe(true);
    });

    it("returns false for missing values", () => {
      expect(hasValidDimension({ width: 2.0, length: 4.0 })).toBe(false);
      expect(hasValidDimension(undefined)).toBe(false);
    });
  });

  describe("hasValidBaseObject", () => {
    const validBase = {
      position: { x: 1.0, y: 2.0, z: 3.0 },
      orientation: { roll: 0.0, pitch: 0.0, yaw: 0.0 },
      dimension: { width: 2.0, length: 4.0, height: 1.5 },
    };

    it("returns true for valid base object", () => {
      expect(hasValidBaseObject(validBase)).toBe(true);
    });

    it("returns false for missing position", () => {
      expect(hasValidBaseObject({ ...validBase, position: undefined })).toBe(false);
    });

    it("returns false for missing orientation", () => {
      expect(hasValidBaseObject({ ...validBase, orientation: undefined })).toBe(false);
    });

    it("returns false for missing dimension", () => {
      expect(hasValidBaseObject({ ...validBase, dimension: undefined })).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(hasValidBaseObject(undefined)).toBe(false);
    });
  });

  describe("hasValidTimestamp", () => {
    it("returns true for valid timestamp", () => {
      expect(hasValidTimestamp({ seconds: 1000, nanos: 500 })).toBe(true);
    });

    it("returns false for missing fields", () => {
      expect(hasValidTimestamp({ seconds: 1000 })).toBe(false);
      expect(hasValidTimestamp(undefined)).toBe(false);
    });
  });

  describe("hasValidBoundaryLine", () => {
    it("returns true for valid boundary line", () => {
      expect(hasValidBoundaryLine([{ position: { x: 0, y: 0, z: 0 }, width: 0.1, height: 0.1 }])).toBe(true);
    });

    it("returns false for empty array", () => {
      expect(hasValidBoundaryLine([])).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(hasValidBoundaryLine(undefined)).toBe(false);
    });

    it("returns false for invalid first point", () => {
      expect(hasValidBoundaryLine([{ position: { x: 0, y: 0 }, width: 0.1, height: 0.1 }])).toBe(false);
    });
  });

  describe("hasValidArrayElement", () => {
    it("returns true when element exists at index", () => {
      expect(hasValidArrayElement([1, 2, 3], 0)).toBe(true);
      expect(hasValidArrayElement([1, 2, 3], 2)).toBe(true);
    });

    it("returns false when index out of bounds", () => {
      expect(hasValidArrayElement([1, 2, 3], 5)).toBe(false);
      expect(hasValidArrayElement([], 0)).toBe(false);
    });

    it("returns false for undefined array", () => {
      expect(hasValidArrayElement(undefined, 0)).toBe(false);
    });
  });

  describe("filterValidEntities", () => {
    it("filters out entities without valid ids", () => {
      const entities = [
        { id: { value: 1 }, name: "a" },
        { id: {}, name: "b" },
        { id: { value: 3 }, name: "c" },
        { name: "d" },
      ];
      const result = filterValidEntities(entities, "test");
      expect(result).toHaveLength(2);
      expect(result[0]?.id?.value).toBe(1);
      expect(result[1]?.id?.value).toBe(3);
    });

    it("returns empty array for undefined input", () => {
      expect(filterValidEntities(undefined, "test")).toEqual([]);
    });

    it("logs errors for invalid entities", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      filterValidEntities([{ name: "invalid" }], "TestContext");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[OSI Validation] TestContext"));
      consoleSpy.mockRestore();
    });
  });

  describe("logValidationError", () => {
    it("logs error with context and field", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      logValidationError("MovingObject", "position");
      expect(consoleSpy).toHaveBeenCalledWith("[OSI Validation] MovingObject: Missing or invalid 'position'");
      consoleSpy.mockRestore();
    });

    it("logs error with object id when provided", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      logValidationError("MovingObject", "position", 42);
      expect(consoleSpy).toHaveBeenCalledWith("[OSI Validation] MovingObject: Missing or invalid 'position' (id: 42)");
      consoleSpy.mockRestore();
    });
  });
});
```

- [ ] **1.1** Create `src/utils/validation.ts` with validation functions
- [ ] **1.2** Update `src/utils/index.ts` to export validation module
- [ ] **1.3** Create `tests/validation.spec.ts` with comprehensive tests
- [ ] **1.4** Run `yarn test validation.spec.ts` to verify tests pass
- [ ] **1.5** Run `yarn lint` to verify no lint errors

---

### Phase 2: Harden Converters

#### Task 2.1: Update `src/utils/hashing.ts`

**Current code (lines 14-15):**
```typescript
export const hashLanes = (lanes: Lane[] | LogicalLane[]): string => {
  const hash = lanes.reduce((acc, lane) => acc + lane.id!.value!.toString(), "");
```

**Replace with:**
```typescript
import { hasValidId, logValidationError } from "@utils/validation";

export const hashLanes = (lanes: Lane[] | LogicalLane[]): string => {
  const validLanes = lanes.filter((lane) => {
    if (!hasValidId(lane)) {
      logValidationError("hashLanes", "id");
      return false;
    }
    return true;
  });
  if (validLanes.length === 0) return "0";
  const hash = validLanes.reduce((acc, lane) => acc + lane.id.value.toString(), "");
```

**Current code (lines 38-41):**
```typescript
export const hashLaneBoundaries = (
  laneBoundaries: LaneBoundary[] | LogicalLaneBoundary[],
): string => {
  const hash = laneBoundaries.reduce(
    (acc, laneBoundary) => acc + laneBoundary.id!.value!.toString(),
```

**Replace with:**
```typescript
export const hashLaneBoundaries = (
  laneBoundaries: LaneBoundary[] | LogicalLaneBoundary[],
): string => {
  const validBoundaries = laneBoundaries.filter((boundary) => {
    if (!hasValidId(boundary)) {
      logValidationError("hashLaneBoundaries", "id");
      return false;
    }
    return true;
  });
  if (validBoundaries.length === 0) return "0";
  const hash = validBoundaries.reduce(
    (acc, laneBoundary) => acc + laneBoundary.id.value.toString(),
```

#### Task 2.2: Update `src/converters/sensorView/sceneUpdateConverter.ts`

**Current code:**
```typescript
export function registerSensorViewConverter(): (
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
) => unknown {
  const ctx = createGroundTruthContext();

  return (msg: SensorView, event: Immutable<MessageEvent<SensorView>>) =>
    convertGroundTruthToSceneUpdate(
      ctx,
      msg.global_ground_truth!,
      event,
      msg.host_vehicle_id?.value,
    );
}
```

**Replace with:**
```typescript
import { logValidationError } from "@utils/validation";

export function registerSensorViewConverter(): (
  msg: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
) => unknown {
  const ctx = createGroundTruthContext();

  return (msg: SensorView, event: Immutable<MessageEvent<SensorView>>) => {
    if (!msg.global_ground_truth) {
      logValidationError("SensorView", "global_ground_truth");
      return { deletions: [], entities: [] };
    }
    return convertGroundTruthToSceneUpdate(
      ctx,
      msg.global_ground_truth,
      event,
      msg.host_vehicle_id?.value,
    );
  };
}
```

#### Task 2.3: Update `src/index.ts`

**Current code (line 54-59):**
```typescript
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.FrameTransforms",
    converter: (message: SensorView) =>
      convertGroundTruthToFrameTransforms(message.global_ground_truth!),
  });
```

**Replace with:**
```typescript
  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.FrameTransforms",
    converter: (message: SensorView) => {
      if (!message.global_ground_truth) {
        console.error("[OSI Validation] SensorView: Missing 'global_ground_truth' for FrameTransforms");
        return { transforms: [] };
      }
      return convertGroundTruthToFrameTransforms(message.global_ground_truth);
    },
  });
```

#### Task 2.4: Update `src/converters/groundTruth/frameTransformConverter.ts`

**Current code (lines 62-68):**
```typescript
function buildEgoVehicleBBCenterFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;
```

**Replace with:**
```typescript
function buildEgoVehicleBBCenterFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform | undefined {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  });

  if (!hostObject) {
    console.error("[OSI Validation] FrameTransform: Host vehicle not found in moving_object array");
    return undefined;
  }
```

**Current code (lines 88-94):**
```typescript
function buildEgoVehicleRearAxleFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;
```

**Replace with:**
```typescript
function buildEgoVehicleRearAxleFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform | undefined {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  });

  if (!hostObject) {
    console.error("[OSI Validation] FrameTransform: Host vehicle not found for rear axle transform");
    return undefined;
  }
```

**Update the main converter function (lines 28-29 and 44-45) to handle undefined:**

```typescript
// Line 28-29: Change from:
transforms.transforms.push(
  buildEgoVehicleBBCenterFrameTransform(message as DeepRequired<GroundTruth>),
);

// To:
const bbCenterTransform = buildEgoVehicleBBCenterFrameTransform(message as DeepRequired<GroundTruth>);
if (bbCenterTransform) {
  transforms.transforms.push(bbCenterTransform);
}

// Line 44-45: Change from:
transforms.transforms.push(
  buildEgoVehicleRearAxleFrameTransform(message as DeepRequired<GroundTruth>),
);

// To:
const rearAxleTransform = buildEgoVehicleRearAxleFrameTransform(message as DeepRequired<GroundTruth>);
if (rearAxleTransform) {
  transforms.transforms.push(rearAxleTransform);
}
```

#### Task 2.5: Update `src/converters/groundTruth/sceneUpdateConverter.ts`

Add validation before processing each entity type. In the `buildSceneEntities` function, filter invalid entities:

**Add import at top:**
```typescript
import { hasValidId, hasValidBaseObject, logValidationError, filterValidEntities } from "@utils/validation";
```

**Update moving_object processing (around line 69):**

**Current:**
```typescript
  const movingObjectSceneEntities = osiGroundTruth.moving_object.map((obj) => {
```

**Replace with:**
```typescript
  const validMovingObjects = osiGroundTruth.moving_object.filter((obj) => {
    if (!hasValidId(obj)) {
      logValidationError("GroundTruth.moving_object", "id");
      return false;
    }
    if (!hasValidBaseObject(obj.base)) {
      logValidationError("GroundTruth.moving_object", "base", obj.id.value);
      return false;
    }
    return true;
  });
  const movingObjectSceneEntities = validMovingObjects.map((obj) => {
```

**Update stationary_object processing (around line 107):**

**Current:**
```typescript
  const stationaryObjectSceneEntities = osiGroundTruth.stationary_object.map((obj) => {
```

**Replace with:**
```typescript
  const validStationaryObjects = osiGroundTruth.stationary_object.filter((obj) => {
    if (!hasValidId(obj)) {
      logValidationError("GroundTruth.stationary_object", "id");
      return false;
    }
    if (!hasValidBaseObject(obj.base)) {
      logValidationError("GroundTruth.stationary_object", "base", obj.id.value);
      return false;
    }
    return true;
  });
  const stationaryObjectSceneEntities = validStationaryObjects.map((obj) => {
```

**Apply similar pattern for:**
- traffic_sign (validate id and base)
- traffic_light (validate id and base)
- road_marking (validate id)
- lane_boundary (validate id and boundary_line)
- lane (validate id)
- logical_lane_boundary (validate id and boundary_line)
- logical_lane (validate id)
- reference_line (validate id)

- [ ] **2.1** Update `src/utils/hashing.ts` to filter invalid entities
- [ ] **2.2** Update `src/converters/sensorView/sceneUpdateConverter.ts` with null check
- [ ] **2.3** Update `src/index.ts` SensorView→FrameTransforms converter
- [ ] **2.4** Update `src/converters/groundTruth/frameTransformConverter.ts` to handle missing host
- [ ] **2.5** Update `src/converters/groundTruth/sceneUpdateConverter.ts` to filter invalid entities
- [ ] **2.6** Run `yarn test` to verify no regressions
- [ ] **2.7** Run `yarn lint` to verify no lint errors

---

### Phase 3: Harden Features

#### Task 3.1: Update `src/features/lanes/metadata.ts`

**Current code (lines 66-72):**
```typescript
    {
      key: "width",
      value: lane_boundary.boundary_line[0]?.width!.toString() ?? "0",
    },
    {
      key: "height",
      value: lane_boundary.boundary_line[0]?.height!.toString() ?? "0",
    },
```

**Replace with:**
```typescript
    {
      key: "width",
      value: lane_boundary.boundary_line[0]?.width?.toString() ?? "0",
    },
    {
      key: "height",
      value: lane_boundary.boundary_line[0]?.height?.toString() ?? "0",
    },
```

#### Task 3.2: Update `src/features/trafficlights/index.ts`

**Current code (lines 142-143):**
```typescript
  data.images[0]!.uri = imageData;
  data.materials[0]!.pbrMetallicRoughness.baseColorFactor = [color.r, color.g, color.b, color.a];
```

**Replace with:**
```typescript
  if (!data.images?.[0] || !data.materials?.[0]?.pbrMetallicRoughness) {
    console.error("[OSI Validation] TrafficLight: Invalid model data structure");
    return data;
  }
  data.images[0].uri = imageData;
  data.materials[0].pbrMetallicRoughness.baseColorFactor = [color.r, color.g, color.b, color.a];
```

#### Task 3.3: Update `src/features/trafficsigns/index.ts`

**Current code (line 102):**
```typescript
  data.images[0]!.uri = imageData;
```

**Replace with:**
```typescript
  if (!data.images?.[0]) {
    console.error("[OSI Validation] TrafficSign: Invalid model data structure - missing images array");
    return data;
  }
  data.images[0].uri = imageData;
```

#### Task 3.4: Update `src/utils/primitives/lines.ts`

Add bounds checking for array access. For each array access with `!`, add validation:

**Example for line 55:**
```typescript
// Current:
const dashProperty = points[i]!.dash;

// Replace with:
const point = points[i];
if (!point) continue;
const dashProperty = point.dash;
```

**Apply similar pattern for lines 81-86, 373, 377, 379, 386.**

- [ ] **3.1** Update `src/features/lanes/metadata.ts` - remove unsafe `!` assertions
- [ ] **3.2** Update `src/features/trafficlights/index.ts` - validate model data
- [ ] **3.3** Update `src/features/trafficsigns/index.ts` - validate model data
- [ ] **3.4** Update `src/utils/primitives/lines.ts` - add bounds checking
- [ ] **3.5** Run `yarn test` to verify no regressions
- [ ] **3.6** Run `yarn lint` to verify no lint errors

---

### Phase 4: Add Edge Case Tests

#### Task 4.1: Create `tests/edgecases.spec.ts`

```typescript
// tests/edgecases.spec.ts

import { hashLanes, hashLaneBoundaries } from "@utils/hashing";

describe("Edge case handling", () => {
  describe("hashing with invalid data", () => {
    it("handles lanes with missing ids", () => {
      const lanes = [
        { id: { value: 1 } },
        { id: {} }, // missing value
        { id: { value: 3 } },
        {}, // missing id entirely
      ];
      // Should not throw, should return hash of valid lanes only
      expect(() => hashLanes(lanes as any)).not.toThrow();
    });

    it("handles empty lanes array", () => {
      expect(() => hashLanes([])).not.toThrow();
      expect(hashLanes([])).toBe("0");
    });

    it("handles lane boundaries with missing ids", () => {
      const boundaries = [
        { id: { value: 1 } },
        { id: {} },
      ];
      expect(() => hashLaneBoundaries(boundaries as any)).not.toThrow();
    });
  });
});
```

#### Task 4.2: Update existing converter tests

Add edge case tests to `tests/converters.registration.spec.ts` for:
- GroundTruth with missing host_vehicle_id
- SensorView with missing global_ground_truth
- Moving objects with missing base properties

- [ ] **4.1** Create `tests/edgecases.spec.ts` with edge case tests
- [ ] **4.2** Update existing converter tests with edge cases
- [ ] **4.3** Run `yarn test` to verify all tests pass
- [ ] **4.4** Run `yarn lint` to verify no lint errors

---

### Phase 5: Final Verification

- [ ] **5.1** Run `yarn build` to verify build succeeds
- [ ] **5.2** Run `yarn test` to verify all tests pass
- [ ] **5.3** Run `yarn lint` to verify no lint errors
- [ ] **5.4** Manually test with Lichtblick using malformed OSI data (if available)

---

## Success Criteria

1. Plugin never crashes on malformed OSI messages
2. Valid entities in a message are still processed even if some are invalid
3. Clear error messages logged with `[OSI Validation]` prefix for debugging
4. All validation logic has test coverage
5. All existing tests continue to pass
6. No lint errors

## Files to Create

1. `src/utils/validation.ts` - New validation utilities
2. `tests/validation.spec.ts` - Tests for validation utilities
3. `tests/edgecases.spec.ts` - Edge case integration tests

## Files to Modify

1. `src/utils/index.ts` - Add validation export
2. `src/utils/hashing.ts` - Add validation for lane/boundary ids
3. `src/converters/sensorView/sceneUpdateConverter.ts` - Add null check for global_ground_truth
4. `src/converters/groundTruth/sceneUpdateConverter.ts` - Filter invalid entities
5. `src/converters/groundTruth/frameTransformConverter.ts` - Handle missing host vehicle
6. `src/index.ts` - Add null check for SensorView→FrameTransforms
7. `src/features/lanes/metadata.ts` - Remove unsafe assertions
8. `src/features/trafficlights/index.ts` - Validate model data
9. `src/features/trafficsigns/index.ts` - Validate model data
10. `src/utils/primitives/lines.ts` - Add bounds checking
