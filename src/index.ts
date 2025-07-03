import {
  LineType,
  SceneEntityDeletionType,
  SceneUpdate,
  TextPrimitive,
  Vector3,
  type Color,
  type FrameTransform,
  type FrameTransforms,
  type KeyValuePair,
  type LinePrimitive,
  type Point3,
} from "@foxglove/schemas";
import { Time } from "@foxglove/schemas/dist/types/Time";
import {
  DetectedLaneBoundary,
  GroundTruth,
  LaneBoundary,
  LaneBoundary_BoundaryPoint,
  MovingObject,
  MovingObject_Type,
  MovingObject_VehicleClassification,
  MovingObject_VehicleClassification_Type,
  SensorData,
  SensorView,
  StationaryObject,
  Timestamp,
  TrafficLight,
  TrafficSign,
  MovingObject_VehicleClassification_LightState_GenericLightState,
  MovingObject_VehicleClassification_LightState_BrakeLightState,
  MovingObject_VehicleClassification_LightState_IndicatorState,
  Lane,
  RoadMarking,
  RoadMarking_Classification_Type,
  RoadMarking_Classification_Color,
  TrafficSign_MainSign_Classification_Type,
} from "@lichtblick/asam-osi-types";
import { ExtensionContext, Immutable, MessageEvent, PanelSettings } from "@lichtblick/suite";
import { eulerToQuaternion, quaternionMultiplication } from "@utils/geometry";
import { ColorCode } from "@utils/helper";
import { objectToCubePrimitive, pointListToTriangleListPrimitive } from "@utils/marker";
import { PartialSceneEntity, generateSceneEntityId } from "@utils/scene";
import { DeepPartial, DeepRequired } from "ts-essentials";

import {
  HOST_OBJECT_COLOR,
  MOVING_OBJECT_COLOR,
  STATIONARY_OBJECT_COLOR,
  STATIONARY_OBJECT_TYPE,
  STATIONARY_OBJECT_MATERIAL,
  STATIONARY_OBJECT_DENSITY,
  TRAFFIC_LIGHT_COLOR,
  ROAD_MARKING_COLOR,
} from "./config";
import {
  buildLaneEntity,
  buildLaneBoundaryEntity,
  PREFIX_LANE,
  PREFIX_LANE_BOUNDARY,
} from "./lanes";
import {
  buildLogicalLaneEntity,
  buildLogicalLaneBoundaryEntity,
  PREFIX_LOGICAL_LANE,
  PREFIX_LOGICAL_LANE_BOUNDARY,
} from "./logical-lanes";
import { buildTrafficLightMetadata, buildTrafficLightModel } from "./trafficlights";
import { preloadDynamicTextures, buildTrafficSignModel } from "./trafficsigns";

const ROOT_FRAME = "<root>";

// Object-specific prefixes for scene entity ids
const PREFIX_MOVING_OBJECT = "moving_object";
const PREFIX_STATIONARY_OBJECT = "stationary_object";
const PREFIX_TRAFFIC_SIGN = "traffic_sign";
const PREFIX_TRAFFIC_LIGHT = "traffic_light";
const PREFIX_ROAD_MARKING = "road_marking";

type Config = {
  caching: boolean;
  showAxes: boolean;
  showPhysicalLanes: boolean;
  showLogicalLanes: boolean;
};

