import { ModelPrimitive } from "@foxglove/schemas";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { PartialSceneEntity } from "@utils/scene";

export interface OSISceneEntities {
  movingObjects: PartialSceneEntity[];
  stationaryObjects: PartialSceneEntity[];
  trafficSigns: PartialSceneEntity[];
  trafficLights: PartialSceneEntity[];
  roadMarkings: PartialSceneEntity[];
  laneBoundaries: PartialSceneEntity[];
  logicalLaneBoundaries: PartialSceneEntity[];
  lanes: PartialSceneEntity[];
  logicalLanes: PartialSceneEntity[];
  referenceLines: PartialSceneEntity[];
}

export interface OSISceneEntitiesUpdateFlags {
  laneBoundaries: boolean;
  logicalLaneBoundaries: boolean;
  lanes: boolean;
  logicalLanes: boolean;
}

export type GroundTruthPanelSettings = {
  caching: boolean;
  showAxes: boolean;
  showPhysicalLanes: boolean;
  showLogicalLanes: boolean;
  showReferenceLines: boolean;
  showBoundingBox: boolean;
  show3dModels: boolean;
  defaultModelPath: string;
};

export interface GroundTruthState {
  previousMovingObjectIds: Set<number>;
  previousStationaryObjectIds: Set<number>;
  previousLaneBoundaryIds: Set<number>;
  previousLogicalLaneBoundaryIds: Set<number>;
  previousLaneIds: Set<number>;
  previousLogicalLaneIds: Set<number>;
  previousTrafficSignIds: Set<number>;
  previousTrafficLightIds: Set<number>;
  previousRoadMarkingIds: Set<number>;
  previousReferenceLineIds: Set<number>;
  previousConfig?: GroundTruthPanelSettings;
  previousConfigSignature?: string;
  /**
   * The last GroundTruth message for which deletions were computed, and the
   * resulting deletions. Used to make deletion computation idempotent per
   * message: when several panels share one state (e.g. two panels both at
   * default settings, which both resolve to `DEFAULT_CONFIG`), they all receive
   * the same message object, so only the first should diff the previous-frame id
   * sets. The others reuse the result instead of re-diffing (which would mutate
   * the id sets again and drop the deletions).
   */
  previousDeletionMessage?: GroundTruth;
  previousDeletionResult?: PartialSceneEntity[];
}

export interface GroundTruthContext {
  groundTruthFrameCache: Map<string, WeakMap<GroundTruth, PartialSceneEntity[]>>;
  laneBoundaryCache: Map<string, PartialSceneEntity[]>;
  laneCache: Map<string, PartialSceneEntity[]>;
  logicalLaneBoundaryCache: Map<string, PartialSceneEntity[]>;
  logicalLaneCache: Map<string, PartialSceneEntity[]>;
  modelCache: Map<string, ModelPrimitive>;
  /**
   * Per-consumer deletion-tracking state, keyed by the panel's `topicConfig`
   * object (or `DEFAULT_CONFIG` when a panel has no topic config yet).
   *
   * A single converter instance is shared across every panel that subscribes to
   * the same schema — e.g. the 3D panel and the Image panel both consuming
   * SensorView. Each panel renders into its own scene, so the previous-frame
   * entity-id sets used to compute MATCHING_ID deletions must be tracked per
   * consumer. With a single shared set, the panel that converts first consumes a
   * deletion and the others see no change, leaving a stale entity (e.g. a moving
   * object that left the data still shown in one panel).
   */
  consumerStates: WeakMap<object, GroundTruthState>;
}
