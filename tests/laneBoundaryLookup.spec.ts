import { convertGroundTruthToSceneUpdate, createGroundTruthContext } from "@converters";
import { buildLaneEntity } from "@features/lanes";
import {
  Lane_Classification_Type,
  LaneBoundary_Classification_Color,
  LaneBoundary_Classification_Type,
  type GroundTruth,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

jest.mock("@features/trafficlights", () => ({
  buildTrafficLightEntity: jest.fn(() => undefined),
}));

jest.mock("@features/trafficsigns", () => ({
  buildTrafficSignEntity: jest.fn(() => undefined),
}));

jest.mock("@features/lanes", () => ({
  buildLaneBoundaryEntity: jest.fn((laneBoundary: { id: { value: number } }) => ({
    id: `laneBoundary-${String(laneBoundary.id.value)}`,
    triangles: [],
  })),
  buildLaneEntity: jest.fn((lane: { id: { value: number } }) => ({
    id: `lane-${String(lane.id.value)}`,
    triangles: [],
  })),
}));

const mockedBuildLaneEntity = jest.mocked(buildLaneEntity);

function makeBoundary(id: number, xOffset: number) {
  return {
    id: { value: id },
    boundary_line: [
      { position: { x: xOffset, y: 0, z: 0 }, width: 0.2, height: 0 },
      { position: { x: xOffset, y: 1, z: 0 }, width: 0.2, height: 0 },
    ],
    classification: {
      type: { value: LaneBoundary_Classification_Type.SOLID_LINE },
      color: LaneBoundary_Classification_Color.WHITE,
    },
  };
}

function makeLane(id: number, leftBoundaryIds: number[], rightBoundaryIds: number[]) {
  return {
    id: { value: id },
    classification: {
      type: { value: Lane_Classification_Type.DRIVING },
      is_host_vehicle_lane: false,
      centerline_is_driving_direction: true,
      centerline: [],
      left_lane_boundary_id: leftBoundaryIds.map((v) => ({ value: v })),
      right_lane_boundary_id: rightBoundaryIds.map((v) => ({ value: v })),
      lane_pairing: [],
      left_adjacent_lane_id: [],
      right_adjacent_lane_id: [],
    },
  };
}

function createMessage(
  lanes: ReturnType<typeof makeLane>[],
  boundaries: ReturnType<typeof makeBoundary>[],
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
    lane_boundary: boundaries,
    lane: lanes,
  } as unknown as DeepRequired<GroundTruth>;
}

const panelSettings = {
  caching: true,
  showAxes: true,
  showPhysicalLanes: true,
  showLogicalLanes: false,
  showReferenceLines: false,
  showBoundingBox: true,
  show3dModels: false,
  defaultModelPath: "",
};

const event = { topicConfig: panelSettings } as any;

describe("Lane boundary lookup optimization", () => {
  beforeEach(() => {
    mockedBuildLaneEntity.mockClear();
  });

  it("resolves correct left and right boundaries for each lane", () => {
    // 3 boundaries, 2 lanes referencing different subsets
    const b10 = makeBoundary(10, 0);
    const b20 = makeBoundary(20, 1);
    const b30 = makeBoundary(30, 2);

    const lane1 = makeLane(100, [10], [20]); // left=b10, right=b20
    const lane2 = makeLane(200, [20], [30]); // left=b20, right=b30

    const msg = createMessage([lane1, lane2], [b10, b20, b30]);
    const ctx = createGroundTruthContext();

    convertGroundTruthToSceneUpdate(ctx, msg, event);

    expect(mockedBuildLaneEntity).toHaveBeenCalledTimes(2);

    // Lane 100: left=[b10], right=[b20]
    const [, , , left1, right1] = mockedBuildLaneEntity.mock.calls[0]!;
    expect(left1).toHaveLength(1);
    expect(left1[0]!.id.value).toBe(10);
    expect(right1).toHaveLength(1);
    expect(right1[0]!.id.value).toBe(20);

    // Lane 200: left=[b20], right=[b30]
    const [, , , left2, right2] = mockedBuildLaneEntity.mock.calls[1]!;
    expect(left2).toHaveLength(1);
    expect(left2[0]!.id.value).toBe(20);
    expect(right2).toHaveLength(1);
    expect(right2[0]!.id.value).toBe(30);
  });

  it("handles lanes with multiple boundaries per side", () => {
    const b1 = makeBoundary(1, 0);
    const b2 = makeBoundary(2, 1);
    const b3 = makeBoundary(3, 2);

    const lane = makeLane(100, [1, 2], [3]); // two left boundaries
    const msg = createMessage([lane], [b1, b2, b3]);
    const ctx = createGroundTruthContext();

    convertGroundTruthToSceneUpdate(ctx, msg, event);

    const [, , , left, right] = mockedBuildLaneEntity.mock.calls[0]!;
    expect(left).toHaveLength(2);
    expect(left[0]!.id.value).toBe(1);
    expect(left[1]!.id.value).toBe(2);
    expect(right).toHaveLength(1);
    expect(right[0]!.id.value).toBe(3);
  });

  it("gracefully skips boundary IDs not present in the boundary list", () => {
    const b1 = makeBoundary(1, 0);
    const lane = makeLane(100, [1], [999]); // right references non-existent boundary
    const msg = createMessage([lane], [b1]);
    const ctx = createGroundTruthContext();

    convertGroundTruthToSceneUpdate(ctx, msg, event);

    const [, , , left, right] = mockedBuildLaneEntity.mock.calls[0]!;
    expect(left).toHaveLength(1);
    expect(left[0]!.id.value).toBe(1);
    expect(right).toHaveLength(0); // missing boundary gracefully skipped
  });
});
