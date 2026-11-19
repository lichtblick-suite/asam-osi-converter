import {
  PREFIX_DETECTED_LANE_BOUNDARIES,
  PREFIX_DETECTED_MOVING_OBJECT,
} from "@/config/entityPrefixes";
import { SceneEntityDeletionType } from "@foxglove/schemas";
import { OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME } from "@/config/frameTransformNames";
import {
  convertSensorDataToSceneUpdate,
  registerSensorDataConverter,
} from "@/converters/sensorData/sceneUpdateConverter";

const timestamp = { seconds: 12, nanos: 34 };
const detectedObject = {
  header: { tracking_id: { value: 42 }, measurement_state: 2 },
  base: {
    position: { x: 10, y: -2, z: 1 },
    orientation: { roll: 0, pitch: 0, yaw: Math.PI / 2 },
    dimension: { length: 4, width: 2, height: 1.5 },
  },
};

describe("SensorData detected moving objects", () => {
  it("renders bounding boxes in the sensor frame without requiring lane boundaries", () => {
    const result = convertSensorDataToSceneUpdate({
      timestamp,
      moving_object: [detectedObject],
    });

    expect(result.entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: `${PREFIX_DETECTED_MOVING_OBJECT}_42`,
          timestamp: { sec: 12, nsec: 34 },
          frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
          frame_locked: true,
          metadata: expect.arrayContaining([
            { key: "tracking_id", value: "42" },
            { key: "measurement_state", value: "MEASURED" },
            { key: "position", value: "10, -2, 1" },
            { key: "dimensions", value: "4, 2, 1.5" },
          ]),
          cubes: [
            expect.objectContaining({
              pose: {
                position: { x: 10, y: -2, z: 1 },
                orientation: {
                  x: 0,
                  y: 0,
                  z: expect.closeTo(Math.SQRT1_2),
                  w: expect.closeTo(Math.SQRT1_2),
                },
              },
              size: { x: 4, y: 2, z: 1.5 },
              color: { r: 0, g: 1, b: 1, a: 0.5 },
            }),
          ],
        }),
      ]),
    );
  });

  it("keeps lane boundaries visible alongside multiple detected objects", () => {
    const result = convertSensorDataToSceneUpdate({
      timestamp,
      lane_boundary: [{ boundary_line: [{ position: { x: 1, y: 2, z: 3 } }] }],
      moving_object: [detectedObject, { ...detectedObject, header: { tracking_id: { value: 43 } } }],
    });

    expect(
      result.entities?.find((entity) => entity?.id === PREFIX_DETECTED_LANE_BOUNDARIES),
    ).toMatchObject({ lines: [{ points: [{ x: 1, y: 2, z: 3 }] }] });
    expect(result.entities?.map((entity) => entity?.id)).toEqual(
      expect.arrayContaining([
        `${PREFIX_DETECTED_MOVING_OBJECT}_42`,
        `${PREFIX_DETECTED_MOVING_OBJECT}_43`,
      ]),
    );
    expect(
      result.entities
        ?.filter((entity) => entity?.id?.startsWith(`${PREFIX_DETECTED_MOVING_OBJECT}_`))
        .every((entity) => entity?.cubes?.length === 1),
    ).toBe(true);
  });

  it("emits no moving-object entity when detections disappear", () => {
    const previous = convertSensorDataToSceneUpdate({ timestamp, moving_object: [detectedObject] });
    const current = convertSensorDataToSceneUpdate({ timestamp });
    const previousObject = previous.entities?.find(
      (entity) => entity?.id === `${PREFIX_DETECTED_MOVING_OBJECT}_42`,
    );
    const currentObject = current.entities?.find(
      (entity) => entity?.id === `${PREFIX_DETECTED_MOVING_OBJECT}_42`,
    );

    expect(previousObject?.cubes).toHaveLength(1);
    expect(currentObject).toBeUndefined();
  });

  it("emits a matching-id deletion when a tracked object disappears", () => {
    const converter = registerSensorDataConverter();
    const event = { topic: "sensor_data", schemaName: "osi3.SensorData" } as never;

    converter({ timestamp, moving_object: [detectedObject] }, event);
    const result = converter({ timestamp }, event);

    expect(result.deletions).toEqual([
      expect.objectContaining({
        id: `${PREFIX_DETECTED_MOVING_OBJECT}_42`,
        type: SceneEntityDeletionType.MATCHING_ID,
      }),
    ]);
  });

  it("skips missing geometry and defaults an omitted orientation to zero", () => {
    const { orientation: _orientation, ...base } = detectedObject.base;
    const result = convertSensorDataToSceneUpdate({
      timestamp,
      moving_object: [{}, { base: {} }, { base }],
    });
    const objects = result.entities?.find(
      (entity) => entity?.id === `${PREFIX_DETECTED_MOVING_OBJECT}_2`,
    );

    expect(objects?.cubes).toHaveLength(1);
    expect(objects?.cubes?.[0]?.pose?.orientation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
  });
});
