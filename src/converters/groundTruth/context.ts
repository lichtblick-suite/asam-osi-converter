import { GroundTruthContext, GroundTruthState } from "./types";

export function createGroundTruthState(): GroundTruthState {
  return {
    previousMovingObjectIds: new Set(),
    previousStationaryObjectIds: new Set(),
    previousLaneBoundaryIds: new Set(),
    previousLogicalLaneBoundaryIds: new Set(),
    previousLaneIds: new Set(),
    previousLogicalLaneIds: new Set(),
    previousTrafficSignIds: new Set(),
    previousTrafficLightIds: new Set(),
    previousRoadMarkingIds: new Set(),
    previousReferenceLineIds: new Set(),
    previousConfig: undefined,
    previousConfigSignature: undefined,
    previousDeletionMessage: undefined,
    previousDeletionResult: undefined,
  };
}

export function createGroundTruthContext(): GroundTruthContext {
  return {
    groundTruthFrameCache: new Map(),
    laneBoundaryCache: new Map(),
    laneCache: new Map(),
    logicalLaneBoundaryCache: new Map(),
    logicalLaneCache: new Map(),
    modelCache: new Map(),
    consumerStates: new WeakMap(),
  };
}

/**
 * Returns the deletion-tracking state for a single consumer (panel), creating it
 * on first use. `configKey` is the panel's `topicConfig` object (or the shared
 * `DEFAULT_CONFIG`), which is stable per panel for as long as its settings are
 * unchanged, so it uniquely identifies a consumer of the shared context.
 */
export function getConsumerState(ctx: GroundTruthContext, configKey: object): GroundTruthState {
  let consumerState = ctx.consumerStates.get(configKey);
  if (!consumerState) {
    consumerState = createGroundTruthState();
    ctx.consumerStates.set(configKey, consumerState);
  }
  return consumerState;
}