function buildObjectEntity(
  osiObject: DeepRequired<MovingObject> | DeepRequired<StationaryObject>,
  color: Color,
  id_prefix: string,
  frame_id: string,
  time: Time,
  config: Config | undefined,
  metadata?: KeyValuePair[],
): PartialSceneEntity {
  const cube = objectToCubePrimitive(
    osiObject.base.position.x,
    osiObject.base.position.y,
    osiObject.base.position.z,
    osiObject.base.orientation.roll,
    osiObject.base.orientation.pitch,
    osiObject.base.orientation.yaw,
    osiObject.base.dimension.width,
    osiObject.base.dimension.length,
    osiObject.base.dimension.height,
    color,
  );

  const SHAFT_LENGTH = 0.154;
  const SHAFT_DIAMETER = 0.02;
  const HEAD_LENGTH = 0.046;
  const HEAD_DIAMETER = 0.05;
  const SCALE = 2.0;

  function buildAxisArrow(axis_color: Color, orientation: Vector3 = { x: 0, y: 0, z: 0 }) {
    const baseOrientation = eulerToQuaternion(
      osiObject.base.orientation.roll,
      osiObject.base.orientation.pitch,
      osiObject.base.orientation.yaw,
    );
    const localAxisOrientation = eulerToQuaternion(orientation.x, orientation.y, orientation.z);
    const globalAxisOrientation = quaternionMultiplication(baseOrientation, localAxisOrientation);
    return {
      pose: {
        position: {
          x: osiObject.base.position.x,
          y: osiObject.base.position.y,
          z: osiObject.base.position.z,
        },
        orientation: globalAxisOrientation,
      },
      shaft_length: SHAFT_LENGTH * SCALE,
      shaft_diameter: SHAFT_DIAMETER * SCALE,
      head_length: HEAD_LENGTH * SCALE,
      head_diameter: HEAD_DIAMETER * SCALE,
      color: axis_color,
    };
  }

  function buildAxes() {
    if (!(config?.showAxes ?? false)) {
      return [];
    }
    return [
      buildAxisArrow(ColorCode("r", 1), { x: 0, y: 0, z: 0 }),
      buildAxisArrow(ColorCode("g", 1), { x: 0, y: 0, z: Math.PI / 2 }),
      buildAxisArrow(ColorCode("b", 1), { x: 0, y: -Math.PI / 2, z: 0 }),
    ];
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, osiObject.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: [cube],
    arrows: buildAxes(),
    metadata,
  };
}

function buildTrafficSignEntity(
  obj: DeepRequired<TrafficSign>,
  id_prefix: string,
  frame_id: string,
  time: Time,
  metadata?: KeyValuePair[],
): PartialSceneEntity {
  const models = [];

  models.push(buildTrafficSignModel("main", obj.main_sign));

  if (obj.supplementary_sign.length > 0) {
    for (const item of obj.supplementary_sign) {
      models.push(buildTrafficSignModel("main", item));
    }
  }

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, obj.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    // texts,
    models,
    metadata,
  };
}

function buildTrafficLightEntity(
  obj: DeepRequired<TrafficLight>,
  id_prefix: string,
  frame_id: string,
  time: Time,
  metadata?: KeyValuePair[],
): PartialSceneEntity {
  const models = [];

  models.push(buildTrafficLightModel(obj, TRAFFIC_LIGHT_COLOR[obj.classification.color].code));

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(id_prefix, obj.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    // texts,
    models,
    metadata,
  };
}

function buildRoadMarkingEntity(
  roadMarking: DeepRequired<RoadMarking>,
  frame_id: string,
  time: Time,
): PartialSceneEntity | undefined {
  if (
    roadMarking.classification.traffic_main_sign_type !==
    TrafficSign_MainSign_Classification_Type.STOP
  ) {
    return undefined;
  }

  const roadMarkingPoints = [
    {
      position: {
        x: roadMarking.base.position.x,
        y: roadMarking.base.position.y,
        z: roadMarking.base.position.z,
      } as Point3,
      width: roadMarking.base.dimension.width,
      height: roadMarking.base.dimension.height,
    },
    {
      position: {
        x: roadMarking.base.position.x + roadMarking.base.dimension.length,
        y: roadMarking.base.position.y,
        z: roadMarking.base.position.z,
      } as Point3,
      width: roadMarking.base.dimension.width,
      height: roadMarking.base.dimension.height,
    },
  ];

  // Define color and opacity based on OSI classification
  const rgb = ROAD_MARKING_COLOR[roadMarking.classification.monochrome_color];
  const color = { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };

  // Set option for dashed lines
  const options = {
    dashed: false,
    arrows: false,
    invertArrows: false,
  };

  return {
    timestamp: time,
    frame_id,
    id: generateSceneEntityId(PREFIX_ROAD_MARKING, roadMarking.id.value),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [pointListToTriangleListPrimitive(roadMarkingPoints, color, options)],
    metadata: buildRoadMarkingMetadata(roadMarking),
  };
}

interface IlightStateEnumStringMaps {
  generic_light_state: typeof MovingObject_VehicleClassification_LightState_GenericLightState;
  [key: string]: Record<number, string>;
}

const lightStateEnumStringMaps: IlightStateEnumStringMaps = {
  indicator_state: MovingObject_VehicleClassification_LightState_IndicatorState,
  brake_light_state: MovingObject_VehicleClassification_LightState_BrakeLightState,
  generic_light_state: MovingObject_VehicleClassification_LightState_GenericLightState,
};

