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

export interface OSIObjectLists {
  movingObjects: MovingObject[];
  stationaryObjects: StationaryObject[];
  trafficSigns: TrafficSign[];
  trafficLights: TrafficLight[];
  lanes: Lane[];
  laneBoundaries: LaneBoundary[];
  logicalLanes: LogicalLane[];
  logicalLaneBoundaries: LogicalLaneBoundary[];
  roadMarkings: RoadMarking[];
  referenceLines: ReferenceLine[];
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
