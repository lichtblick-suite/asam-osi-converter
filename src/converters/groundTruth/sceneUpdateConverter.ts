import { buildLaneBoundaryEntity, buildLaneEntity } from "@features/lanes";
import { buildLogicalLaneBoundaryEntity, buildLogicalLaneEntity } from "@features/logicallanes";
import { createModelPrimitive, buildMovingObjectEntity } from "@features/movingobjects";
import { buildReferenceLineEntity } from "@features/referenceline";
import { buildRoadMarkingEntity } from "@features/roadmarkings";
import { buildStationaryObjectEntity } from "@features/stationaryobjects";
import { buildTrafficLightEntity } from "@features/trafficlights";
import { buildTrafficLightMetadata } from "@features/trafficlights/metadata";
import { buildTrafficSignEntity } from "@features/trafficsigns";
import { ModelPrimitive, SceneUpdate } from "@foxglove/schemas";
import { GroundTruth } from "@lichtblick/asam-osi-types";
import { Immutable, Time, MessageEvent } from "@lichtblick/suite";
import { hashLaneBoundaries, hashLanes } from "@utils/hashing";
import { convertPathToFileUrl, osiTimestampToTime } from "@utils/helper";
import { getDeletedEntities, PartialSceneEntity } from "@utils/scene";
import { DeepPartial, DeepRequired } from "ts-essentials";

import { createGroundTruthContext } from "./context";
import { DEFAULT_CONFIG } from "./panelSettings";
import {
  GroundTruthPanelSettings,
  OSISceneEntities,
  OSISceneEntitiesUpdateFlags,
  GroundTruthContext,
} from "./types";

import {
  HOST_OBJECT_COLOR,
  MOVING_OBJECT_COLOR,
  STATIONARY_OBJECT_COLOR,
} from "@/config/constants";
import {
  PREFIX_LANE,
  PREFIX_LANE_BOUNDARY,
  PREFIX_LOGICAL_LANE,
  PREFIX_LOGICAL_LANE_BOUNDARY,
  PREFIX_MOVING_OBJECT,
  PREFIX_REFERENCE_LINE,
  PREFIX_ROAD_MARKING,
  PREFIX_STATIONARY_OBJECT,
  PREFIX_TRAFFIC_LIGHT,
  PREFIX_TRAFFIC_SIGN,
} from "@/config/entityPrefixes";
import { OSI_GLOBAL_FRAME } from "@/config/frameTransformNames";

/**
 * Builds all SceneEntities from OSI GroundTruth
 *
 * @param osiGroundTruth - The OSI GroundTruth object used to build scene entities.
 * @param updateFlags - Object containing flags to determine which entities need to be updated.
 * @param panelSettings - Panel settings for GroundTruth topic
 * @param modelCache
 * @returns A list of OSISceneEntities object containing scene entity lists for each entity type.
 * For each entity type with its corresponding update flag set to true, the scene entity list will be updated.
 * For each entity type with its corresponding update flag set to false, the scene entity list will be empty.
 */
