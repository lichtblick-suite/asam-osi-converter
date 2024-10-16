import {
  BaseMoving,
  BaseStationary,
  Identifier,
  LaneBoundary_BoundaryPoint,
  LaneBoundary_Classification_Type,
  MovingObject_Type,
  MovingObject_VehicleAttributes,
  MovingObject_VehicleClassification_Type,
  StationaryObject_Classification_Color,
  StationaryObject_Classification_Density,
  StationaryObject_Classification_Material,
  StationaryObject_Classification_Type,
  Timestamp,
  TrafficLight_Classification_Color,
  TrafficLight_Classification_Icon,
  TrafficLight_Classification_Mode,
  TrafficSign_MainSign_Classification_Type,
  TrafficSign_SupplementarySign_Classification_Type,
} from "asam-osi-types";

export interface OsiMovingObjectVehicleClassification {
  type: { value: MovingObject_VehicleClassification_Type };
  light_state: Record<string, Identifier>;
}
export interface OsiObject {
  id: Identifier;
  base: BaseMoving | BaseStationary;
}

export interface OsiMovingObject extends OsiObject {
  type: { value: MovingObject_Type };
  vehicle_attributes: MovingObject_VehicleAttributes;
  vehicle_classification: OsiMovingObjectVehicleClassification;
}

export interface OsiStationaryObject extends OsiObject {
  classification: {
    color: {
      value: StationaryObject_Classification_Color;
    };
    type: {
      value: StationaryObject_Classification_Type;
    };
    material: {
      value: StationaryObject_Classification_Material;
    };
    density: {
      value: StationaryObject_Classification_Density;
    };
  };
}

export interface OsiLaneBoundaryClassification {
  type: { value: LaneBoundary_Classification_Type };
}

export interface OsiLaneBoundary {
  id: Identifier;
  boundary_line: LaneBoundary_BoundaryPoint[];
  classification: OsiLaneBoundaryClassification;
}

export interface OsiTrafficSign {
  id: Identifier;
  main_sign: OsiTrafficSignMainSign;
  supplementary_sign: OsiTrafficSignSupplementarySign[];
}

export interface OsiTrafficSignMainSign {
  base: BaseStationary;
  classification: OsiTrafficSignMainSignClassification;
}

export interface OsiTrafficSignSupplementarySign {
  base: BaseStationary;
  classification: OsiTrafficSignSupplementarySignClassification;
}

export interface OsiTrafficSignMainSignClassification {
  type: {
    value: TrafficSign_MainSign_Classification_Type;
  };
  value: {
    value: number;
  };
}

export interface OsiTrafficSignSupplementarySignClassification {
  type: {
    value: TrafficSign_SupplementarySign_Classification_Type;
  };
  value: {
    value: number;
  };
}

export interface OsiGroundTruth {
  timestamp: Timestamp;
  host_vehicle_id: Identifier;
  stationary_object: OsiStationaryObject[];
  moving_object: OsiMovingObject[];
  lane_boundary: OsiLaneBoundary[];
  traffic_sign: OsiTrafficSign[];
  traffic_light: OsiTrafficLight[];
}

export interface OsiTrafficLight extends OsiObject {
  classification: OsiTrafficLightClassification;
}

export interface OsiTrafficLightClassification {
  color: {
    value: TrafficLight_Classification_Color;
  };
  icon: {
    value: TrafficLight_Classification_Icon;
  };
  mode: {
    value: TrafficLight_Classification_Mode;
  };
  counter: number;
  assigned_lane_id: Identifier[];
  is_out_of_service?: boolean;
}
