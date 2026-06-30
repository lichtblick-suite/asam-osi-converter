import { convertGroundTruthToSceneUpdate, createGroundTruthContext } from "@converters";
import { SceneEntityDeletionType } from "@foxglove/schemas";
import { type GroundTruth } from "@lichtblick/asam-osi-types";
import { getCategoryDeletions, getDeletedEntities, PartialSceneEntity } from "@utils/scene";
import { DeepRequired } from "ts-essentials";

import { PREFIX_LOGICAL_LANE } from "@/config/entityPrefixes";

jest.mock("@features/trafficlights", () => ({
  buildTrafficLightEntity: jest.fn(() => undefined),
}));

jest.mock("@features/trafficsigns", () => ({
  buildTrafficSignEntity: jest.fn(() => undefined),
}));

const TIME = { sec: 1, nsec: 0 };

type IdEntity = { id: { value: number } };

function entities(ids: number[]): DeepRequired<IdEntity[]> {
  return ids.map((value) => ({ id: { value } })) as unknown as DeepRequired<IdEntity[]>;
}

describe("getCategoryDeletions", () => {
  it("behaves like getDeletedEntities when the category is visible", () => {
    const visiblePrev = new Set<number>([1, 2, 3]);
    const diffPrev = new Set<number>([1, 2, 3]);

    const visible = getCategoryDeletions(entities([2, 3]), visiblePrev, PREFIX_LOGICAL_LANE, TIME, {
      visible: true,
    });
    const diff = getDeletedEntities(entities([2, 3]), diffPrev, PREFIX_LOGICAL_LANE, TIME);

    expect(visible).toEqual(diff);
    // Only the id missing from the current frame (1) is deleted.
    expect(visible.map((d) => d.id)).toEqual([`${PREFIX_LOGICAL_LANE}_1`]);
    // Tracking set now mirrors the current frame for the next comparison.
    expect([...visiblePrev].sort()).toEqual([2, 3]);
  });

  it("deletes every current data id when the category is hidden", () => {
    const previousFrameIds = new Set<number>([10]);

    const deletions = getCategoryDeletions(
      entities([10, 11, 12]),
      previousFrameIds,
      PREFIX_LOGICAL_LANE,
      TIME,
      { visible: false },
    );

    // Deletes the union of previously tracked ids and the current data ids so a
    // hidden category is reliably cleared regardless of previous-frame tracking.
    expect(deletions.map((d) => d.id).sort()).toEqual([
      `${PREFIX_LOGICAL_LANE}_10`,
      `${PREFIX_LOGICAL_LANE}_11`,
      `${PREFIX_LOGICAL_LANE}_12`,
    ]);
    deletions.forEach((d) => {
      expect((d as PartialSceneEntity & { type: SceneEntityDeletionType }).type).toBe(
        SceneEntityDeletionType.MATCHING_ID,
      );
    });
    // Tracking is cleared while hidden.
    expect(previousFrameIds.size).toBe(0);
  });

  it("still deletes current data ids when hidden even with no previous tracking", () => {
    const previousFrameIds = new Set<number>();

    const deletions = getCategoryDeletions(
      entities([7, 8]),
      previousFrameIds,
      PREFIX_LOGICAL_LANE,
      TIME,
      { visible: false },
    );

    expect(deletions.map((d) => d.id).sort()).toEqual([
      `${PREFIX_LOGICAL_LANE}_7`,
      `${PREFIX_LOGICAL_LANE}_8`,
    ]);
  });
});

/**
 * Minimal but complete logical-lane GroundTruth so the real logical-lane entity
 * and metadata builders run without throwing.
 */