export function buildVehicleMetadata(
  vehicle_classification: DeepRequired<MovingObject_VehicleClassification>,
): KeyValuePair[] {
  return [
    {
      key: "type",
      value: MovingObject_VehicleClassification_Type[vehicle_classification.type],
    },
    ...Object.entries(vehicle_classification.light_state ?? {}).map(([key, value]) => {
      return {
        key: `light_state.${key}`,
        value:
          lightStateEnumStringMaps[key]?.[value] ??
          lightStateEnumStringMaps.generic_light_state[value]!,
      };
    }),
  ];
}

export function buildStationaryMetadata(obj: DeepRequired<StationaryObject>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "density",
      value: STATIONARY_OBJECT_DENSITY[obj.classification.density] || STATIONARY_OBJECT_DENSITY[0],
    },
    {
      key: "material",
      value:
        STATIONARY_OBJECT_MATERIAL[obj.classification.material] || STATIONARY_OBJECT_MATERIAL[0],
    },
    {
      key: "color",
      value:
        STATIONARY_OBJECT_COLOR[obj.classification.color].name || STATIONARY_OBJECT_COLOR[0].name,
    },
    {
      key: "type",
      value: STATIONARY_OBJECT_TYPE[obj.classification.type] || STATIONARY_OBJECT_TYPE[0],
    },
  ];

  return metadata;
}

export function buildRoadMarkingMetadata(road_marking: DeepRequired<RoadMarking>): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: RoadMarking_Classification_Type[road_marking.classification.type],
    },
    {
      key: "color",
      value: RoadMarking_Classification_Color[road_marking.classification.monochrome_color],
    },
    {
      key: "width",
      value: road_marking.base.dimension.width.toString(),
    },
    {
      key: "height",
      value: road_marking.base.dimension.height.toString(),
    },
  ];

  return metadata;
}

function osiTimestampToTime(time: DeepRequired<Timestamp>): Time {
  return {
    sec: time.seconds,
    nsec: time.nanos,
  };
}

interface OSISceneEntities {
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

interface OSISceneEntitesUpdate {
  movingObjects: boolean;
  stationaryObjects: boolean;
  trafficSigns: boolean;
  trafficLights: boolean;
  roadMarkings: boolean;
  laneBoundaries: boolean;
  logicalLaneBoundaries: boolean;
  lanes: boolean;
  logicalLanes: boolean;
}

/**
 * Builds a PartialSceneEntity representing an OSI lane boundary.
 *
 * @param osiGroundTruth - The OSI GroundTruth object used to build scene entities.
 * @param updateFlags - Object containing flags to determine which entities need to be updated.
 * @returns A list of OSISceneEntities object containing scene entity lists for each entity type.
 * For each entity type with its corresponding update flag set to true, the scene entity list will be updated.
 * For each entity type with its corresponding update flag set to false, the scene entity list will be empty.
 */
function buildSceneEntities(
  osiGroundTruth: DeepRequired<GroundTruth>,
  updateFlags: OSISceneEntitesUpdate,
  config: Config | undefined,
): OSISceneEntities {
  const time: Time = osiTimestampToTime(osiGroundTruth.timestamp);

  // Moving objects
  let movingObjectSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.movingObjects) {
    movingObjectSceneEntities = osiGroundTruth.moving_object.map((obj) => {
      let entity;
      let metadata = [
        {
          key: "moving_object_type",
          value: MovingObject_Type[obj.type],
        },
      ];
      if (obj.id.value === osiGroundTruth.host_vehicle_id.value) {
        metadata = [...metadata, ...buildVehicleMetadata(obj.vehicle_classification)];
        entity = buildObjectEntity(
          obj,
          HOST_OBJECT_COLOR,
          PREFIX_MOVING_OBJECT,
          ROOT_FRAME,
          time,
          config,
          metadata,
        );
      } else {
        //const objectType = MovingObject_Type[obj.type];
        const objectColor = MOVING_OBJECT_COLOR[obj.type];
        const vehicleMetadata =
          obj.type === MovingObject_Type.VEHICLE
            ? buildVehicleMetadata(obj.vehicle_classification)
            : [];
        metadata = [...metadata, ...vehicleMetadata];
        entity = buildObjectEntity(
          obj,
          objectColor,
          PREFIX_MOVING_OBJECT,
          ROOT_FRAME,
          time,
          config,
          metadata,
        );
      }
      return entity;
    });
  }

