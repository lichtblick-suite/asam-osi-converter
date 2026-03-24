import {
  Lane_Classification_Type,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  type GroundTruth,
} from "@lichtblick/asam-osi-types";
import { buildLaneBoundaryEntity, buildLaneEntity } from "@features/lanes";
import { convertGroundTruthToSceneUpdate, createGroundTruthContext } from "@converters";
import { createLaneBoundaryCacheKey, createRenderedPhysicalLaneCacheKey } from "@utils/hashing";
import { DeepRequired } from "ts-essentials";

jest.mock("@features/trafficlights", () => ({
  buildTrafficLightEntity: jest.fn(() => undefined),
}));

jest.mock("@features/trafficsigns", () => ({
  buildTrafficSignEntity: jest.fn(() => undefined),
}));

jest.mock("@features/lanes", () => ({
  buildLaneBoundaryEntity: jest.fn((laneBoundary) => ({
    id: `laneBoundary-${laneBoundary.id.value}`,
    triangles: [],
  })),
  buildLaneEntity: jest.fn((lane) => ({
    id: `lane-${lane.id.value}`,
    triangles: [],
  })),
}));

const mockedBuildLaneBoundaryEntity = jest.mocked(buildLaneBoundaryEntity);
const mockedBuildLaneEntity = jest.mocked(buildLaneEntity);

function createGroundTruthMessage(
  laneId: number,
  leftBoundaryId: number,
  rightBoundaryId: number,
  isHostVehicleLane = false,
): GroundTruth {
  return {
    timestamp: { seconds: 1, nanos: 0 },
    host_vehicle_id: { value: 0 },
    moving_object: [],
    stationary_object: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    reference_line: [],
    logical_lane_boundary: [],
    logical_lane: [],
    lane_boundary: [
      {
        id: { value: leftBoundaryId },
        boundary_line: [
          {
            position: { x: 0, y: 0, z: 0 },
            width: 0.2,
            height: 0,
          },
          {
            position: { x: 0, y: 1, z: 0 },
            width: 0.2,
            height: 0,
          },
        ],
        classification: {
          type: { value: LaneBoundary_Classification_Type.SOLID_LINE },
          color: LaneBoundary_Classification_Color.WHITE,
        },
      },
      {
        id: { value: rightBoundaryId },
        boundary_line: [
          {
            position: { x: 1, y: 0, z: 0 },
            width: 0.2,
            height: 0,
          },
          {
            position: { x: 1, y: 1, z: 0 },
            width: 0.2,
            height: 0,
          },
        ],
        classification: {
          type: { value: LaneBoundary_Classification_Type.SOLID_LINE },
          color: LaneBoundary_Classification_Color.WHITE,
        },
      },
    ],
    lane: [
      {
        id: { value: laneId },
        classification: {
          type: { value: Lane_Classification_Type.DRIVING },
          is_host_vehicle_lane: isHostVehicleLane,
          centerline_is_driving_direction: true,
          centerline: [],
          left_lane_boundary_id: [{ value: leftBoundaryId }],
          right_lane_boundary_id: [{ value: rightBoundaryId }],
          lane_pairing: [],
          left_adjacent_lane_id: [],
          right_adjacent_lane_id: [],
        },
      },
    ],
  } as unknown as DeepRequired<GroundTruth>;
}

describe("GroundTruth scene update caching", () => {
  const event = {
    topicConfig: {
      caching: true,
      showAxes: true,
      showPhysicalLanes: true,
      showLogicalLanes: false,
      showReferenceLines: false,
      showBoundingBox: true,
      show3dModels: false,
      defaultModelPath: "",
    },
  } as any;

  beforeEach(() => {
    mockedBuildLaneBoundaryEntity.mockClear();
    mockedBuildLaneEntity.mockClear();
  });

  it("reuses cached lanes after a lane-boundary cache hit", () => {
    const ctx = createGroundTruthContext();

    const firstFrame = createGroundTruthMessage(2, 30, 40);
    const secondFrame = createGroundTruthMessage(2, 30, 40);
    const thirdFrame = createGroundTruthMessage(2, 30, 40);

    convertGroundTruthToSceneUpdate(ctx, firstFrame, event);
    convertGroundTruthToSceneUpdate(ctx, secondFrame, event);
    convertGroundTruthToSceneUpdate(ctx, thirdFrame, event);

    expect(mockedBuildLaneBoundaryEntity).toHaveBeenCalledTimes(2);
    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(1);
  });

  it("rebuilds lanes on boundary cache miss even when lane cache key still hits", () => {
    const ctx = createGroundTruthContext();

    const firstFrame = createGroundTruthMessage(3, 50, 60);
    const secondFrame = createGroundTruthMessage(3, 51, 61);

    convertGroundTruthToSceneUpdate(ctx, firstFrame, event);
    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(1);

    const laneKey = createRenderedPhysicalLaneCacheKey(secondFrame.lane as any);
    const boundaryKey = createLaneBoundaryCacheKey(secondFrame.lane_boundary as any);
    expect(ctx.laneCache.has(laneKey)).toBe(true);
    expect(ctx.laneBoundaryCache.has(boundaryKey)).toBe(false);

    convertGroundTruthToSceneUpdate(ctx, secondFrame, event);
    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(2);
  });

  it("rebuilds lanes when host-lane flag changes with stable lane and boundary ids", () => {
    const ctx = createGroundTruthContext();

    const firstFrame = createGroundTruthMessage(4, 70, 80, false);
    const secondFrame = createGroundTruthMessage(4, 70, 80, true);

    convertGroundTruthToSceneUpdate(ctx, firstFrame, event);
    expect(mockedBuildLaneBoundaryEntity).toHaveBeenCalledTimes(2);
    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(1);

    convertGroundTruthToSceneUpdate(ctx, secondFrame, event);
    expect(mockedBuildLaneBoundaryEntity).toHaveBeenCalledTimes(2);
    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(2);
  });
});