function buildSceneEntities(
  osiGroundTruth: DeepRequired<GroundTruth>,
  updateFlags: OSISceneEntitiesUpdateFlags,
  panelSettings: GroundTruthPanelSettings | undefined,
  modelCache: Map<string, ModelPrimitive>,
): OSISceneEntities {
  const time: Time = osiTimestampToTime(osiGroundTruth.timestamp);

  // Moving objects
  const movingObjectSceneEntities = osiGroundTruth.moving_object.map((obj) => {
    let entity;

    const modelPathKey = panelSettings?.defaultModelPath + obj.model_reference;
    if (
      !modelCache.has(modelPathKey) &&
      obj.model_reference.length !== 0 &&
      convertPathToFileUrl(modelPathKey)
    ) {
      modelCache.set(modelPathKey, createModelPrimitive(obj, modelPathKey));
    }

    if (obj.id.value === osiGroundTruth.host_vehicle_id.value) {
      entity = buildMovingObjectEntity(
        obj,
        HOST_OBJECT_COLOR,
        PREFIX_MOVING_OBJECT,
        OSI_GLOBAL_FRAME,
        time,
        panelSettings,
        modelCache,
      );
    } else {
      const objectColor = MOVING_OBJECT_COLOR[obj.type];
      entity = buildMovingObjectEntity(
        obj,
        objectColor,
        PREFIX_MOVING_OBJECT,
        OSI_GLOBAL_FRAME,
        time,
        panelSettings,
        modelCache,
      );
    }
    return entity;
  });

  // Stationary objects
  const stationaryObjectSceneEntities = osiGroundTruth.stationary_object.map((obj) => {
    const objectColor = STATIONARY_OBJECT_COLOR[obj.classification.color].code;
    return buildStationaryObjectEntity(
      obj,
      objectColor,
      PREFIX_STATIONARY_OBJECT,
      OSI_GLOBAL_FRAME,
      time,
      panelSettings,
      modelCache,
    );
  });

  // Traffic Sign objects
  const trafficsignObjectSceneEntities = osiGroundTruth.traffic_sign.map((obj) => {
    return buildTrafficSignEntity(obj, PREFIX_TRAFFIC_SIGN, OSI_GLOBAL_FRAME, time);
  });

  // Traffic Light objects
  const trafficlightObjectSceneEntities = osiGroundTruth.traffic_light.map((obj) => {
    const metadata = buildTrafficLightMetadata(obj);
    return buildTrafficLightEntity(
      obj,
      PREFIX_TRAFFIC_LIGHT,
      OSI_GLOBAL_FRAME,
      time,
      panelSettings,
      metadata,
    );
  });

  // Road Marking objects
  const roadMarkingObjectSceneEntities = osiGroundTruth.road_marking.flatMap((road_marking) => {
    const result = buildRoadMarkingEntity(
      road_marking,
      PREFIX_ROAD_MARKING,
      OSI_GLOBAL_FRAME,
      time,
    );

    if (result != undefined) {
      const partialEntity: PartialSceneEntity = result;
      return partialEntity;
    }

    return [];
  });

  // Lane boundaries
  let laneBoundarySceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.laneBoundaries && panelSettings != undefined && panelSettings.showPhysicalLanes) {
    laneBoundarySceneEntities = osiGroundTruth.lane_boundary.map((lane_boundary) => {
      return buildLaneBoundaryEntity(lane_boundary, OSI_GLOBAL_FRAME, time);
    });
  }

  // Lanes
  let laneSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.lanes && panelSettings != undefined && panelSettings.showPhysicalLanes) {
    // Re-generate lanes only when update.lanes is true
    laneSceneEntities = osiGroundTruth.lane.map((lane) => {
      const rightLaneBoundaryIds = lane.classification.right_lane_boundary_id.map((id) => id.value);
      const leftLaneBoundaryIds = lane.classification.left_lane_boundary_id.map((id) => id.value);
      const leftLaneBoundaries = osiGroundTruth.lane_boundary.filter((b) =>
        leftLaneBoundaryIds.includes(b.id.value),
      );
      const rightLaneBoundaries = osiGroundTruth.lane_boundary.filter((b) =>
        rightLaneBoundaryIds.includes(b.id.value),
      );
      return buildLaneEntity(lane, OSI_GLOBAL_FRAME, time, leftLaneBoundaries, rightLaneBoundaries);
    });
  }

  // Logical lane boundaries
  let logicalLaneBoundarySceneEntities: PartialSceneEntity[] = [];
  if (
    updateFlags.logicalLaneBoundaries &&
    panelSettings != undefined &&
    panelSettings.showLogicalLanes
  ) {
    logicalLaneBoundarySceneEntities = osiGroundTruth.logical_lane_boundary.map((lane_boundary) => {
      return buildLogicalLaneBoundaryEntity(lane_boundary, OSI_GLOBAL_FRAME, time);
    });
  }

  // Logical lanes
  let logicalLaneSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.logicalLanes && panelSettings != undefined && panelSettings.showLogicalLanes) {
    logicalLaneSceneEntities = osiGroundTruth.logical_lane.map((logical_lane) => {
      const rightLaneBoundaryIds = logical_lane.right_boundary_id.map((id) => id.value);
      const leftLaneBoundaryIds = logical_lane.left_boundary_id.map((id) => id.value);
      const leftLaneBoundaries = osiGroundTruth.logical_lane_boundary.filter((b) =>
        leftLaneBoundaryIds.includes(b.id.value),
      );
      const rightLaneBoundaries = osiGroundTruth.logical_lane_boundary.filter((b) =>
        rightLaneBoundaryIds.includes(b.id.value),
      );

      return buildLogicalLaneEntity(
        logical_lane,
        OSI_GLOBAL_FRAME,
        time,
        leftLaneBoundaries,
        rightLaneBoundaries,
      );
    });
  }

  let referenceLineSceneEntities: PartialSceneEntity[] = [];
  if (panelSettings != undefined && panelSettings.showReferenceLines) {
    referenceLineSceneEntities = osiGroundTruth.reference_line.map((reference_line) => {
      return buildReferenceLineEntity(
        reference_line,
        PREFIX_REFERENCE_LINE,
        OSI_GLOBAL_FRAME,
        time,
      );
    });
  }

  return {
    movingObjects: movingObjectSceneEntities,
    stationaryObjects: stationaryObjectSceneEntities,
    trafficSigns: trafficsignObjectSceneEntities,
    trafficLights: trafficlightObjectSceneEntities,
    roadMarkings: roadMarkingObjectSceneEntities,
    laneBoundaries: laneBoundarySceneEntities,
    logicalLaneBoundaries: logicalLaneBoundarySceneEntities,
    lanes: laneSceneEntities,
    logicalLanes: logicalLaneSceneEntities,
    referenceLines: referenceLineSceneEntities,
  };
}

