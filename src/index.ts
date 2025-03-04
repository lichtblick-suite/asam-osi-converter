import {
  LineType,
  SceneUpdate,
  type Color,
  type FrameTransform,
  type FrameTransforms,
  type KeyValuePair,
  type LinePrimitive,
  type Point3,
} from "@foxglove/schemas";
import { Time } from "@foxglove/schemas/schemas/typescript/Time";
import {
  DetectedLaneBoundary,
  GroundTruth,
  LaneBoundary,
  LaneBoundary_BoundaryPoint,
  LaneBoundary_Classification_Type,
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
  LaneBoundary_Classification_Color,
  Lane,
  Lane_Classification_Type,
  Lane_Classification_Subtype,
} from "@lichtblick/asam-osi-types";
import { ExtensionContext } from "@lichtblick/suite";
import { eulerToQuaternion } from "@utils/geometry";
import { ColorCode } from "@utils/helper";
import {
  objectToCubePrimitive,
  boundaryPointsToTriangleListPrimitive,
  laneToTriangleListPrimitive,
  LaneBoundaryPoint,
} from "@utils/marker";
import { PartialSceneEntity } from "@utils/scene";
import { DeepPartial, DeepRequired } from "ts-essentials";

import {
  HOST_OBJECT_COLOR,
  MOVING_OBJECT_COLOR,
  STATIONARY_OBJECT_COLOR,
  STATIONARY_OBJECT_TYPE,
  STATIONARY_OBJECT_MATERIAL,
  STATIONARY_OBJECT_DENSITY,
  TRAFFIC_LIGHT_COLOR,
  LANE_BOUNDARY_COLOR,
  LANE_BOUNDARY_OPACITY,
} from "./config";
import { buildTrafficLightMetadata, buildTrafficLightModel } from "./trafficlights";
import { preloadDynamicTextures, buildTrafficSignModel } from "./trafficsigns";

const ROOT_FRAME = "<root>";

function buildObjectEntity(
  osiObject: DeepRequired<MovingObject> | DeepRequired<StationaryObject>,
  color: Color,
  id_prefix: string,
  frame_id: string,
  time: Time,
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

  return {
    timestamp: time,
    frame_id,
    id: id_prefix + osiObject.id.value.toString(),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    cubes: [cube],
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
    id: id_prefix + obj.id.value.toString(),
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
    id: id_prefix + obj.id.value.toString(),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    // texts,
    models,
    metadata,
  };
}

/**
 * Builds a PartialSceneEntity representing an OSI lane boundary.
 *
 * @param osiLaneBoundary - The OSI object, which can be either a MovingObject or a StationaryObject.
 * @param frame_id - The frame ID to be used for the entity.
 * @param time - The timestamp for the entity.
 * @returns A PartialSceneEntity representing the object.
 */
function buildLaneBoundaryEntity(
  osiLaneBoundary: DeepRequired<LaneBoundary>,
  frame_id: string,
  time: Time,
): PartialSceneEntity {
  // Create LaneBoundaryPoint objects
  const laneBoundaryPoints = osiLaneBoundary.boundary_line.map((point) => {
    return {
      position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
      width: point.width === 0 ? 0.02 : point.width, // prevent zero-width lane boundaries from being invisible
      height: point.height,
      dash: point.dash,
    };
  });

  // Define color and opacity based on OSI classification
  const rgb = LANE_BOUNDARY_COLOR[osiLaneBoundary.classification.color];
  const a = LANE_BOUNDARY_OPACITY[osiLaneBoundary.classification.type];
  const color = { r: rgb.r, g: rgb.g, b: rgb.b, a };

  // Set option for dashed lines
  const options = {
    dashed: osiLaneBoundary.classification.type === LaneBoundary_Classification_Type.DASHED_LINE,
  };

  return {
    timestamp: time,
    frame_id,
    id: "lane_boundary_" + osiLaneBoundary.id.value.toString(),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [boundaryPointsToTriangleListPrimitive(laneBoundaryPoints, color, options)],
    metadata: buildLaneBoundaryMetadata(osiLaneBoundary),
  };
}

