import { GroundTruthContext } from "./types";

export function createGroundTruthContext(): GroundTruthContext {
  return {
    groundTruthFrameCache: new WeakMap(),
    laneBoundaryCache: new Map(),
    laneCache: new Map(),
    modelCache: new Map(),
    state: {
      previousMovingObjectIds: new Set(),
      previousStationaryObjectIds: new Set(),
      previousLaneBoundaryIds: new Set(),
      previousLogicalLaneBoundaryIds: new Set(),
      previousLaneIds: new Set(),
      previousLogicalLaneIds: new Set(),
      previousTrafficSignIds: new Set(),
      previousTrafficLightIds: new Set(),
      previousRoadMarkingIds: new Set(),
      previousConfig: undefined,
    },
  };
}
