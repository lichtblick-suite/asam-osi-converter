import { NumericType } from "@foxglove/schemas";
import type { PointCloud } from "@foxglove/schemas";
import type { SensorData } from "@lichtblick/asam-osi-types";
import type { MessageEvent } from "@lichtblick/suite";
import { pointRotationByQuaternion } from "@utils/math";

import {
  OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
  sensorDataRadarFrameId,
} from "@/config/frameTransformNames";
import { convertSensorDataToFrameTransforms } from "@/converters/sensorData/frameTransformConverter";
import { convertSensorDataToPointCloud } from "@/converters/sensorData/radarConverter";

const timestamp = { seconds: 3, nanos: 50 };
const mounting = {
  position: { x: 0, y: 0, z: 0 },
  orientation: { roll: 0, pitch: 0, yaw: 0 },
};

function pointValues(cloud: PointCloud | undefined): number[] {
  expect(cloud).toBeDefined();
  const data = cloud!.data;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return Array.from({ length: data.byteLength / 4 }, (_, index) =>
    view.getFloat32(index * 4, true),
  );
}

describe("SensorData radar PointCloud conversion", () => {
  it("converts spherical positions and preserves radar attributes in little-endian FLOAT32 fields", () => {
    const result = convertSensorDataToPointCloud({
      timestamp,
      feature_data: {
        radar_sensor: [
          {
            header: { mounting_position: mounting },
            detection: [
              {
                position: { distance: 10, azimuth: Math.PI / 2, elevation: Math.PI / 6 },
                radial_velocity: -2,
                rcs: -5,
                snr: 12,
              },
            ],
          },
        ],
      },
    });

    expect(result).toMatchObject({
      timestamp: { sec: 3, nsec: 50 },
      frame_id: sensorDataRadarFrameId(undefined),
      pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } },
      point_stride: 24,
      fields: [
        { name: "x", offset: 0, type: NumericType.FLOAT32 },
        { name: "y", offset: 4, type: NumericType.FLOAT32 },
        { name: "z", offset: 8, type: NumericType.FLOAT32 },
        { name: "radial_velocity", offset: 12, type: NumericType.FLOAT32 },
        { name: "rcs", offset: 16, type: NumericType.FLOAT32 },
        { name: "snr", offset: 20, type: NumericType.FLOAT32 },
      ],
    });
    const values = pointValues(result);
    expect(values[0]).toBeCloseTo(0);
    expect(values[1]).toBeCloseTo(10 * Math.cos(Math.PI / 6));
    expect(values.slice(2)).toEqual([5, -2, -5, 12]);
  });

  it("displays radar 0 in its own frame and reports additional radars", () => {
    const emitAlert = jest.fn();
    const result = convertSensorDataToPointCloud(
      {
        timestamp,
        mounting_position: { ...mounting, position: { x: 100, y: 100, z: 100 } },
        feature_data: {
          radar_sensor: [
            {
              header: { mounting_position: mounting },
              detection: [{ position: { distance: 2 } }],
            },
            {
              header: {
                mounting_position: {
                  position: { x: 1, y: 2, z: 3 },
                  orientation: { yaw: Math.PI / 2 },
                },
              },
              detection: [{ position: { distance: 4 } }],
            },
          ],
        },
      },
      undefined,
      undefined,
      { emitAlert },
    );

    expect(pointValues(result)).toEqual([2, 0, 0, 0, 0, 0]);
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
      "sensordata-pointcloud-multiple-radars",
    );
  });

  it.each([
    {},
    { feature_data: { radar_sensor: [] } },
    {
      feature_data: { radar_sensor: [{ detection: [] }] },
    },
  ])("returns an empty cloud when no radar detections remain", (input) => {
    expect(convertSensorDataToPointCloud({ timestamp, ...input })?.data).toEqual(new Uint8Array());
  });

  it("skips invalid positions and defaults omitted angles and radar attributes to zero", () => {
    const result = convertSensorDataToPointCloud({
      timestamp,
      feature_data: {
        radar_sensor: [
          {
            header: { mounting_position: mounting },
            detection: [
              {},
              { position: { distance: -1 } },
              { position: { distance: NaN } },
              { position: { distance: 1, azimuth: Infinity } },
              { position: { distance: 1, elevation: NaN } },
              { position: { distance: 3 }, rcs: NaN, snr: Infinity },
            ],
          },
        ],
      },
    });

    expect(pointValues(result)).toEqual([3, 0, 0, 0, 0, 0]);
  });

  it("keeps points in sensor coordinates and warns when their mounting transform is unavailable", () => {
    const emitAlert = jest.fn();
    const message: SensorData = {
      timestamp,
      feature_data: { radar_sensor: [{ detection: [{ position: { distance: 10 } }] }] },
    };
    const result = convertSensorDataToPointCloud(message);
    const transforms = convertSensorDataToFrameTransforms(message, undefined, undefined, {
      emitAlert,
    });

    expect(pointValues(result)).toEqual([10, 0, 0, 0, 0, 0]);
    expect(transforms.transforms).toEqual([]);
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensordata-frametransforms-missing-radar-mounting-position-0",
    );
  });

  it("accepts timestamps normalized by Lichtblick", () => {
    const message = { timestamp: { sec: 4, nsec: 5 } } as unknown as SensorData;
    expect(convertSensorDataToPointCloud(message)?.timestamp).toEqual({ sec: 4, nsec: 5 });
  });

  it("warns and returns undefined if the timestamp is missing", () => {
    const emitAlert = jest.fn();
    expect(convertSensorDataToPointCloud({}, undefined, undefined, { emitAlert })).toBeUndefined();
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensordata-pointcloud-missing-timestamp",
    );
  });

  it("exposes each mounting pose and applies the cloud's transform exactly once", () => {
    const message: SensorData = {
      timestamp,
      mounting_position: mounting,
      feature_data: {
        radar_sensor: [
          {
            header: {
              mounting_position: {
                position: { x: 1, y: 2, z: 3 },
                orientation: { yaw: Math.PI / 2 },
              },
            },
            detection: [{ position: { distance: 4 } }],
          },
          { header: { mounting_position: mounting } },
        ],
      },
    };
    const event: MessageEvent<SensorData> = {
      topic: "front_radar",
      schemaName: "osi3.SensorData",
      receiveTime: { sec: 3, nsec: 50 },
      message,
      sizeInBytes: 0,
    };
    const cloud = convertSensorDataToPointCloud(message, event);
    const frames = convertSensorDataToFrameTransforms(message, event).transforms;
    const radarFrame = frames.find((frame) => frame.child_frame_id === cloud?.frame_id)!;

    expect(pointValues(cloud)).toEqual([4, 0, 0, 0, 0, 0]);
    expect(radarFrame).toMatchObject({
      timestamp: { sec: 3, nsec: 50 },
      parent_frame_id: OSI_EGO_VEHICLE_REAR_AXLE_FRAME,
      child_frame_id: "front_radar/radar_0/mounting_position",
      translation: { x: 1, y: 2, z: 3 },
    });
    const rotated = pointRotationByQuaternion({ x: 4, y: 0, z: 0 }, radarFrame.rotation);
    expect({
      x: rotated.x + radarFrame.translation.x,
      y: rotated.y + radarFrame.translation.y,
      z: rotated.z + radarFrame.translation.z,
    }).toEqual({ x: 1, y: 6, z: 3 });
    expect(frames).toHaveLength(3);
    expect(frames[2]?.child_frame_id).toBe("front_radar/radar_1/mounting_position");
    expect(sensorDataRadarFrameId("other_topic")).not.toBe(cloud?.frame_id);
  });

  it("publishes radar transforms without a virtual mounting pose and with a normalized timestamp", () => {
    const message = {
      timestamp: { sec: 4, nsec: 5 },
      feature_data: { radar_sensor: [{ header: { mounting_position: mounting } }] },
    } as unknown as SensorData;
    expect(convertSensorDataToFrameTransforms(message).transforms).toEqual([
      expect.objectContaining({
        timestamp: { sec: 4, nsec: 5 },
        child_frame_id: sensorDataRadarFrameId(undefined),
      }),
    ]);
  });
});
