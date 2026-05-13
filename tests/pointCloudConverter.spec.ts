/**
 * Tests for the SensorData → foxglove.PointCloud converter.
 */
import { NumericType } from "@foxglove/schemas";
import type { PointCloud } from "@foxglove/schemas";
import {
  SensorData,
  RadarDetection,
  LidarDetection,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

jest.mock("@features/trafficsigns", () => ({ preloadDynamicTextures: jest.fn() }));
jest.mock("@features/trafficlights", () => ({}));

import {
  sphericalToCartesian,
  buildPointCloudFromSensorData,
  convertSensorDataToPointCloud,
} from "@converters";

// ── Helpers ───────────────────────────────────────────────────────────────

function makeSensorData(
  radarDetections: RadarDetection[] = [],
  lidarDetections: LidarDetection[] = [],
): DeepRequired<SensorData> {
  return {
    timestamp: { seconds: 100, nanos: 0 },
    sensor_id: { value: 1 },
    mounting_position: {
      position: { x: 1, y: 0, z: 0.5 },
      orientation: { roll: 0, pitch: 0, yaw: 0 },
    },
    feature_data: {
      radar_sensor: radarDetections.length > 0
        ? [{ header: { measurement_time: { seconds: 100, nanos: 0 }, mounting_position: { position: { x: 0, y: 0, z: 0 }, orientation: { roll: 0, pitch: 0, yaw: 0 } }, cycle_counter: 0, data_qualifier: 0, number_of_valid_detections: radarDetections.length, event_data_qualifier: 0, extended_qualifier: 0 }, detection: radarDetections }]
        : [],
      lidar_sensor: lidarDetections.length > 0
        ? [{ header: { measurement_time: { seconds: 100, nanos: 0 }, mounting_position: { position: { x: 0, y: 0, z: 0 }, orientation: { roll: 0, pitch: 0, yaw: 0 } }, cycle_counter: 0, data_qualifier: 0, number_of_valid_detections: lidarDetections.length, event_data_qualifier: 0, extended_qualifier: 0 }, detection: lidarDetections }]
        : [],
      ultrasonic_sensor: [],
      camera_sensor: [],
    },
    lane_boundary: [],
    version: { version_major: 3, version_minor: 8, version_patch: 0 },
    sensor_view: [],
  } as unknown as DeepRequired<SensorData>;
}

// ── sphericalToCartesian ──────────────────────────────────────────────────

describe("sphericalToCartesian", () => {
  it("converts point on x-axis (az=0, el=0)", () => {
    const result = sphericalToCartesian({ distance: 10, azimuth: 0, elevation: 0 } as any);
    expect(result.x).toBeCloseTo(10, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("converts point on y-axis (az=π/2, el=0)", () => {
    const result = sphericalToCartesian({ distance: 10, azimuth: Math.PI / 2, elevation: 0 } as any);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(10, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("converts point straight up (az=0, el=π/2)", () => {
    const result = sphericalToCartesian({ distance: 5, azimuth: 0, elevation: Math.PI / 2 } as any);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(5, 5);
  });

  it("handles diagonal point", () => {
    // distance=10, az=π/4 (45°), el=π/6 (30°)
    const result = sphericalToCartesian({ distance: 10, azimuth: Math.PI / 4, elevation: Math.PI / 6 } as any);
    const cosEl = Math.cos(Math.PI / 6);
    expect(result.x).toBeCloseTo(10 * cosEl * Math.cos(Math.PI / 4), 5);
    expect(result.y).toBeCloseTo(10 * cosEl * Math.sin(Math.PI / 4), 5);
    expect(result.z).toBeCloseTo(10 * Math.sin(Math.PI / 6), 5);
  });
});

// ── buildPointCloudFromSensorData ─────────────────────────────────────────

describe("buildPointCloudFromSensorData", () => {
  it("returns undefined for empty feature data", () => {
    const sd = makeSensorData();
    expect(buildPointCloudFromSensorData(sd)).toBeUndefined();
  });

  it("returns undefined when detections have no position", () => {
    const sd = makeSensorData([{ snr: 10 } as RadarDetection]);
    expect(buildPointCloudFromSensorData(sd)).toBeUndefined();
  });

  it("returns undefined when distance is 0", () => {
    const sd = makeSensorData([{
      position: { distance: 0, azimuth: 0, elevation: 0 },
      snr: 10,
    } as RadarDetection]);
    expect(buildPointCloudFromSensorData(sd)).toBeUndefined();
  });

  it("builds point cloud from radar detections", () => {
    const detections: RadarDetection[] = [
      { position: { distance: 10, azimuth: 0, elevation: 0 }, snr: 20, rcs: 5 },
      { position: { distance: 15, azimuth: 0.1, elevation: 0.05 }, snr: 30, rcs: 8 },
    ];
    const result = buildPointCloudFromSensorData(makeSensorData(detections));

    expect(result).toBeDefined();
    const pc = result as PointCloud;
    expect(pc.frame_id).toBe("virtual_mounting_position");
    expect(pc.point_stride).toBe(16); // 4 × float32
    expect(pc.fields).toHaveLength(4);
    expect(pc.fields[0]!.name).toBe("x");
    expect(pc.fields[3]!.name).toBe("intensity");
    expect(pc.data.byteLength).toBe(2 * 16); // 2 points × 16 bytes

    // Verify first point (distance=10, az=0, el=0 → x=10, y=0, z=0)
    const view = new DataView(pc.data.buffer);
    expect(view.getFloat32(0, true)).toBeCloseTo(10, 3);
    expect(view.getFloat32(4, true)).toBeCloseTo(0, 3);
    expect(view.getFloat32(8, true)).toBeCloseTo(0, 3);
  });

  it("builds point cloud from lidar detections", () => {
    const detections: LidarDetection[] = [
      { position: { distance: 20, azimuth: 0, elevation: 0 }, intensity: 80 },
    ];
    const result = buildPointCloudFromSensorData(makeSensorData([], detections));

    expect(result).toBeDefined();
    const pc = result as PointCloud;
    expect(pc.data.byteLength).toBe(16);

    const view = new DataView(pc.data.buffer);
    expect(view.getFloat32(0, true)).toBeCloseTo(20, 3); // x
    expect(view.getFloat32(12, true)).toBeCloseTo(0.8, 3); // intensity: 80/100
  });

  it("merges radar and lidar detections", () => {
    const radar: RadarDetection[] = [
      { position: { distance: 10, azimuth: 0, elevation: 0 }, snr: 20 },
    ];
    const lidar: LidarDetection[] = [
      { position: { distance: 20, azimuth: 0, elevation: 0 }, intensity: 50 },
    ];
    const result = buildPointCloudFromSensorData(makeSensorData(radar, lidar));

    expect(result).toBeDefined();
    const pc = result as PointCloud;
    expect(pc.data.byteLength).toBe(2 * 16);
  });

  it("skips detections with missing position and keeps valid ones", () => {
    const detections: RadarDetection[] = [
      { snr: 10 } as RadarDetection, // no position → skip
      { position: { distance: 10, azimuth: 0, elevation: 0 }, snr: 20 }, // valid
    ];
    const result = buildPointCloudFromSensorData(makeSensorData(detections));

    expect(result).toBeDefined();
    const pc = result as PointCloud;
    expect(pc.data.byteLength).toBe(16); // only 1 valid point
  });

  it("uses correct NumericType for fields", () => {
    const detections: RadarDetection[] = [
      { position: { distance: 10, azimuth: 0, elevation: 0 }, snr: 20 },
    ];
    const result = buildPointCloudFromSensorData(makeSensorData(detections));
    const pc = result as PointCloud;

    for (const field of pc.fields) {
      expect(field.type).toBe(NumericType.FLOAT32);
    }
  });
});

// ── convertSensorDataToPointCloud (top-level wrapper) ─────────────────────

describe("convertSensorDataToPointCloud", () => {
  it("returns undefined for SensorData with no detections", () => {
    const sd = makeSensorData();
    expect(convertSensorDataToPointCloud(sd as unknown as SensorData)).toBeUndefined();
  });

  it("returns PointCloud for valid radar data", () => {
    const sd = makeSensorData([
      { position: { distance: 15, azimuth: 0.2, elevation: 0.1 }, snr: 25, rcs: 10 },
    ]);
    const result = convertSensorDataToPointCloud(sd as unknown as SensorData);
    expect(result).toBeDefined();
    expect(result!.frame_id).toBe("virtual_mounting_position");
    expect(result!.data.byteLength).toBe(16);
  });

  it("does not throw on malformed input", () => {
    const bad = { timestamp: { seconds: 0, nanos: 0 } } as unknown as SensorData;
    expect(() => convertSensorDataToPointCloud(bad)).not.toThrow();
  });
});
