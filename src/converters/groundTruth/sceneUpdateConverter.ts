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
import {
  Immutable,
  Time,
  MessageEvent,
  MessageConverterAlert,
  MessageConverterEmitAlert,
  MessageConverterContext,
  VariableValue,
} from "@lichtblick/suite";
import {
  createLaneBoundaryCacheKey,
  createLaneCacheKey,
  createRenderedPhysicalLaneCacheKey,
} from "@utils/cacheKeys";
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
 * @param hostVehicleIdFallback - Optional fallback host vehicle ID if not set in GroundTruth but in SensorView.
 * @returns A list of OSISceneEntities object containing scene entity lists for each entity type.
 * For each entity type with its corresponding update flag set to true, the scene entity list will be updated.
 * For each entity type with its corresponding update flag set to false, the scene entity list will be empty.
 */
function buildSceneEntities(
  osiGroundTruth: DeepRequired<GroundTruth>,
  updateFlags: OSISceneEntitiesUpdateFlags,
  panelSettings: GroundTruthPanelSettings | undefined,
  modelCache: Map<string, ModelPrimitive>,
  hostVehicleIdFallback?: number,
): OSISceneEntities {
  const time: Time = osiTimestampToTime(osiGroundTruth.timestamp);
  const hostVehicleId = osiGroundTruth.host_vehicle_id?.value ?? hostVehicleIdFallback;

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

    if (hostVehicleId != undefined && obj.id.value === hostVehicleId) {
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
  hostVehicleIdFallback?: number,
  emitAlert?: MessageConverterEmitAlert,
): DeepPartial<SceneUpdate> {
  const {
    laneBoundaryCache,
    laneCache,
    logicalLaneBoundaryCache,
    logicalLaneCache,
    modelCache,
    state,
  } = ctx;

  const osiGroundTruthReq = osiGroundTruth as DeepRequired<GroundTruth>;
  const timestamp = osiTimestampToTime(osiGroundTruthReq.timestamp);
  const gtHostVehicleId = osiGroundTruth.host_vehicle_id?.value;
  const usingHostVehicleIdFallback =
    gtHostVehicleId == undefined && hostVehicleIdFallback != undefined;

  if (usingHostVehicleIdFallback) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message: "GroundTruth host_vehicle_id missing, using SensorView host_vehicle_id fallback",
      tip: "Set host_vehicle_id in GroundTruth to avoid fallback behavior.",
    };
    emitAlert?.(alert, "groundtruth-sceneupdate-host-vehicle-fallback-used");
  }

  if (
    gtHostVehicleId != undefined &&
    hostVehicleIdFallback != undefined &&
    gtHostVehicleId !== hostVehicleIdFallback
  ) {
    const alert: MessageConverterAlert = {
      severity: "warn",
      message:
        "GroundTruth host_vehicle_id (" +
        String(gtHostVehicleId) +
        ") differs from SensorView host_vehicle_id (" +
        String(hostVehicleIdFallback) +
        ")",
      tip: "Using GroundTruth host_vehicle_id. Ensure both sources agree.",
    };
    emitAlert?.(alert, "groundtruth-sceneupdate-host-vehicle-id-divergence");
  }

  const config = (event?.topicConfig as GroundTruthPanelSettings | undefined) ?? DEFAULT_CONFIG;
  // Cache signature ties caches to settings so data is not reused across different panel settings
  const configSignature = JSON.stringify({
    caching: config.caching,
    showAxes: config.showAxes,
    showPhysicalLanes: config.showPhysicalLanes,
    showLogicalLanes: config.showLogicalLanes,
    showReferenceLines: config.showReferenceLines,
    showBoundingBox: config.showBoundingBox,
    show3dModels: config.show3dModels,
    defaultModelPath: config.defaultModelPath,
  });

  // Reset caches if configuration changed
  if (configSignature !== state.previousConfigSignature) {
    laneBoundaryCache.clear();
    laneCache.clear();
    logicalLaneBoundaryCache.clear();
    logicalLaneCache.clear();
    modelCache.clear();
    ctx.groundTruthFrameCache.clear();
  }

  state.previousConfig = config;
  state.previousConfigSignature = configSignature;
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

  // Frame cache is partitioned by config signature to prevent cross-config reuse.
  // Respect `caching=false` by skipping frame-level cache reads/writes entirely.
  let frameCache: WeakMap<GroundTruth, PartialSceneEntity[]> | undefined;
  if (caching) {
    frameCache = ctx.groundTruthFrameCache.get(configSignature);
    if (!frameCache) {
      frameCache = new WeakMap();
      ctx.groundTruthFrameCache.set(configSignature, frameCache);
    }

    // Frame-level cache check before converting/building anything
    if (frameCache.has(osiGroundTruth)) {
      return {
        deletions,
        entities: frameCache.get(osiGroundTruth),
      };
    }
  }

  // Conversion logic
  const sceneEntities: PartialSceneEntity[] = [];

  try {
    const updateFlags: OSISceneEntitiesUpdateFlags = {
      laneBoundaries: true,
      logicalLaneBoundaries: true,
      lanes: true,
      logicalLanes: true,
    };

    // Cache reuse (lanes and lane boundaries)
    let laneBoundaryCacheKey: string | undefined;
    let laneCacheKey: string | undefined;
    let logicalLaneBoundaryCacheKey: string | undefined;
    let logicalLaneCacheKey: string | undefined;

    if (caching) {
      // Physical lane boundaries
      if (config.showPhysicalLanes) {
        laneBoundaryCacheKey = createLaneBoundaryCacheKey(osiGroundTruthReq.lane_boundary);
        if (laneBoundaryCache.has(laneBoundaryCacheKey)) {
          sceneEntities.push(...laneBoundaryCache.get(laneBoundaryCacheKey)!);
          updateFlags.laneBoundaries = false;
        }
      }

      // Physical lanes
      if (config.showPhysicalLanes) {
        laneCacheKey = createRenderedPhysicalLaneCacheKey(osiGroundTruthReq.lane);
        // Lane geometry depends on boundary geometry. Reuse lane cache only if
        // boundaries were also reused from cache in this frame.
        if (!updateFlags.laneBoundaries && laneCache.has(laneCacheKey)) {
          sceneEntities.push(...laneCache.get(laneCacheKey)!);
          updateFlags.lanes = false;
        }
      }

      // Logical lane boundaries
      if (config.showLogicalLanes) {
        logicalLaneBoundaryCacheKey = createLaneBoundaryCacheKey(
          osiGroundTruthReq.logical_lane_boundary,
        );
        if (logicalLaneBoundaryCache.has(logicalLaneBoundaryCacheKey)) {
          sceneEntities.push(
            ...logicalLaneBoundaryCache.get(logicalLaneBoundaryCacheKey)!,
          );
          updateFlags.logicalLaneBoundaries = false;
        }
      }

      // Logical lanes
      if (config.showLogicalLanes) {
        logicalLaneCacheKey = createLaneCacheKey(osiGroundTruthReq.logical_lane);
        // Logical lane geometry depends on logical boundary geometry. Reuse
        // logical lane cache only if logical boundaries were also reused from
        // cache in this frame.
        if (!updateFlags.logicalLaneBoundaries && logicalLaneCache.has(logicalLaneCacheKey)) {
          sceneEntities.push(...logicalLaneCache.get(logicalLaneCacheKey)!);
          updateFlags.logicalLanes = false;
        }
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
    } = buildSceneEntities(
      osiGroundTruthReq,
      updateFlags,
      config,
      modelCache,
      hostVehicleIdFallback,
    );

    // Merge cached and built entities
    sceneEntities.push(
      ...movingObjects,
      ...stationaryObjects,
      ...trafficSigns,
      ...trafficLights,
      ...roadMarkings,
      ...laneBoundaries,
      ...logicalLaneBoundaries,
      ...lanes,
      ...logicalLanes,
      ...referenceLines,
    );

    // Update caches
    if (caching && updateFlags.laneBoundaries && laneBoundaryCacheKey) {
      laneBoundaryCache.clear();
      laneBoundaryCache.set(laneBoundaryCacheKey, laneBoundaries);
    }
    if (caching && updateFlags.lanes && laneCacheKey) {
      laneCache.clear();
      laneCache.set(laneCacheKey, lanes);
    }
    if (caching && updateFlags.logicalLaneBoundaries && logicalLaneBoundaryCacheKey) {
      logicalLaneBoundaryCache.clear();
      logicalLaneBoundaryCache.set(logicalLaneBoundaryCacheKey, logicalLaneBoundaries);
    }
    if (caching && updateFlags.logicalLanes && logicalLaneCacheKey) {
      logicalLaneCache.clear();
      logicalLaneCache.set(logicalLaneCacheKey, logicalLanes);
    }

    // Store GroundTruth frame cache
    if (caching && frameCache) {
      frameCache.set(osiGroundTruth, sceneEntities);
    }
  } catch (error) {
    console.error(
      "OsiGroundTruthVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
      error,
    );
    const alert: MessageConverterAlert = {
      severity: "error",
      message: "GroundTruth conversion failed",
      error: error instanceof Error ? error : new Error(String(error)),
      tip: "Check if input messages match the expected OSI GroundTruth schema.",
    };
    emitAlert?.(alert, "groundtruth-conversion-error");
  }

  return {
    deletions,
    entities: sceneEntities,
  };
}

export function registerGroundTruthConverter(): (
  msg: GroundTruth,
  event: Immutable<MessageEvent<GroundTruth>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
) => unknown {
  const ctx = createGroundTruthContext();

  return (
    msg: GroundTruth,
    event: Immutable<MessageEvent<GroundTruth>>,
    _globalVariables?: Readonly<Record<string, VariableValue>>,
    context?: MessageConverterContext,
  ) => convertGroundTruthToSceneUpdate(ctx, msg, event, undefined, context?.emitAlert);
}