  // Stationary objects
  let stationaryObjectSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.stationaryObjects) {
    stationaryObjectSceneEntities = osiGroundTruth.stationary_object.map((obj) => {
      const objectColor = STATIONARY_OBJECT_COLOR[obj.classification.color].code;
      const metadata = buildStationaryMetadata(obj);
      return buildObjectEntity(
        obj,
        objectColor,
        PREFIX_STATIONARY_OBJECT,
        ROOT_FRAME,
        time,
        config,
        metadata,
      );
    });
  }

  // Traffic Sign objects
  const trafficsignObjectSceneEntities = osiGroundTruth.traffic_sign.map((obj) => {
    return buildTrafficSignEntity(obj, PREFIX_TRAFFIC_SIGN, ROOT_FRAME, time);
  });

  // Traffic Light objects
  let trafficlightObjectSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.trafficLights) {
    trafficlightObjectSceneEntities = osiGroundTruth.traffic_light.map((obj) => {
      const metadata = buildTrafficLightMetadata(obj);
      return buildTrafficLightEntity(obj, PREFIX_TRAFFIC_LIGHT, ROOT_FRAME, time, metadata);
    });
  }

  // Road Marking objects
  let roadMarkingObjectSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.roadMarkings) {
    roadMarkingObjectSceneEntities = osiGroundTruth.road_marking.flatMap((road_marking) => {
      const result = buildRoadMarkingEntity(road_marking, ROOT_FRAME, time);

      if (result != undefined) {
        const partialEntity: PartialSceneEntity = result;
        return partialEntity;
      }

      return [];
    });
  }

  // Lane boundaries
  let laneBoundarySceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.laneBoundaries && config != undefined && config.showPhysicalLanes) {
    laneBoundarySceneEntities = osiGroundTruth.lane_boundary.map((lane_boundary) => {
      return buildLaneBoundaryEntity(lane_boundary, ROOT_FRAME, time);
    });
  }

  // Lanes
  let laneSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.lanes && config != undefined && config.showPhysicalLanes) {
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
      return buildLaneEntity(lane, ROOT_FRAME, time, leftLaneBoundaries, rightLaneBoundaries);
    });
  }

  // Logical lane boundaries
  let logicalLaneBoundarySceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.laneBoundaries && config != undefined && config.showLogicalLanes) {
    logicalLaneBoundarySceneEntities = osiGroundTruth.logical_lane_boundary.map((lane_boundary) => {
      return buildLogicalLaneBoundaryEntity(lane_boundary, ROOT_FRAME, time);
    });
  }

  // Logical lanes
  let logicalLaneSceneEntities: PartialSceneEntity[] = [];
  if (updateFlags.logicalLanes && config != undefined && config.showLogicalLanes) {
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
        ROOT_FRAME,
        time,
        leftLaneBoundaries,
        rightLaneBoundaries,
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
  };
}

export function buildEgoVehicleBBCenterFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;
  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: "<root>",
    child_frame_id: "ego_vehicle_bb_center",
    translation: {
      x: hostObject.base.position.x,
      y: hostObject.base.position.y,
      z: hostObject.base.position.z,
    },
    rotation: eulerToQuaternion(
      hostObject.base.orientation.roll,
      hostObject.base.orientation.pitch,
      hostObject.base.orientation.yaw,
    ),
  };
}

export function buildEgoVehicleRearAxleFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;
  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: "ego_vehicle_bb_center",
    child_frame_id: "ego_vehicle_rear_axle",
    translation: {
      x: hostObject.vehicle_attributes.bbcenter_to_rear.x,
      y: hostObject.vehicle_attributes.bbcenter_to_rear.y,
      z: hostObject.vehicle_attributes.bbcenter_to_rear.z,
    },
    rotation: eulerToQuaternion(0, 0, 0),
  };
}

export function buildEgoVehicleRearAxisFrameTransform(
  osiGroundTruth: DeepRequired<GroundTruth>,
): FrameTransform {
  const hostIdentifier = osiGroundTruth.host_vehicle_id.value;
  const hostObject = osiGroundTruth.moving_object.find((obj) => {
    return obj.id.value === hostIdentifier;
  })!;
  return {
    timestamp: osiTimestampToTime(osiGroundTruth.timestamp),
    parent_frame_id: "ego_vehicle_bb_center",
    child_frame_id: "ego_vehicle_rear_axis",
    translation: {
      x: hostObject.vehicle_attributes.bbcenter_to_rear.x,
      y: hostObject.vehicle_attributes.bbcenter_to_rear.y,
      z: hostObject.vehicle_attributes.bbcenter_to_rear.z,
    },
    rotation: eulerToQuaternion(0, 0, 0),
  };
}