export function convertGroundTruthToSceneUpdate(
  ctx: GroundTruthContext,
  osiGroundTruth: GroundTruth,
  event?: Immutable<MessageEvent<GroundTruth>>,
): DeepPartial<SceneUpdate> {
  const {
    groundTruthFrameCache,
    laneBoundaryCache,
    laneCache,
    logicalLaneBoundaryCache,
    logicalLaneCache,
    modelCache,
    state,
  } = ctx;

  const osiGroundTruthReq = osiGroundTruth as DeepRequired<GroundTruth>;
  const timestamp = osiTimestampToTime(osiGroundTruthReq.timestamp);

  const config = (event?.topicConfig as GroundTruthPanelSettings | undefined) ?? DEFAULT_CONFIG;

  // Reset caches if configuration changed
  if (config !== state.previousConfig) {
    laneBoundaryCache.clear();
    laneCache.clear();
    logicalLaneBoundaryCache.clear();
    logicalLaneCache.clear();
    modelCache.clear();
    ctx.groundTruthFrameCache = new WeakMap();
  }

  state.previousConfig = config;
  const caching = config.caching;

  // Deletions logic (comparing previous step's entities with current step's entities)
  const deletions = [
    ...getDeletedEntities(
      osiGroundTruthReq.moving_object,
      state.previousMovingObjectIds,
      PREFIX_MOVING_OBJECT,
      timestamp,
    ),
    ...getDeletedEntities(
      osiGroundTruthReq.stationary_object,
      state.previousStationaryObjectIds,
      PREFIX_STATIONARY_OBJECT,
      timestamp,
    ),
    ...getDeletedEntities(
      osiGroundTruthReq.traffic_sign,
      state.previousTrafficSignIds,
      PREFIX_TRAFFIC_SIGN,
      timestamp,
    ),
    ...getDeletedEntities(
      osiGroundTruthReq.traffic_light,
      state.previousTrafficLightIds,
      PREFIX_TRAFFIC_LIGHT,
      timestamp,
    ),
    ...getDeletedEntities(
      osiGroundTruthReq.road_marking,
      state.previousRoadMarkingIds,
      PREFIX_ROAD_MARKING,
      timestamp,
    ),
    ...getDeletedEntities(
      config.showPhysicalLanes ? osiGroundTruthReq.lane_boundary : [],
      state.previousLaneBoundaryIds,
      PREFIX_LANE_BOUNDARY,
      timestamp,
    ),
    ...getDeletedEntities(
      config.showLogicalLanes ? osiGroundTruthReq.logical_lane_boundary : [],
      state.previousLogicalLaneBoundaryIds,
      PREFIX_LOGICAL_LANE_BOUNDARY,
      timestamp,
    ),
    ...getDeletedEntities(
      config.showPhysicalLanes ? osiGroundTruthReq.lane : [],
      state.previousLaneIds,
      PREFIX_LANE,
      timestamp,
    ),
    ...getDeletedEntities(
      config.showLogicalLanes ? osiGroundTruthReq.logical_lane : [],
      state.previousLogicalLaneIds,
      PREFIX_LOGICAL_LANE,
      timestamp,
    ),
    ...getDeletedEntities(
      config.showReferenceLines ? osiGroundTruthReq.reference_line : [],
      state.previousReferenceLineIds,
      PREFIX_REFERENCE_LINE,
      timestamp,
    ),
  ];

  // Frame-level cache check before converting/building anything
  if (groundTruthFrameCache.has(osiGroundTruth)) {
    return {
      deletions,
      entities: groundTruthFrameCache.get(osiGroundTruth),
    };
  }

  // Conversion logic
  let sceneEntities: PartialSceneEntity[] = [];

  try {
    const updateFlags: OSISceneEntitiesUpdateFlags = {
      laneBoundaries: true,
      logicalLaneBoundaries: true,
      lanes: true,
      logicalLanes: true,
    };

    // Cache reuse (lanes and lane boundaries)
    let laneBoundaryHash: string | undefined;
    let laneHash: string | undefined;
    let logicalLaneBoundaryHash: string | undefined;
    let logicalLaneHash: string | undefined;

    if (caching) {
      // Physical lane boundaries
      laneBoundaryHash = hashLaneBoundaries(osiGroundTruthReq.lane_boundary);
      if (laneBoundaryCache.has(laneBoundaryHash)) {
        sceneEntities = sceneEntities.concat(laneBoundaryCache.get(laneBoundaryHash)!);
        updateFlags.laneBoundaries = false;
      }

      // Physical lanes
      laneHash = hashLanes(osiGroundTruthReq.lane);
      if (laneCache.has(laneHash)) {
        sceneEntities = sceneEntities.concat(laneCache.get(laneHash)!);
        updateFlags.lanes = false;
      }

      // Logical lane boundaries
      logicalLaneBoundaryHash = hashLaneBoundaries(osiGroundTruthReq.logical_lane_boundary);
      if (logicalLaneBoundaryCache.has(logicalLaneBoundaryHash)) {
        sceneEntities = sceneEntities.concat(
          logicalLaneBoundaryCache.get(logicalLaneBoundaryHash)!,
        );
        updateFlags.logicalLaneBoundaries = false;
      }

      // Logical lanes
      logicalLaneHash = hashLanes(osiGroundTruthReq.logical_lane);
      if (logicalLaneCache.has(logicalLaneHash)) {
        sceneEntities = sceneEntities.concat(logicalLaneCache.get(logicalLaneHash)!);
        updateFlags.logicalLanes = false;
      }
    }

    // Build new entities
    const {
      movingObjects,
      stationaryObjects,
      trafficSigns,
      trafficLights,
      roadMarkings,
      laneBoundaries,
      logicalLaneBoundaries,
      lanes,
      logicalLanes,
      referenceLines,
    } = buildSceneEntities(osiGroundTruthReq, updateFlags, config, modelCache);

    // Merge cached and built entities
    sceneEntities = sceneEntities.concat(
      movingObjects,
      stationaryObjects,
      trafficSigns,
      trafficLights,
      roadMarkings,
      laneBoundaries,
      logicalLaneBoundaries,
      lanes,
      logicalLanes,
      referenceLines,
    );

    // Update caches
    if (caching && updateFlags.laneBoundaries && laneBoundaryHash) {
      laneBoundaryCache.clear();
      laneBoundaryCache.set(laneBoundaryHash, laneBoundaries);
    }
    if (caching && updateFlags.lanes && laneHash) {
      laneCache.clear();
      laneCache.set(laneHash, lanes);
    }
    if (caching && updateFlags.logicalLaneBoundaries && logicalLaneBoundaryHash) {
      logicalLaneBoundaryCache.clear();
      logicalLaneBoundaryCache.set(logicalLaneBoundaryHash, logicalLaneBoundaries);
    }
    if (caching && updateFlags.logicalLanes && logicalLaneHash) {
      logicalLaneCache.clear();
      logicalLaneCache.set(logicalLaneHash, logicalLanes);
    }

    // Store GroundTruth frame cache
    groundTruthFrameCache.set(osiGroundTruth, sceneEntities);
  } catch (error) {
    console.error(
      "OsiGroundTruthVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
  }

  return {
    deletions,
    entities: sceneEntities,
  };
}

export function registerGroundTruthConverter(): (
  msg: GroundTruth,
  event: Immutable<MessageEvent<GroundTruth>>,
) => unknown {
  const ctx = createGroundTruthContext();

  return (msg: GroundTruth, event: Immutable<MessageEvent<GroundTruth>>) =>
    convertGroundTruthToSceneUpdate(ctx, msg, event);
}
