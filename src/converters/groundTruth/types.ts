import { ModelPrimitive } from "@foxglove/schemas";
import {
  GroundTruth,
  Lane,
  LaneBoundary,
  LogicalLane,
  LogicalLaneBoundary,
  MovingObject,
  ReferenceLine,
  RoadMarking,
  StationaryObject,
  TrafficLight,
  TrafficSign,
} from "@lichtblick/asam-osi-types";
import { PartialSceneEntity } from "@utils/scene";
import { Trusted, MINSET_OBJECT, MINSET_STATIONARY_OBJECT } from "@utils/trustedType";

export interface OSIObjectLists {
  movingObjects: Trusted<MovingObject, typeof MINSET_OBJECT>[];
  stationaryObjects: Trusted<StationaryObject, typeof MINSET_STATIONARY_OBJECT>[];
  trafficSigns: Trusted<TrafficSign, []>[];
  trafficLights: Trusted<TrafficLight, []>[];
  lanes: Trusted<Lane, []>[];
  laneBoundaries: Trusted<LaneBoundary, []>[];
  logicalLanes: Trusted<LogicalLane, []>[];
  logicalLaneBoundaries: Trusted<LogicalLaneBoundary, []>[];
  roadMarkings: Trusted<RoadMarking, []>[];
  referenceLines: Trusted<ReferenceLine, []>[];
}

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
  previousConfig?: GroundTruthPanelSettings;
}

export interface GroundTruthContext {
  groundTruthFrameCache: WeakMap<GroundTruth, PartialSceneEntity[]>;
  laneBoundaryCache: Map<string, PartialSceneEntity[]>;
  laneCache: Map<string, PartialSceneEntity[]>;
  logicalLaneBoundaryCache: Map<string, PartialSceneEntity[]>;
  logicalLaneCache: Map<string, PartialSceneEntity[]>;
  modelCache: Map<string, ModelPrimitive>;
  state: GroundTruthState;
}
