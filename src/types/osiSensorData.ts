export interface OsiTimestamp {
  seconds: number;
  nanos: number;
}

export interface OsiVector3d {
  x: number;
  y: number;
  z: number;
}

export interface OsiLaneBoundaryBoundaryPoint {
  position: OsiVector3d;
  width: number;
  height: number;
}

export interface OsiDetectedLaneBoundary {
  boundary_line: OsiLaneBoundaryBoundaryPoint[];
}
