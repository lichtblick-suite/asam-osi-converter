import { NumericType } from "@foxglove/schemas";
import { SensorView } from "@lichtblick/asam-osi-types";
import { MessageEvent } from "@lichtblick/suite";

import { lidarFrameId } from "../src/converters/sensorView/imageConverter";
import { convertSensorViewToPointCloud } from "../src/converters/sensorView/lidarConverter";

function event(inputMessage: SensorView): MessageEvent<SensorView> {
  return {
    topic: "sensor_view/lidar_0",
    schemaName: "osi3.SensorView",
    receiveTime: { sec: 1, nsec: 0 },
    message: inputMessage,
    sizeInBytes: 0,
  };
}

describe("SensorView LiDAR conversion", () => {
  it("converts OSI directions and round-trip time of flight to PointCloud", () => {
    const input: SensorView = {
      timestamp: { seconds: 3, nanos: 500_000_000 },
      lidar_sensor_view: [
        {
          view_configuration: {
            directions: [
              { x: 1, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
            ],
          },
          reflection: [
            {
              time_of_flight: (2 * 10) / 299_792_458,
              signal_strength: 0.75,
            },
            {
              time_of_flight: (2 * 4) / 299_792_458,
              signal_strength: 0.25,
            },
          ],
        },
      ],
    };

    const result = convertSensorViewToPointCloud(input, event(input));

    expect(result?.timestamp).toEqual({ sec: 3, nsec: 500_000_000 });
    expect(result?.frame_id).toBe(lidarFrameId("sensor_view/lidar_0"));
    expect(result?.point_stride).toBe(16);
    expect(result?.fields).toEqual([
      { name: "x", offset: 0, type: NumericType.FLOAT32 },
      { name: "y", offset: 4, type: NumericType.FLOAT32 },
      { name: "z", offset: 8, type: NumericType.FLOAT32 },
      { name: "intensity", offset: 12, type: NumericType.FLOAT32 },
    ]);

    const view = new DataView(
      result!.data.buffer,
      result!.data.byteOffset,
      result!.data.byteLength,
    );
    expect(view.getFloat32(0, true)).toBeCloseTo(10);
    expect(view.getFloat32(4, true)).toBeCloseTo(0);
    expect(view.getFloat32(12, true)).toBeCloseTo(0.75);
    expect(view.getFloat32(16, true)).toBeCloseTo(0);
    expect(view.getFloat32(20, true)).toBeCloseTo(4);
    expect(view.getFloat32(28, true)).toBeCloseTo(0.25);
  });

  it("returns an empty point cloud for an empty LiDAR scan", () => {
    const input: SensorView = {
      timestamp: { seconds: 3, nanos: 0 },
      lidar_sensor_view: [
        {
          view_configuration: { directions: [] },
          reflection: [],
        },
      ],
    };

    const result = convertSensorViewToPointCloud(input, event(input));

    expect(result?.data).toEqual(new Uint8Array());
  });
});