function buildSensorDataSceneEntities(
  osiSensorData: DeepRequired<SensorData>,
): PartialSceneEntity[] {
  const ToPoint3 = (boundary: DeepRequired<LaneBoundary_BoundaryPoint>): Point3 => {
    return { x: boundary.position.x, y: boundary.position.y, z: 0 };
  };
  const ToLinePrimitive = (points: Point3[], thickness: number): DeepPartial<LinePrimitive> => {
    return {
      type: LineType.LINE_STRIP,
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: -10 },
      },
      thickness,
      scale_invariant: true,
      points,
      color: ColorCode("green", 1),
      indices: [],
    };
  };

  const makeLinePrimitive = (
    lane_boundary: DeepRequired<DetectedLaneBoundary>,
    thickness: number,
  ): DeepPartial<LinePrimitive> => {
    return ToLinePrimitive(lane_boundary.boundary_line.map(ToPoint3), thickness);
  };

  const makePrimitiveLines = (
    lane_boundary: DeepRequired<DetectedLaneBoundary>[],
    thickness: number,
  ): DeepPartial<LinePrimitive>[] => {
    return lane_boundary.map((b) => makeLinePrimitive(b, thickness));
  };

  const makeInfoText = (): DeepPartial<TextPrimitive> => {
    return {
      pose: {
        position: { x: 0, y: 0, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: -10 },
      },
      billboard: true,
      font_size: 30,
      scale_invariant: true,
      color: ColorCode("green", 1),
      text: "SensorData not supported yet",
    };
  };

  const road_output_scene_update: PartialSceneEntity = {
    timestamp: { sec: osiSensorData.timestamp.seconds, nsec: osiSensorData.timestamp.nanos },
    frame_id: "ego_vehicle_rear_axis",
    id: "ra_ground_truth",
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    lines: makePrimitiveLines(osiSensorData.lane_boundary, 1.0),
    texts: [makeInfoText()],
  };
  return [road_output_scene_update];
}

/**
 * Hashing function to create a unique hash for lane objects.
 *
 * The hashLanes function creates a hash by:
 *
 * - Concatenating the id values of all Lane objects.
 * - Iterating over the concatenated string and updating a hash value using bitwise operations.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
const hashLanes = (lanes: Lane[]): string => {
  const hash = lanes.reduce((acc, lane) => acc + lane.id!.value!.toString(), "");
  let hashValue = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + char;
    hashValue |= 0; // Convert to 32bit integer
  }
  return hashValue.toString();
};

/**
 * Hashing function to create a unique hash for lane boundary objects.
 *
 * The hashLanes function creates a hash by:
 *
 * - Concatenating the id values of all LaneBoundary objects.
 * - Iterating over the concatenated string and updating a hash value using bitwise operations.
 *
 * Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
 * This might not be the case when using partial chunking of lanes/lane boundaries.
 */
const hashLaneBoundaries = (laneBoundaries: LaneBoundary[]): string => {
  const hash = laneBoundaries.reduce(
    (acc, laneBoundary) => acc + laneBoundary.id!.value!.toString(),
    "",
  );
  let hashValue = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + char;
    hashValue |= 0; // Convert to 32bit integer
  }
  return hashValue.toString();
};

/**
 * Identifies and returns entities that have been deleted between frames based on their IDs.
 * Updates the set of IDs from the current frame for future comparisons.
 *
 * @template T - The type of the entities, which must include an `id` property with a `value` of type `number`.
 *
 * @param osiEntities - The array of entities from the current frame, with all properties deeply required.
 * @param previousFrameIds - A set of IDs from the previous frame to compare against.
 * @param entityPrefix - A string prefix to prepend to the deleted entity IDs in the result.
 * @param timestamp - The timestamp to associate with the deleted entities.
 *
 * @returns An array of partial scene entities representing the deleted entities,
 *          each containing an ID, timestamp, and deletion type.
 */
function getDeletedEntities<T extends { id: { value: number } }>(
  osiEntities: DeepRequired<T[]>,
  previousFrameIds: Set<number>,
  entityPrefix: string,
  timestamp: Time,
): PartialSceneEntity[] {
  const currentIds = new Set(osiEntities.map((entity) => entity.id.value));
  const deletedIds = Array.from(previousFrameIds).filter((id) => !currentIds.has(id));
  previousFrameIds.clear();
  currentIds.forEach((id) => previousFrameIds.add(id));
  return deletedIds.map((id) => ({
    id: generateSceneEntityId(entityPrefix, id),
    timestamp,
    type: SceneEntityDeletionType.MATCHING_ID,
  }));
}