function createLogicalLaneGroundTruth(): GroundTruth {
  const boundaryLine = (y: number) => [
    { position: { x: 0, y, z: 0 }, s_position: 0, t_position: 0 },
    { position: { x: 10, y, z: 0 }, s_position: 10, t_position: 0 },
    { position: { x: 20, y, z: 0 }, s_position: 20, t_position: 0 },
  ];
  const boundary = (id: number, y: number) => ({
    id: { value: id },
    boundary_line: boundaryLine(y),
    reference_line_id: { value: 9000 },
    physical_boundary_id: [],
    passing_rule: 0,
  });
  const lane = (id: number, left: number, right: number) => ({
    id: { value: id },
    type: 1,
    physical_lane_reference: [],
    reference_line_id: { value: 9000 },
    start_s: 0,
    end_s: 20,
    move_direction: 0,
    right_adjacent_lane: [],
    left_adjacent_lane: [],
    overlapping_lane: [],
    right_boundary_id: [{ value: right }],
    left_boundary_id: [{ value: left }],
    predecessor_lane: [],
    successor_lane: [],
    street_name: "",
  });

  return {
    timestamp: { seconds: 1, nanos: 0 },
    host_vehicle_id: { value: 0 },
    moving_object: [],
    stationary_object: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    reference_line: [],
    lane_boundary: [],
    lane: [],
    logical_lane_boundary: [boundary(1301, 0), boundary(1302, 3)],
    logical_lane: [lane(1373, 1302, 1301)],
  } as unknown as DeepRequired<GroundTruth>;
}

const baseConfig = {
  caching: true,
  showAxes: false,
  showPhysicalLanes: false,
  showLogicalLanes: false,
  showReferenceLines: false,
  showBoundingBox: true,
  show3dModels: false,
  defaultModelPath: "",
};

/** Models a single panel's accumulated scene from SceneUpdate messages. */
class PanelScene {
  public ids = new Set<string>();

  public apply(update: { deletions?: unknown[]; entities?: unknown[] }): void {
    // Deletions are applied before entities, matching the 3D renderer.
    for (const deletion of update.deletions ?? []) {
      const del = deletion as { id: string; type: SceneEntityDeletionType };
      if (del.type === SceneEntityDeletionType.MATCHING_ID) {
        this.ids.delete(del.id);
      }
    }
    for (const entity of update.entities ?? []) {
      this.ids.add((entity as { id: string }).id);
    }
  }

  public logicalLaneCount(): number {
    return [...this.ids].filter((id) => id.startsWith("logical_lane")).length;
  }
}

describe("logical lane visibility toggle", () => {
  it("turning logical lanes off removes them from a single panel", () => {
    const ctx = createGroundTruthContext();
    const msg = createLogicalLaneGroundTruth();
    const scene = new PanelScene();

    scene.apply(
      convertGroundTruthToSceneUpdate(ctx, msg, {
        topicConfig: { ...baseConfig, showLogicalLanes: true },
      } as never),
    );
    expect(scene.logicalLaneCount()).toBeGreaterThan(0);

    scene.apply(
      convertGroundTruthToSceneUpdate(ctx, msg, {
        topicConfig: { ...baseConfig, showLogicalLanes: false },
      } as never),
    );
    expect(scene.logicalLaneCount()).toBe(0);
  });

  it("turning logical lanes off in one panel clears them even when a context is shared across panels", () => {
    // A single converter context is shared by the 3D and Image panels (both
    // subscribe to SensorView). Each panel keeps its own scene and config.
    const ctx = createGroundTruthContext();
    const msg = createLogicalLaneGroundTruth();
    const scene3D = new PanelScene();
    const sceneImage = new PanelScene();

    const config3DOn = { topicConfig: { ...baseConfig, showLogicalLanes: true } } as never;
    const config3DOff = { topicConfig: { ...baseConfig, showLogicalLanes: false } } as never;
    const configImageOff = { topicConfig: { ...baseConfig, showLogicalLanes: false } } as never;

    // 3D shows logical lanes while the Image panel keeps them hidden.
    for (let tick = 0; tick < 3; tick++) {
      scene3D.apply(convertGroundTruthToSceneUpdate(ctx, msg, config3DOn));
      sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, msg, configImageOff));
    }
    expect(scene3D.logicalLaneCount()).toBeGreaterThan(0);
    expect(sceneImage.logicalLaneCount()).toBe(0);

    // The user toggles logical lanes off in the 3D panel.
    for (let tick = 0; tick < 3; tick++) {
      scene3D.apply(convertGroundTruthToSceneUpdate(ctx, msg, config3DOff));
      sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, msg, configImageOff));
    }
    expect(scene3D.logicalLaneCount()).toBe(0);
  });
});
