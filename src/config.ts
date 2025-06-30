import { Color } from "@foxglove/schemas";
import {
  LaneBoundary_Classification_Type,
  LaneBoundary_Classification_Color,
  MovingObject_Type,
  StationaryObject_Classification_Color,
  StationaryObject_Classification_Density,
  StationaryObject_Classification_Material,
  StationaryObject_Classification_Type,
  TrafficLight_Classification_Color,
  Lane_Classification_Type,
  RoadMarking_Classification_Color,
} from "@lichtblick/asam-osi-types";
import { ColorCode, ColorCodeName } from "@utils/helper";

//// COLOR CONFIG ////

export const HOST_OBJECT_COLOR: Color = ColorCode("b", 0.5);
export const MOVING_OBJECT_COLOR: Record<MovingObject_Type, Color> = {
  [MovingObject_Type.UNKNOWN]: ColorCode("gray", 0.5),
  [MovingObject_Type.OTHER]: ColorCode("c", 0.5),
  [MovingObject_Type.VEHICLE]: ColorCode("r", 0.5),
  [MovingObject_Type.PEDESTRIAN]: ColorCode("y", 0.5),
  [MovingObject_Type.ANIMAL]: ColorCode("g", 0.5),
};

export const LANE_BOUNDARY_TYPE: Record<LaneBoundary_Classification_Type, Color> = {
  [LaneBoundary_Classification_Type.BARRIER]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.BOTTS_DOTS]: ColorCode("y", 0.5),
  [LaneBoundary_Classification_Type.CURB]: ColorCode("c", 0.5),
  [LaneBoundary_Classification_Type.DASHED_LINE]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.GRASS_EDGE]: ColorCode("g", 0.5),
  [LaneBoundary_Classification_Type.GRAVEL_EDGE]: ColorCode("m", 0.5),
  [LaneBoundary_Classification_Type.GUARD_RAIL]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.NO_LINE]: ColorCode("r", 0.1),
  [LaneBoundary_Classification_Type.OTHER]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.ROAD_EDGE]: ColorCode("b", 0.5),
  [LaneBoundary_Classification_Type.SNOW_EDGE]: ColorCode("w", 0.5),
  [LaneBoundary_Classification_Type.SOIL_EDGE]: ColorCode("y", 0.5),
  [LaneBoundary_Classification_Type.SOLID_LINE]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.SOUND_BARRIER]: ColorCode("gray", 0.5),
  [LaneBoundary_Classification_Type.STRUCTURE]: ColorCode("c", 0.5),
  [LaneBoundary_Classification_Type.UNKNOWN]: ColorCode("gray", 0.5),
};

export const LANE_BOUNDARY_OPACITY: Record<LaneBoundary_Classification_Type, number> = {
  [LaneBoundary_Classification_Type.BARRIER]: 1,
  [LaneBoundary_Classification_Type.BOTTS_DOTS]: 1,
  [LaneBoundary_Classification_Type.CURB]: 1,
  [LaneBoundary_Classification_Type.DASHED_LINE]: 1,
  [LaneBoundary_Classification_Type.GRASS_EDGE]: 1,
  [LaneBoundary_Classification_Type.GRAVEL_EDGE]: 1,
  [LaneBoundary_Classification_Type.GUARD_RAIL]: 1,
  [LaneBoundary_Classification_Type.NO_LINE]: 0.1,
  [LaneBoundary_Classification_Type.OTHER]: 1,
  [LaneBoundary_Classification_Type.ROAD_EDGE]: 1,
  [LaneBoundary_Classification_Type.SNOW_EDGE]: 1,
  [LaneBoundary_Classification_Type.SOIL_EDGE]: 1,
  [LaneBoundary_Classification_Type.SOLID_LINE]: 1,
  [LaneBoundary_Classification_Type.SOUND_BARRIER]: 1,
  [LaneBoundary_Classification_Type.STRUCTURE]: 1,
  [LaneBoundary_Classification_Type.UNKNOWN]: 1,
};

export const LANE_BOUNDARY_COLOR: Record<LaneBoundary_Classification_Color, Color> = {
  [LaneBoundary_Classification_Color.BLUE]: ColorCode("b"),
  [LaneBoundary_Classification_Color.GREEN]: ColorCode("g"),
  [LaneBoundary_Classification_Color.RED]: ColorCode("r"),
  [LaneBoundary_Classification_Color.YELLOW]: ColorCode("y"),
  [LaneBoundary_Classification_Color.ORANGE]: ColorCode("orange"),
  [LaneBoundary_Classification_Color.WHITE]: ColorCode("w"),
  [LaneBoundary_Classification_Color.UNKNOWN]: ColorCode("gray"),
  [LaneBoundary_Classification_Color.NONE]: ColorCode("black"),
  [LaneBoundary_Classification_Color.OTHER]: ColorCode("gray"),
  [LaneBoundary_Classification_Color.VIOLET]: { r: 0.9, g: 0.5, b: 0.9, a: 1 },
};