function getDeletedSceneEntities(
  sceneEntities: PartialSceneEntity[],
  previousFrameIds: Set<number>,
  entityPrefix: string,
  timestamp: Time,
): PartialSceneEntity[] {
  const currentIds = new Set(sceneEntities.map((entity) => entity.id));
  const deletedIds = Array.from(previousFrameIds).filter(
    (id) => !currentIds.has(generateSceneEntityId(entityPrefix, id)),
  );
  return deletedIds.map((id) => ({
    id: generateSceneEntityId(entityPrefix, id),
    timestamp,
    type: SceneEntityDeletionType.MATCHING_ID,
  }));
}

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  let groundTruthFrameCache = new WeakMap<GroundTruth, PartialSceneEntity[]>(); // Weakly stores scene entities for each individual OSI ground truth frame
  const laneBoundaryCache = new Map<string, PartialSceneEntity[]>(); // Note: A maximum of one entry is kept in this cache.
  const laneCache = new Map<string, PartialSceneEntity[]>(); // Note: A maximum of one entry is kept in this cache.

  const state = {
    previousMovingObjectIds: new Set<number>(),
    previousStationaryObjectIds: new Set<number>(),
    previousLaneBoundaryIds: new Set<number>(),
    previousLogicalLaneBoundaryIds: new Set<number>(),
    previousLaneIds: new Set<number>(),
    previousLogicalLaneIds: new Set<number>(),
    previousTrafficSignIds: new Set<number>(),
    previousTrafficLightIds: new Set<number>(),
    previousRoadMarkingIds: new Set<number>(),
    previousConfig: {} as Config | undefined,
  };

  const convertGroundTruthToSceneUpdate = (
    osiGroundTruth: GroundTruth,
    event?: Immutable<MessageEvent<GroundTruth>>,
  ): DeepPartial<SceneUpdate> => {
    let sceneEntities: PartialSceneEntity[] = [];
    let updateFlags: OSISceneEntitesUpdate = {
      movingObjects: true,
      stationaryObjects: true,
      trafficSigns: true,
      trafficLights: true,
      roadMarkings: true,
      laneBoundaries: true,
      logicalLaneBoundaries: true,
      lanes: true,
      logicalLanes: true,
    };

    const config = event?.topicConfig as Config | undefined;
    if (config && config !== state.previousConfig) {
      // Reset caches if configuration changed
      laneBoundaryCache.clear();
      laneCache.clear();
      groundTruthFrameCache = new WeakMap<GroundTruth, PartialSceneEntity[]>();
    }
    state.previousConfig = config;
    const caching = config?.caching;

    const osiGroundTruthReq = osiGroundTruth as DeepRequired<GroundTruth>;
    const timestamp = osiTimestampToTime(osiGroundTruthReq.timestamp);

    // Check OSI ground truth object deletions and store ids in state for next frame
    const deletionsMovingObjects = getDeletedEntities(
      osiGroundTruthReq.moving_object,
      state.previousMovingObjectIds,
      PREFIX_MOVING_OBJECT,
      timestamp,
    );
    const deletionsStationaryObjects = getDeletedEntities(
      osiGroundTruthReq.stationary_object,
      state.previousStationaryObjectIds,
      PREFIX_STATIONARY_OBJECT,
      timestamp,
    );
    const deletionsTrafficSigns = getDeletedEntities(
      osiGroundTruthReq.traffic_sign,
      state.previousTrafficSignIds,
      PREFIX_TRAFFIC_SIGN,
      timestamp,
    );
    const deletionsTrafficLights = getDeletedEntities(
      osiGroundTruthReq.traffic_light,
      state.previousTrafficLightIds,
      PREFIX_TRAFFIC_LIGHT,
      timestamp,
    );
    const deletionsRoadMarkings = getDeletedEntities(
      osiGroundTruthReq.road_marking,
      state.previousRoadMarkingIds,
      PREFIX_ROAD_MARKING,
      timestamp,
    );
    const deletionsLaneBoundaries = getDeletedEntities(
      osiGroundTruthReq.lane_boundary,
      state.previousLaneBoundaryIds,
      PREFIX_LANE_BOUNDARY,
      timestamp,
    );
    const deletionsLogicalLaneBoundaries = getDeletedEntities(
      osiGroundTruthReq.logical_lane_boundary,
      state.previousLogicalLaneBoundaryIds,
      PREFIX_LOGICAL_LANE_BOUNDARY,
      timestamp,
    );
    const deletionsLanes = getDeletedEntities(
      osiGroundTruthReq.lane,
      state.previousLaneIds,
      PREFIX_LANE,
      timestamp,
    );
    const deletionsLogicalLanes = getDeletedEntities(
      osiGroundTruthReq.logical_lane,
      state.previousLogicalLaneIds,
      PREFIX_LOGICAL_LANE,
      timestamp,
    );

    const deletions = [
      ...deletionsMovingObjects,
      ...deletionsStationaryObjects,
      ...deletionsTrafficSigns,
      ...deletionsTrafficLights,
      ...deletionsRoadMarkings,
      ...deletionsLaneBoundaries,
      ...deletionsLogicalLaneBoundaries,
      ...deletionsLanes,
      ...deletionsLogicalLanes,
    ];

    // Use cached scene entities if that exact OSI ground truth frame is cached
    if (groundTruthFrameCache.has(osiGroundTruth)) {
      return {
        deletions,
        entities: groundTruthFrameCache.get(osiGroundTruth),
      };
    }

    // Build scene entities from OSI ground truth or re-use partially cached entities
    try {
      let laneBoundaryHash: string | undefined;
      let laneHash: string | undefined;
      if (caching === true) {
        // Check if lane boundary hash has changed
        laneBoundaryHash = hashLaneBoundaries(osiGroundTruthReq.lane_boundary);
        if (laneBoundaryCache.has(laneBoundaryHash)) {
          sceneEntities = sceneEntities.concat(laneBoundaryCache.get(laneBoundaryHash)!);
          updateFlags = { ...updateFlags, laneBoundaries: false };
        }

        // Check if lane hash has changed
        laneHash = hashLanes(osiGroundTruthReq.lane);
        if (laneCache.has(laneHash)) {
          sceneEntities = sceneEntities.concat(laneCache.get(laneHash)!);
          updateFlags = { ...updateFlags, lanes: false };
        }
      }

      // Build scene entities from OSI ground truth for update flags set to true
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
      } = buildSceneEntities(osiGroundTruthReq, updateFlags, config);

      // Concatenate newly generated and cached scene entities
      sceneEntities = [
        ...sceneEntities, // contains cached scene entities already
        ...movingObjects,
        ...stationaryObjects,
        ...trafficSigns,
        ...trafficLights,
        ...roadMarkings,
        ...laneBoundaries,
        ...logicalLaneBoundaries,
        ...lanes,
        ...logicalLanes,
      ];

      // Frame clenup for scene entities
      const deletedLaneBoundaries = getDeletedSceneEntities(
        laneBoundaries,
        state.previousLaneBoundaryIds,
        PREFIX_LANE_BOUNDARY,
        timestamp,
      );
      deletions.push(...deletedLaneBoundaries);

      const deletedLogicalLaneBoundaries = getDeletedSceneEntities(
        logicalLaneBoundaries,
        state.previousLogicalLaneBoundaryIds,
        PREFIX_LOGICAL_LANE_BOUNDARY,
        timestamp,
      );
      deletions.push(...deletedLogicalLaneBoundaries);

      const deletedLanes = getDeletedSceneEntities(
        lanes,
        state.previousLaneIds,
        PREFIX_LANE,
        timestamp,
      );
      deletions.push(...deletedLanes);

      const deletedLogicalLanes = getDeletedSceneEntities(
        logicalLanes,
        state.previousLogicalLaneIds,
        PREFIX_LOGICAL_LANE,
        timestamp,
      );
      deletions.push(...deletedLogicalLanes);

      // Store lane boundaries in cache
      if (caching === true && updateFlags.laneBoundaries && laneBoundaryHash) {
        laneBoundaryCache.clear(); // keep only one lane boundary in cache
        laneBoundaryCache.set(laneBoundaryHash, laneBoundaries);
      }

      // Store lanes in cache
      if (caching === true && updateFlags.lanes && laneHash) {
        laneCache.clear(); // keep only one lane in cache
        laneCache.set(laneHash, lanes);
      }

      // Store scene entities for current OSI ground truth frame in cache
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
  };

  const convertSensorDataToSceneUpdate = (osiSensorData: SensorData): DeepPartial<SceneUpdate> => {
    let sceneEntities: PartialSceneEntity[] = [];

    try {
      sceneEntities = buildSensorDataSceneEntities(osiSensorData as DeepRequired<SensorData>);
    } catch (error) {
      console.error(
        "OsiSensorDataVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
        error,
      );
    }
    return {
      deletions: [],
      entities: sceneEntities,
    };
  };

  const convertGroundTruthToFrameTransforms = (message: GroundTruth): FrameTransforms => {
    const transforms = { transforms: [] } as FrameTransforms;

    try {
      // Return empty FrameTransforms if host vehicle id is not set
      if (!message.host_vehicle_id) {
        console.error(
          "Missing host vehicle id GroundTruth message. Can not build FrameTransforms.",
        );
        return transforms;
      }

      // Return empty FrameTransforms if host vehicle is not contained in moving objects
      if (
        message.moving_object &&
        message.moving_object.some((obj) => obj.id?.value === message.host_vehicle_id?.value)
      ) {
        transforms.transforms.push(
          buildEgoVehicleBBCenterFrameTransform(message as DeepRequired<GroundTruth>),
        );
      } else {
        console.error("Host vehicle not found in moving objects");
        return transforms;
      }

      // Add rear axle FrameTransform if bbcenter_to_rear is set in vehicle attributes of ego vehicle
      if (
        message.moving_object.some(
          (obj) =>
            obj.id?.value === message.host_vehicle_id?.value &&
            obj.vehicle_attributes?.bbcenter_to_rear,
        )
      ) {
        transforms.transforms.push(
          buildEgoVehicleRearAxleFrameTransform(message as DeepRequired<GroundTruth>),
        );
      } else {
        console.warn(
          "bbcenter_to_rear not found in ego vehicle attributes. Can not build rear axle FrameTransform.",
        );
      }

      // Add rear axis FrameTransform if bbcenter_to_rear is set in vehicle attributes of ego vehicle
      if (
        message.moving_object.some(
          (obj) =>
            obj.id?.value === message.host_vehicle_id?.value &&
            obj.vehicle_attributes?.bbcenter_to_rear,
        )
      ) {
        transforms.transforms.push(
          buildEgoVehicleRearAxisFrameTransform(message as DeepRequired<GroundTruth>),
        );
      } else {
        console.warn(
          "bbcenter_to_rear not found in ego vehicle attributes. Can not build rear axis FrameTransform.",
        );
      }
    } catch (error) {
      console.error(
        "Error during FrameTransform message conversion:\n%s\nSkipping message! (Input message not compatible?)",
        error,
      );
    }

    return transforms;
  };

  const generatePanelSettings = <T>(obj: PanelSettings<T>) => obj as PanelSettings<unknown>;

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertGroundTruthToSceneUpdate,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.SceneUpdate",
    converter: (osiSensorView: SensorView, event: Immutable<MessageEvent<SensorView>>) =>
      convertGroundTruthToSceneUpdate(osiSensorView.global_ground_truth!, event),
    panelSettings: {
      "3D": generatePanelSettings({
        settings: (config) => ({
          fields: {
            caching: {
              label: "Caching",
              input: "boolean",
              value: config?.caching,
              help: "Enables caching of lanes and lane boundaries.",
            },
            showAxes: {
              label: "Show axes",
              input: "boolean",
              value: config?.showAxes,
            },
            showPhysicalLanes: {
              label: "Show Physical Lanes",
              input: "boolean",
              value: config?.showPhysicalLanes,
            },
            showLogicalLanes: {
              label: "Show Logical Lanes",
              input: "boolean",
              value: config?.showLogicalLanes,
            },
          },
        }),
        handler: (action, config: Config | undefined) => {
          if (config == undefined) {
            return;
          }
          if (action.action === "update" && action.payload.path[2] === "caching") {
            config.caching = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showAxes") {
            config.showAxes = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showPhysicalLanes") {
            config.showPhysicalLanes = action.payload.value as boolean;
          }
          if (action.action === "update" && action.payload.path[2] === "showLogicalLanes") {
            config.showLogicalLanes = action.payload.value as boolean;
          }
        },
        defaultConfig: {
          caching: true,
          showAxes: true,
          showPhysicalLanes: true,
          showLogicalLanes: false,
        },
      }),
    },
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorData",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertSensorDataToSceneUpdate,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.FrameTransforms",
    converter: convertGroundTruthToFrameTransforms,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.FrameTransforms",
    converter: (message: SensorView) =>
      convertGroundTruthToFrameTransforms(message.global_ground_truth!),
  });
}
