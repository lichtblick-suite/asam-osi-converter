import { convertGroundTruthToSceneUpdate, createGroundTruthContext } from "@converters";
import { SceneEntityDeletionType } from "@foxglove/schemas";
import { MovingObject_Type, type GroundTruth } from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

jest.mock("@features/trafficlights", () => ({ buildTrafficLightEntity: jest.fn(() => undefined) }));
jest.mock("@features/trafficsigns", () => ({ buildTrafficSignEntity: jest.fn(() => undefined) }));

function movingObject(id: number, x: number) {
  return {
    id: { value: id },
    type: MovingObject_Type.VEHICLE,
    model_reference: "",
    base: {
      position: { x, y: 0, z: 0 },
      orientation: { roll: 0, pitch: 0, yaw: 0 },
      dimension: { width: 2, length: 4, height: 1.5 },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
    },
  };
}

function groundTruth(movingObjectIds: Array<{ id: number; x: number }>): GroundTruth {
  return {
    timestamp: { seconds: 1, nanos: 0 },
    host_vehicle_id: { value: 0 },
    moving_object: movingObjectIds.map(({ id, x }) => movingObject(id, x)),
    stationary_object: [],
    traffic_sign: [],
    traffic_light: [],
    road_marking: [],
    reference_line: [],
    lane_boundary: [],
    lane: [],
    logical_lane_boundary: [],
    logical_lane: [],
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

class PanelScene {
  public ids = new Set<string>();
  public apply(update: { deletions?: unknown[]; entities?: unknown[] }): void {
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
  public has(id: string): boolean {
    return this.ids.has(id);
  }
}

describe("multi-panel moving-object deletion (shared converter context)", () => {
  it("removes a departed object from BOTH panels that share one context", () => {
    // The 3D and Image panels both subscribe to SensorView and therefore share a
    // single converter context, but each keeps its own scene and panel config.
    const ctx = createGroundTruthContext();
    const event3D = { topicConfig: { ...baseConfig } } as never;
    const eventImage = { topicConfig: { ...baseConfig } } as never;

    const scene3D = new PanelScene();
    const sceneImage = new PanelScene();

    // Frame 1: host (0) and lead vehicle (1384) both present.
    const frame1 = groundTruth([
      { id: 0, x: 0 },
      { id: 1384, x: 50 },
    ]);
    scene3D.apply(convertGroundTruthToSceneUpdate(ctx, frame1, event3D));
    sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, frame1, eventImage));

    expect(scene3D.has("moving_object_1384")).toBe(true);
    expect(sceneImage.has("moving_object_1384")).toBe(true);

    // Frame 2: lead vehicle leaves the (filtered) data; only host remains.
    const frame2 = groundTruth([{ id: 0, x: 0 }]);
    scene3D.apply(convertGroundTruthToSceneUpdate(ctx, frame2, event3D));
    sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, frame2, eventImage));

    // Both panels must drop the departed object — no stale box in either.
    expect(scene3D.has("moving_object_1384")).toBe(false);
    expect(sceneImage.has("moving_object_1384")).toBe(false);
  });

  it("removes a departed object from BOTH panels when both are at default settings", () => {
    // Two unconfigured panels both have `topicConfig === undefined`, so both fall
    // back to the shared `DEFAULT_CONFIG` key and share one consumer state. In
    // Lichtblick both panels receive the *same* message object, which the
    // converter relies on to compute deletions once and reuse them.
    const ctx = createGroundTruthContext();
    const scene3D = new PanelScene();
    const sceneImage = new PanelScene();
    const defaultEvent = () => ({ topicConfig: undefined }) as never;

    const frame1 = groundTruth([
      { id: 0, x: 0 },
      { id: 1384, x: 50 },
    ]);
    scene3D.apply(convertGroundTruthToSceneUpdate(ctx, frame1, defaultEvent()));
    sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, frame1, defaultEvent()));
    expect(scene3D.has("moving_object_1384")).toBe(true);
    expect(sceneImage.has("moving_object_1384")).toBe(true);

    const frame2 = groundTruth([{ id: 0, x: 0 }]);
    scene3D.apply(convertGroundTruthToSceneUpdate(ctx, frame2, defaultEvent()));
    sceneImage.apply(convertGroundTruthToSceneUpdate(ctx, frame2, defaultEvent()));
    expect(scene3D.has("moving_object_1384")).toBe(false);
    expect(sceneImage.has("moving_object_1384")).toBe(false);
  });
});