export const LANE_BOUNDARY_MIN_RENDERING_WIDTH = 0.02; // minimum width for visualization of the lane boundary line even if width is set to 0
export const LANE_BOUNDARY_ARROWS = true; // visualize arrows indicating the definition direction of boundary lines
export const LANE_BOUNDARY_ARROWS_LENGTH = 0.3;
export const LANE_BOUNDARY_ARROWS_WIDTH = 0.2;

export const LANE_VISUALIZATION_WIDTH = 0.75; // width of the gradient surface area pointing from the boundary line to the side of the lane

export const LANE_COLOR_HIGHLIGHT = { r: 1, g: 0.6, b: 0, a: 0.5 }; // used for is_host_vehicle_lane flag

export const LANE_CENTERLINE_SHOW = true;
export const LANE_CENTERLINE_COLOR = { r: 0.75, g: 0.75, b: 0, a: 1 };
export const LANE_CENTERLINE_WIDTH = 0.02;
export const LANE_CENTERLINE_ARROWS = true; // visualize arrows indicating the driving direction of a lane on the centerline
export const LANE_CENTERLINE_ARROWS_LENGTH = 0.3;
export const LANE_CENTERLINE_ARROWS_WIDTH = 0.2;

export const LANE_TYPE: Record<Lane_Classification_Type, Color> = {
  [Lane_Classification_Type.UNKNOWN]: ColorCode("gray", 0.6),
  [Lane_Classification_Type.OTHER]: ColorCode("c", 0.6),
  [Lane_Classification_Type.DRIVING]: { r: 0, g: 1, b: 1, a: 0.5 },
  [Lane_Classification_Type.INTERSECTION]: ColorCode("r", 0.3),
  [Lane_Classification_Type.NONDRIVING]: { r: 1, g: 111 / 255, b: 91 / 255, a: 0.5 },
};

export const LOGICAL_LANE_BOUNDARY_RENDERING_WIDTH = 0.09; // width for visualization of the logical lane boundary line
export const LOGICAL_LANE_BOUNDARY_COLOR = { r: 0.7, g: 0, b: 0, a: 0.6 }; // rendering color of the logical lane boundary

export const LOGICAL_LANE_RENDERING_HEIGHT_OFFSET = 0.02; // height offset for visualization of the logical lane and logical lane boundary line
export const LOGICAL_LANE_COLOR = { r: 0.1, g: 1, b: 0.1, a: 0.3 }; // rendering color of the logical lane
export const LOGICAL_LANE_VISUALIZATION_WIDTH = 1.2; // width of the gradient surface area pointing from the boundary line to the side of the logical lane

export const TRAFFIC_LIGHT_COLOR: Record<TrafficLight_Classification_Color, ColorCodeName> = {
  [TrafficLight_Classification_Color.UNKNOWN]: { code: ColorCode("gray", 1), name: "Unknown" },
  [TrafficLight_Classification_Color.OTHER]: { code: ColorCode("c", 1), name: "Other" },
  [TrafficLight_Classification_Color.RED]: { code: ColorCode("r", 1), name: "Red" },
  [TrafficLight_Classification_Color.YELLOW]: { code: ColorCode("y", 1), name: "Yellow" },
  [TrafficLight_Classification_Color.GREEN]: { code: ColorCode("g", 1), name: "Green" },
  [TrafficLight_Classification_Color.BLUE]: { code: ColorCode("b", 1), name: "Blue" },
  [TrafficLight_Classification_Color.WHITE]: { code: ColorCode("w", 1), name: "White" },
};

export const ROAD_MARKING_COLOR: Record<RoadMarking_Classification_Color, Color> = {
  [RoadMarking_Classification_Color.BLUE]: ColorCode("b"),
  [RoadMarking_Classification_Color.GREEN]: ColorCode("g"),
  [RoadMarking_Classification_Color.RED]: ColorCode("r"),
  [RoadMarking_Classification_Color.YELLOW]: ColorCode("y"),
  [RoadMarking_Classification_Color.ORANGE]: ColorCode("orange"),
  [RoadMarking_Classification_Color.WHITE]: ColorCode("w"),
  [RoadMarking_Classification_Color.UNKNOWN]: ColorCode("gray"),
  [RoadMarking_Classification_Color.OTHER]: ColorCode("gray"),
  [RoadMarking_Classification_Color.VIOLET]: { r: 0.9, g: 0.5, b: 0.9, a: 1 },
};

//// STATIONARY OBJECT MAPPING ////

