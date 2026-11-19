import {
  CameraSensorViewConfiguration_ChannelFormat as ChannelFormat,
  CameraSensorViewConfiguration_PixelOrder as PixelOrder,
  SensorView,
} from "@lichtblick/asam-osi-types";
import { MessageConverterContext, MessageEvent } from "@lichtblick/suite";

import {
  cameraOpticalFrameId,
  convertSensorViewToCameraCalibration,
  convertSensorViewToRawImage,
} from "../src/converters/sensorView/imageConverter";

function event(inputMessage: SensorView, topic = "sensor_view/camera_0"): MessageEvent<SensorView> {
  return {
    topic,
    schemaName: "osi3.SensorView",
    receiveTime: { sec: 1, nsec: 0 },
    message: inputMessage,
    sizeInBytes: 0,
  };
}

function message(overrides?: Partial<SensorView>): SensorView {
  return {
    timestamp: { seconds: 4, nanos: 250_000_000 },
    camera_sensor_view: [
      {
        view_configuration: {
          number_of_pixels_horizontal: 2,
          number_of_pixels_vertical: 1,
          field_of_view_horizontal: Math.PI / 2,
          field_of_view_vertical: 2 * Math.atan(0.5),
          channel_format: [ChannelFormat.RGB_U8_LIN],
          pixel_order: PixelOrder.DEFAULT,
        },
        image_data: new Uint8Array([1, 2, 3, 10, 20, 30]),
      },
    ],
    ...overrides,
  };
}

function mockContext(): { context: MessageConverterContext; emitAlert: jest.Mock } {
  const emitAlert = jest.fn();
  return { context: { emitAlert }, emitAlert };
}

describe("SensorView image conversion", () => {
  it("converts RGB_U8_LIN to foxglove.RawImage", () => {
    const input = message();
    const result = convertSensorViewToRawImage(input, event(input));

    expect(result).toEqual({
      timestamp: { sec: 4, nsec: 250_000_000 },
      frame_id: "osi_sensor_view_camera_0_optical",
      width: 2,
      height: 1,
      encoding: "rgb8",
      step: 6,
      data: new Uint8Array([1, 2, 3, 10, 20, 30]),
    });
  });

  it("accepts Lichtblick's normalized protobuf timestamp", () => {
    const input = message({
      timestamp: { sec: 7, nsec: 125_000_000 } as unknown as SensorView["timestamp"],
    });

    const image = convertSensorViewToRawImage(input, event(input));
    const calibration = convertSensorViewToCameraCalibration(input, event(input));

    expect(image?.timestamp).toEqual({ sec: 7, nsec: 125_000_000 });
    expect(calibration?.timestamp).toEqual({ sec: 7, nsec: 125_000_000 });
  });

  it("accepts OSI timestamp seconds decoded as bigint", () => {
    const input = message({
      timestamp: { seconds: 7n, nanos: 125_000_000 } as unknown as SensorView["timestamp"],
    });

    const image = convertSensorViewToRawImage(input, event(input));
    const calibration = convertSensorViewToCameraCalibration(input, event(input));

    expect(image?.timestamp).toEqual({ sec: 7, nsec: 125_000_000 });
    expect(calibration?.timestamp).toEqual({ sec: 7, nsec: 125_000_000 });
  });

  it("normalizes mirrored OSI pixel order", () => {
    const input = message({
      camera_sensor_view: [
        {
          view_configuration: {
            number_of_pixels_horizontal: 2,
            number_of_pixels_vertical: 1,
            channel_format: [ChannelFormat.RGB_U8_LIN],
            pixel_order: PixelOrder.RIGHT_LEFT_TOP_BOTTOM,
          },
          image_data: new Uint8Array([1, 2, 3, 10, 20, 30]),
        },
      ],
    });

    const result = convertSensorViewToRawImage(input, event(input));

    expect(result?.data).toEqual(new Uint8Array([10, 20, 30, 1, 2, 3]));
  });

  it("rejects a buffer that does not match the configured layout", () => {
    const { context, emitAlert } = mockContext();
    const input = message({
      camera_sensor_view: [
        {
          view_configuration: {
            number_of_pixels_horizontal: 2,
            number_of_pixels_vertical: 1,
            channel_format: [ChannelFormat.RGB_U8_LIN],
          },
          image_data: new Uint8Array([1, 2, 3]),
        },
      ],
    });

    const result = convertSensorViewToRawImage(input, event(input), undefined, context);

    expect(result).toBeUndefined();
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensorview-raw-image-invalid-data-length",
    );
  });

  it("derives pinhole camera calibration from resolution and FOV", () => {
    const input = message();
    const result = convertSensorViewToCameraCalibration(input, event(input));

    expect(result?.frame_id).toBe(cameraOpticalFrameId("sensor_view/camera_0"));
    expect(result?.distortion_model).toBe("plumb_bob");
    expect(result?.D).toEqual([]);
    expect(result?.K[0]).toBeCloseTo(1);
    expect(result?.K[2]).toBe(1);
    expect(result?.K[4]).toBeCloseTo(1);
    expect(result?.K[5]).toBe(0.5);
    expect(result?.R).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(result?.P[0]).toBeCloseTo(1);
    expect(result?.P[2]).toBe(1);
    expect(result?.P[5]).toBeCloseTo(1);
    expect(result?.P[6]).toBe(0.5);
  });

  it("returns undefined calibration when no FOV is available", () => {
    const { context, emitAlert } = mockContext();
    const input = message({
      camera_sensor_view: [
        {
          view_configuration: {
            number_of_pixels_horizontal: 2,
            number_of_pixels_vertical: 1,
            channel_format: [ChannelFormat.RGB_U8_LIN],
          },
          image_data: new Uint8Array([1, 2, 3, 10, 20, 30]),
        },
      ],
    });

    const result = convertSensorViewToCameraCalibration(input, event(input), undefined, context);

    expect(result).toBeUndefined();
    expect(emitAlert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
      "sensorview-camera-calibration-invalid-field-of-view",
    );
  });
});
