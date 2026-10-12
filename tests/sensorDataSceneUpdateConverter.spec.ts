import {
  PREFIX_DETECTED_LANE_BOUNDARIES,
  PREFIX_DETECTED_MOVING_OBJECTS,
} from "@/config/entityPrefixes";
import { OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME } from "@/config/frameTransformNames";
import { convertSensorDataToSceneUpdate } from "@/converters/sensorData/sceneUpdateConverter";

const timestamp = { seconds: 12, nanos: 34 };
const detectedObject = {
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
          id: PREFIX_DETECTED_MOVING_OBJECTS,
          timestamp: { sec: 12, nsec: 34 },
          frame_id: OSI_SENSORDATA_VIRTUAL_MOUNTING_POSITION_FRAME,
          frame_locked: true,
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
      moving_object: [detectedObject, detectedObject],
    });

    expect(
      result.entities?.find((entity) => entity?.id === PREFIX_DETECTED_LANE_BOUNDARIES),
    ).toMatchObject({ lines: [{ points: [{ x: 1, y: 2, z: 3 }] }] });
    expect(
      result.entities?.find((entity) => entity?.id === PREFIX_DETECTED_MOVING_OBJECTS)?.cubes,
    ).toHaveLength(2);
  });

  it("replaces the previous boxes with an empty set when detections disappear", () => {
    const previous = convertSensorDataToSceneUpdate({ timestamp, moving_object: [detectedObject] });
    const current = convertSensorDataToSceneUpdate({ timestamp });
    const previousObjects = previous.entities?.find(
      (entity) => entity?.id === PREFIX_DETECTED_MOVING_OBJECTS,
    );
    const currentObjects = current.entities?.find(
      (entity) => entity?.id === PREFIX_DETECTED_MOVING_OBJECTS,
    );

    expect(previousObjects?.cubes).toHaveLength(1);
    expect(currentObjects).toMatchObject({ id: previousObjects?.id, cubes: [] });
  });

  it("skips missing geometry and defaults an omitted orientation to zero", () => {
    const { orientation: _orientation, ...base } = detectedObject.base;
    const result = convertSensorDataToSceneUpdate({
      timestamp,
      moving_object: [{}, { base: {} }, { base }],
    });
    const objects = result.entities?.find(
      (entity) => entity?.id === PREFIX_DETECTED_MOVING_OBJECTS,
    );

    expect(objects?.cubes).toHaveLength(1);
    expect(objects?.cubes?.[0]?.pose?.orientation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
  });
});