export const STATIONARY_OBJECT_COLOR: Record<StationaryObject_Classification_Color, ColorCodeName> =
  {
    [StationaryObject_Classification_Color.OTHER]: { code: ColorCode("c", 0.5), name: "Other" },
    [StationaryObject_Classification_Color.YELLOW]: { code: ColorCode("y", 0.5), name: "Yellow" },
    [StationaryObject_Classification_Color.GREEN]: { code: ColorCode("g", 0.5), name: "Green" },
    [StationaryObject_Classification_Color.BLUE]: { code: ColorCode("b", 0.5), name: "Blue" },
    [StationaryObject_Classification_Color.VIOLET]: { code: ColorCode("m", 0.5), name: "Violet" },
    [StationaryObject_Classification_Color.RED]: { code: ColorCode("r", 0.5), name: "Red" },
    [StationaryObject_Classification_Color.ORANGE]: {
      code: ColorCode("orange", 0.5),
      name: "Orange",
    },
    [StationaryObject_Classification_Color.BLACK]: { code: ColorCode("black", 0.5), name: "Black" },
    [StationaryObject_Classification_Color.GREY]: { code: ColorCode("gray", 0.5), name: "Grey" },
    [StationaryObject_Classification_Color.WHITE]: { code: ColorCode("w", 0.5), name: "White" },
    [StationaryObject_Classification_Color.UNKNOWN]: {
      code: ColorCode("gray", 0.5),
      name: "Unknown",
    },
  };

export const STATIONARY_OBJECT_TYPE: Record<StationaryObject_Classification_Type, string> = {
  [StationaryObject_Classification_Type.UNKNOWN]:
    "Type of the object is unknown (must not be used in ground truth).",
  [StationaryObject_Classification_Type.OTHER]: "Other (unspecified but known) type of object.",
  [StationaryObject_Classification_Type.BRIDGE]: "Object is a bridge.",
  [StationaryObject_Classification_Type.BUILDING]: "Object is a building.",
  [StationaryObject_Classification_Type.POLE]: "Object is a pole (e.g. from a traffic light).",
  [StationaryObject_Classification_Type.PYLON]: "Object is a pylon.",
  [StationaryObject_Classification_Type.DELINEATOR]:
    "Object is a delineator (e.g. at a construction site).",
  [StationaryObject_Classification_Type.TREE]: "Object is a tree.",
  [StationaryObject_Classification_Type.BARRIER]: "Object is a barrier.",
  [StationaryObject_Classification_Type.VEGETATION]: "Object is vegetation.",
  [StationaryObject_Classification_Type.CURBSTONE]: "Object is a curbstone.",
  [StationaryObject_Classification_Type.WALL]: "TYPE_WALL",
  [StationaryObject_Classification_Type.VERTICAL_STRUCTURE]:
    "Landmarks corresponding to vertical structures in the environment.",
  [StationaryObject_Classification_Type.RECTANGULAR_STRUCTURE]:
    "Landmarks corresponding to rectangular structures in the environment, like walls.",
  [StationaryObject_Classification_Type.OVERHEAD_STRUCTURE]:
    "Landmarks corresponding to overhead structures in the environment, like sign bridges.",
  [StationaryObject_Classification_Type.REFLECTIVE_STRUCTURE]:
    "Landmarks corresponding to reflective structures in the environment, like reflective poles on the road boarder.",
  [StationaryObject_Classification_Type.CONSTRUCTION_SITE_ELEMENT]:
    "Landmarks corresponding to construction site elements in the environment, like beacons.",
  [StationaryObject_Classification_Type.SPEED_BUMP]: "Object is a speed bump.",
  [StationaryObject_Classification_Type.EMITTING_STRUCTURE]:
    "Landmarks corresponding to sources of electromagnetic waves in the environment, like street lights.",
};

export const STATIONARY_OBJECT_MATERIAL: Record<StationaryObject_Classification_Material, string> =
  {
    [StationaryObject_Classification_Material.UNKNOWN]:
      "Type of the material is unknown (must not be used in ground truth).",
    [StationaryObject_Classification_Material.OTHER]:
      "Other (unspecified but known) type of material.",
    [StationaryObject_Classification_Material.WOOD]: "Wooden structure.",
    [StationaryObject_Classification_Material.PLASTIC]: "Plastic structure.",
    [StationaryObject_Classification_Material.CONCRETE]: "Concrete structure.",
    [StationaryObject_Classification_Material.METAL]: "Metal structure.",
    [StationaryObject_Classification_Material.STONE]: "Natural stone structure.",
    [StationaryObject_Classification_Material.GLAS]: "Glas structure.",
    [StationaryObject_Classification_Material.MUD]: "Mud structure.",
  };

export const STATIONARY_OBJECT_DENSITY: Record<StationaryObject_Classification_Density, string> = {
  [StationaryObject_Classification_Density.UNKNOWN]:
    "Type of the material density is unknown (must not be used in ground truth).",
  [StationaryObject_Classification_Density.OTHER]:
    "Other (unspecified but known) type of material density.",
  [StationaryObject_Classification_Density.SOLID]: "No perforation - solid;.",
  [StationaryObject_Classification_Density.SMALL_MESH]: "Perforation max.]0; 100] mm",
  [StationaryObject_Classification_Density.MEDIAN_MESH]: "Perforation max.]100; 500] mm",
  [StationaryObject_Classification_Density.LARGE_MESH]: "Perforation max. ]500; 5000] mm",
  [StationaryObject_Classification_Density.OPEN]: "Perforation max. ]5000; infinity[ mm",
};