function buildLaneEntity(
  osiLane: DeepRequired<Lane>,
  frame_id: string,
  time: Time,
  osiLeftLaneBoundaries: DeepRequired<LaneBoundary>[],
  osiRightLaneBoundaries: DeepRequired<LaneBoundary>[],
): PartialSceneEntity {
  const leftLaneBoundaries: LaneBoundaryPoint[][] = [];
  for (const lb of osiLeftLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
        width: point.width === 0 ? 0.02 : point.width, // prevent zero-width lane boundaries from being invisible
        height: point.height,
        dash: point.dash,
      };
    });
    leftLaneBoundaries.push(laneBoundaryPoints);
  }
  const rightLaneBoundaries: LaneBoundaryPoint[][] = [];
  for (const lb of osiRightLaneBoundaries) {
    const laneBoundaryPoints = lb.boundary_line.map((point) => {
      return {
        position: { x: point.position.x, y: point.position.y, z: point.position.z } as Point3,
        width: point.width === 0 ? 0.02 : point.width, // prevent zero-width lane boundaries from being invisible
        height: point.height,
        dash: point.dash,
      };
    });
    rightLaneBoundaries.push(laneBoundaryPoints);
  }
  const options = {
    highlighted: osiLane.classification.is_host_vehicle_lane,
  };

  // SHOULD IT BE ALLOWED TO HAVE ONLY ONE ENTRY IN LANE PAIRING?
  const lanePairing = osiLane.classification.lane_pairing
    .map(
      (pair) =>
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        `(${pair.antecessor_lane_id ? pair.antecessor_lane_id.value : ""}, ${pair.successor_lane_id ? pair.successor_lane_id.value : ""})`,
    )
    .join(", ");

  return {
    timestamp: time,
    frame_id,
    id: "lane_" + osiLane.id.value.toString(),
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    triangles: [
      laneToTriangleListPrimitive(
        leftLaneBoundaries,
        rightLaneBoundaries,
        osiLane.classification.type,
        options,
      ),
    ],
    metadata: [
      {
        key: "type",
        value: Lane_Classification_Type[osiLane.classification.type],
      },
      {
        key: "subtype",
        value: Lane_Classification_Subtype[osiLane.classification.subtype],
      },
      {
        key: "left_lane_boundary_ids",
        value: osiLane.classification.left_lane_boundary_id.map((id) => id.value).join(", "),
      },
      {
        key: "right_lane_boundary_ids",
        value: osiLane.classification.right_lane_boundary_id.map((id) => id.value).join(", "),
      },
      {
        key: "left_adjacent_lane_id",
        value: osiLane.classification.left_adjacent_lane_id.map((id) => id.value).join(", "),
      },
      {
        key: "right_adjacent_lane_id",
        value: osiLane.classification.right_adjacent_lane_id.map((id) => id.value).join(", "),
      },
      {
        key: "lane_pairing",
        value: lanePairing,
      },
    ],
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

export function buildLaneBoundaryMetadata(
  lane_boundary: DeepRequired<LaneBoundary>,
): KeyValuePair[] {
  const metadata: KeyValuePair[] = [
    {
      key: "type",
      value: LaneBoundary_Classification_Type[lane_boundary.classification.type],
    },
    {
      key: "color",
      value: LaneBoundary_Classification_Color[lane_boundary.classification.color],
    },
    {
      key: "width",
      value: lane_boundary.boundary_line[0]?.width!.toString() ?? "0",
    },
    {
      key: "height",
      value: lane_boundary.boundary_line[0]?.height!.toString() ?? "0",
    },
  ];

  return metadata;
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

function osiTimestampToTime(time: DeepRequired<Timestamp>): Time {
  return {
    sec: time.seconds,
    nsec: time.nanos,
  };
}

const staticObjectsRenderCache: {
  lastRenderTime: Time | undefined;
  lastRenderedObjects: Set<number>;
} = {
  lastRenderTime: undefined,
  lastRenderedObjects: new Set<number>(),
};

export function determineTheNeedToRerender(lastRenderTime: Time, currentRenderTime: Time): boolean {
  const diff =
    Number(currentRenderTime.sec) * 1000000000 +
    currentRenderTime.nsec -
    (Number(lastRenderTime.sec) * 1000000000 + lastRenderTime.nsec);
  return !(diff >= 0 && diff <= 10000000);
}

interface OSISceneEntities {
  movingObjects: PartialSceneEntity[];
  stationaryObjects: PartialSceneEntity[];
  trafficSigns: PartialSceneEntity[];
  trafficLights: PartialSceneEntity[];
  laneBoundaries: PartialSceneEntity[];
  lanes: PartialSceneEntity[];
}

interface OSISceneEntitesUpdate {
  movingObjects: boolean;
  stationaryObjects: boolean;
  trafficSigns: boolean;
  trafficLights: boolean;
  laneBoundaries: boolean;
  lanes: boolean;
}

function buildSceneEntities(
  osiGroundTruth: DeepRequired<GroundTruth>,
  update: OSISceneEntitesUpdate,
): OSISceneEntities {
  const time: Time = osiTimestampToTime(osiGroundTruth.timestamp);
  const needtoRerender =
    staticObjectsRenderCache.lastRenderTime != undefined &&
    determineTheNeedToRerender(staticObjectsRenderCache.lastRenderTime, time);

  // Moving objects
  let movingObjectSceneEntities: PartialSceneEntity[] = [];
  if (update.movingObjects) {
    movingObjectSceneEntities = osiGroundTruth.moving_object.map((obj) => {
      let entity;
      if (obj.id.value === osiGroundTruth.host_vehicle_id?.value) {
        const metadata = buildVehicleMetadata(obj.vehicle_classification);
        entity = buildObjectEntity(obj, HOST_OBJECT_COLOR, "", ROOT_FRAME, time, metadata);
      } else {
        const objectType = MovingObject_Type[obj.type];
        const objectColor = MOVING_OBJECT_COLOR[obj.type];
        const prefix = `moving_object_${objectType}_`;
        const metadata =
          obj.type === MovingObject_Type.VEHICLE
            ? buildVehicleMetadata(obj.vehicle_classification)
            : [];
        entity = buildObjectEntity(obj, objectColor, prefix, ROOT_FRAME, time, metadata);
      }
      return entity;
    });
  }

  // Stationary objects
  const stationaryObjectSceneEntities = osiGroundTruth.stationary_object.map((obj) => {
    const objectColor = STATIONARY_OBJECT_COLOR[obj.classification.color].code;
    const metadata = buildStationaryMetadata(obj);
    return buildObjectEntity(obj, objectColor, "stationary_object_", ROOT_FRAME, time, metadata);
  });

  // Traffic Sign objects
  let filteredTrafficSigns: DeepRequired<TrafficSign>[];
  if (needtoRerender) {
    staticObjectsRenderCache.lastRenderedObjects.clear();
    filteredTrafficSigns = osiGroundTruth.traffic_sign;
  } else {
    filteredTrafficSigns = osiGroundTruth.traffic_sign.filter((obj) => {
      return !staticObjectsRenderCache.lastRenderedObjects.has(obj.id.value);
    });
  }
  const trafficsignObjectSceneEntities = filteredTrafficSigns.map((obj) => {
    staticObjectsRenderCache.lastRenderedObjects.add(obj.id.value);
    return buildTrafficSignEntity(obj, "traffic_sign_", ROOT_FRAME, time);
  });
  staticObjectsRenderCache.lastRenderTime = time;

  // Traffic Light objects
  const trafficlightObjectSceneEntities = osiGroundTruth.traffic_light.map((obj) => {
    const metadata = buildTrafficLightMetadata(obj);
    return buildTrafficLightEntity(obj, "traffic_light_", ROOT_FRAME, time, metadata);
  });

  // Lane boundaries
  const laneBoundarySceneEntities = osiGroundTruth.lane_boundary.map((lane_boundary) => {
    return buildLaneBoundaryEntity(lane_boundary, ROOT_FRAME, time);
  });

  // Lanes
  let laneSceneEntities: PartialSceneEntity[] = [];
  if (update.lanes) {
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

  return {
    movingObjects: movingObjectSceneEntities,
    stationaryObjects: stationaryObjectSceneEntities,
    trafficSigns: trafficsignObjectSceneEntities,
    trafficLights: trafficlightObjectSceneEntities,
    laneBoundaries: laneBoundarySceneEntities,
    lanes: laneSceneEntities,
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

function buildGroundTruthSceneEntities(
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

  const road_output_scene_update: PartialSceneEntity = {
    timestamp: { sec: osiSensorData.timestamp.seconds, nsec: osiSensorData.timestamp.nanos },
    frame_id: "ego_vehicle_rear_axis",
    id: "ra_ground_truth",
    lifetime: { sec: 0, nsec: 0 },
    frame_locked: true,
    lines: makePrimitiveLines(osiSensorData.lane_boundary, 1.0),
  };
  return [road_output_scene_update];
}

/* Temporary "hashing" function to create a unique hash for lane objects.

The hashLanes function creates a hash by:

- Concatenating the id values of all Lane objects.
- Iterating over the concatenated string and updating a hash value using bitwise operations.

Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
This might not be the case when using partial chunking of lanes/lane boundaries.
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

/* Temporary "hashing" function to create a unique hash for lane boundary objects.

The hashLanes function creates a hash by:

- Concatenating the id values of all LaneBoundary objects.
- Iterating over the concatenated string and updating a hash value using bitwise operations.

Note: This mechanism is a temporary solution to demonstrate the feasibility of caching as it relies on the assumption that a lane with the same id will always have the same properties.
This might not be the case when using partial chunking of lanes/lane boundaries.
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

export function activate(extensionContext: ExtensionContext): void {
  preloadDynamicTextures();

  const sceneUpdateMemoizationMap = new WeakMap<GroundTruth, PartialSceneEntity[]>();
  const laneBoundaryMemoizationMap = new Map<string, PartialSceneEntity[]>();
  const laneMemoizationMap = new Map<string, PartialSceneEntity[]>();
  const convertGrountTruthToSceneUpdate = (
    osiGroundTruth: GroundTruth,
  ): DeepPartial<SceneUpdate> => {
    let sceneEntities: PartialSceneEntity[] = [];
    let updateMap: OSISceneEntitesUpdate = {
      movingObjects: true,
      stationaryObjects: true,
      trafficSigns: true,
      trafficLights: true,
      laneBoundaries: true,
      lanes: true,
    };
    if (sceneUpdateMemoizationMap.has(osiGroundTruth)) {
      // Read from cache
      sceneEntities = sceneUpdateMemoizationMap.get(osiGroundTruth)!;
    } else {
      try {
        // Check if lane boundaries have changed
        const laneBoundaryHash = hashLaneBoundaries(osiGroundTruth.lane_boundary!);
        if (laneBoundaryMemoizationMap.has(laneBoundaryHash)) {
          sceneEntities = sceneEntities.concat(laneBoundaryMemoizationMap.get(laneBoundaryHash)!);
          updateMap = { ...updateMap, laneBoundaries: false };
          console.log("Lane boundaries found in cache, do not re-generate");
        } else {
          console.log("Lane boundaries not found in cache");
        }
        // Check if lanes have changed
        const laneHash = hashLanes(osiGroundTruth.lane!);
        if (laneMemoizationMap.has(laneHash)) {
          sceneEntities = sceneEntities.concat(laneMemoizationMap.get(laneHash)!);
          updateMap = { ...updateMap, lanes: false };
          console.log("Lanes found in cache, do not re-generate");
        } else {
          console.log("Lanes not found in cache");
        }
        const {
          movingObjects,
          stationaryObjects,
          trafficSigns,
          trafficLights,
          laneBoundaries,
          lanes,
        } = buildSceneEntities(osiGroundTruth as DeepRequired<GroundTruth>, updateMap); // return values are potentially empty lists if updateMap is false for the corresponding entities
        sceneEntities = [
          ...sceneEntities,
          ...movingObjects,
          ...stationaryObjects,
          ...trafficSigns,
          ...trafficLights,
          ...laneBoundaries,
          ...lanes,
        ];
        // Store lane boundaries in cache
        if (updateMap.laneBoundaries) {
          console.log("Store lane boundaries in cache");
          // Empty cache
          laneBoundaryMemoizationMap.clear(); // keep only one lane boundary in cache
          laneBoundaryMemoizationMap.set(laneBoundaryHash, laneBoundaries);
          console.log(laneBoundaryMemoizationMap);
        }
        // Store lanes in cache
        if (updateMap.lanes) {
          console.log("Store lanes in cache");
          // Empty cache
          laneMemoizationMap.clear(); // keep only one lane in cache
          laneMemoizationMap.set(laneHash, lanes);
          console.log(laneMemoizationMap);
        }
        // Write whole scene entity list to cache
        sceneUpdateMemoizationMap.set(osiGroundTruth, sceneEntities);
      } catch (error) {
        console.error(
          "OsiGroundTruthVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
          error,
        );
      }
    }

    return {
      deletions: [],
      entities: sceneEntities,
    };
  };

  const convertSensorDataToSceneUpdate = (osiSensorData: SensorData): DeepPartial<SceneUpdate> => {
    let sceneEntities: PartialSceneEntity[] = [];

    try {
      sceneEntities = buildGroundTruthSceneEntities(osiSensorData as DeepRequired<SensorData>);
    } catch (error) {
      console.error(
        "OsiGroundTruthVisualizer: Error during message conversion:\n%s\nSkipping message! (Input message not compatible?)",
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
    } catch (error) {
      console.error(
        "Error during FrameTransform message conversion:\n%s\nSkipping message! (Input message not compatible?)",
        error,
      );
    }

    return transforms;
  };

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.GroundTruth",
    toSchemaName: "foxglove.SceneUpdate",
    converter: convertGrountTruthToSceneUpdate,
  });

  extensionContext.registerMessageConverter({
    fromSchemaName: "osi3.SensorView",
    toSchemaName: "foxglove.SceneUpdate",
    converter: (osiSensorView: SensorView) =>
      convertGrountTruthToSceneUpdate(osiSensorView.global_ground_truth!),
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
