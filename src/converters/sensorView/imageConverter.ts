import type { CameraCalibration, RawImage, Time } from "@foxglove/schemas";
import {
  CameraSensorViewConfiguration_ChannelFormat as ChannelFormat,
  CameraSensorViewConfiguration_PixelOrder as PixelOrder,
} from "@lichtblick/asam-osi-types";
import type {
  CameraSensorView,
  CameraSensorViewConfiguration,
  SensorView,
} from "@lichtblick/asam-osi-types";
import type {
  Immutable,
  MessageConverterContext,
  MessageEvent,
  VariableValue,
} from "@lichtblick/suite";

type ImageLayout = {
  encoding: string;
  bytesPerPixel: number;
};

type RuntimeTimestamp = {
  seconds?: number | bigint;
  nanos?: number | bigint;
  sec?: number | bigint;
  nsec?: number | bigint;
};

function finiteNumber(value: number | bigint | undefined): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "bigint") {
    const converted = Number(value);
    return Number.isSafeInteger(converted) ? converted : undefined;
  }
  return undefined;
}

function emitWarning(
  context: MessageConverterContext | undefined,
  alertId: string,
  message: string,
  tip: string,
): void {
  context?.emitAlert({ severity: "warn", message, tip }, alertId);
}

/**
 * Lichtblick normalizes google.protobuf.Timestamp to { sec, nsec } while
 * direct callers and tests may still provide the OSI { seconds, nanos } form.
 */
export function sensorViewTimestamp(message: SensorView): Time | undefined {
  const timestamp = message.timestamp as RuntimeTimestamp | undefined;
  const seconds = finiteNumber(timestamp?.sec ?? timestamp?.seconds);
  const nanos = finiteNumber(timestamp?.nsec ?? timestamp?.nanos);
  if (seconds == undefined || nanos == undefined) {
    return undefined;
  }
  return { sec: seconds, nsec: nanos };
}

function sensorViewTime(
  message: SensorView,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): Time | undefined {
  const timestamp = sensorViewTimestamp(message);
  if (timestamp == undefined) {
    emitWarning(
      context,
      `${alertPrefix}-missing-timestamp`,
      "SensorView camera image has no valid timestamp",
      "Populate SensorView.timestamp before converting camera images.",
    );
    return undefined;
  }
  return timestamp;
}

function selectCameraView(
  message: SensorView,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): CameraSensorView | undefined {
  const views = message.camera_sensor_view ?? [];
  if (views.length === 0) {
    emitWarning(
      context,
      `${alertPrefix}-missing-camera-view`,
      "SensorView has no camera_sensor_view",
      "Populate one CameraSensorView per SensorView topic.",
    );
    return undefined;
  }
  if (views.length > 1) {
    context?.emitAlert(
      {
        severity: "info",
        message: "SensorView contains multiple camera views; displaying the first view",
        tip: "Use one camera view per topic to display every image independently.",
      },
      `${alertPrefix}-multiple-camera-views`,
    );
  }
  return views[0];
}

function cameraConfiguration(
  cameraView: CameraSensorView,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): CameraSensorViewConfiguration | undefined {
  if (cameraView.view_configuration == undefined) {
    emitWarning(
      context,
      `${alertPrefix}-missing-configuration`,
      "CameraSensorView has no view_configuration",
      "Image dimensions, format, and field of view must be provided.",
    );
    return undefined;
  }
  return cameraView.view_configuration;
}

function imageDimensions(
  configuration: CameraSensorViewConfiguration,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): { width: number; height: number } | undefined {
  const width = configuration.number_of_pixels_horizontal;
  const height = configuration.number_of_pixels_vertical;
  if (
    width == undefined ||
    height == undefined ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    emitWarning(
      context,
      `${alertPrefix}-invalid-dimensions`,
      "CameraSensorView has invalid image dimensions",
      "Set positive integer horizontal and vertical pixel counts.",
    );
    return undefined;
  }
  return { width, height };
}

function imageLayout(
  configuration: CameraSensorViewConfiguration,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): ImageLayout | undefined {
  const format = configuration.channel_format?.[0];
  switch (format) {
    case ChannelFormat.MONO_U8_LIN:
      return { encoding: "mono8", bytesPerPixel: 1 };
    case ChannelFormat.MONO_U16_LIN:
      return { encoding: "mono16", bytesPerPixel: 2 };
    case ChannelFormat.MONO_F32_LIN:
      return { encoding: "32FC1", bytesPerPixel: 4 };
    case ChannelFormat.RGB_U8_LIN:
      return { encoding: "rgb8", bytesPerPixel: 3 };
    case ChannelFormat.BAYER_BGGR_U8_LIN:
      return { encoding: "bayer_bggr8", bytesPerPixel: 1 };
    case ChannelFormat.BAYER_RGGB_U8_LIN:
      return { encoding: "bayer_rggb8", bytesPerPixel: 1 };
    case undefined:
    case ChannelFormat.UNKNOWN:
    case ChannelFormat.OTHER:
    case ChannelFormat.MONO_U32_LIN:
    case ChannelFormat.RGB_U16_LIN:
    case ChannelFormat.RGB_U32_LIN:
    case ChannelFormat.RGB_F32_LIN:
    case ChannelFormat.BAYER_BGGR_U16_LIN:
    case ChannelFormat.BAYER_BGGR_U32_LIN:
    case ChannelFormat.BAYER_BGGR_F32_LIN:
    case ChannelFormat.BAYER_RGGB_U16_LIN:
    case ChannelFormat.BAYER_RGGB_U32_LIN:
    case ChannelFormat.BAYER_RGGB_F32_LIN:
    case ChannelFormat.RCCC_U8_LIN:
    case ChannelFormat.RCCC_U16_LIN:
    case ChannelFormat.RCCC_U32_LIN:
    case ChannelFormat.RCCC_F32_LIN:
    case ChannelFormat.RCCB_U8_LIN:
    case ChannelFormat.RCCB_U16_LIN:
    case ChannelFormat.RCCB_U32_LIN:
    case ChannelFormat.RCCB_F32_LIN:
      emitWarning(
        context,
        `${alertPrefix}-unsupported-format`,
        `Unsupported CameraSensorView channel format: ${String(format)}`,
        "Use RGB_U8_LIN, MONO_U8_LIN, MONO_U16_LIN, MONO_F32_LIN, or a supported U8 Bayer format.",
      );
      return undefined;
  }
}

function normalizePixelOrder(
  source: Uint8Array,
  width: number,
  height: number,
  bytesPerPixel: number,
  pixelOrder: PixelOrder | undefined,
  context: MessageConverterContext | undefined,
  alertPrefix: string,
): Uint8Array | undefined {
  const order = pixelOrder ?? PixelOrder.DEFAULT;
  if (order === PixelOrder.DEFAULT) {
    return source;
  }
  if (order === PixelOrder.OTHER) {
    emitWarning(
      context,
      `${alertPrefix}-unsupported-pixel-order`,
      "CameraSensorView uses PIXEL_ORDER_OTHER",
      "Use a standard OSI pixel order or normalize the image before recording.",
    );
    return undefined;
  }

  const mirrorHorizontally = order === PixelOrder.RIGHT_LEFT_TOP_BOTTOM;
  const mirrorVertically = order === PixelOrder.LEFT_RIGHT_BOTTOM_TOP;
  const target = new Uint8Array(source.length);
  for (let targetY = 0; targetY < height; targetY++) {
    const sourceY = mirrorVertically ? height - 1 - targetY : targetY;
    for (let targetX = 0; targetX < width; targetX++) {
      const sourceX = mirrorHorizontally ? width - 1 - targetX : targetX;
      const sourceOffset = (sourceY * width + sourceX) * bytesPerPixel;
      const targetOffset = (targetY * width + targetX) * bytesPerPixel;
      target.set(source.subarray(sourceOffset, sourceOffset + bytesPerPixel), targetOffset);
    }
  }
  return target;
}

export function sensorViewFrameStem(topic: string | undefined): string {
  const normalized = (topic ?? "sensor_view")
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `osi_${normalized || "sensor_view"}`;
}

export function cameraOpticalFrameId(
  topic: string | undefined,
  cameraIndex = 0,
  cameraCount = 1,
): string {
  const cameraSuffix = cameraCount > 1 ? `_camera_${String(cameraIndex)}` : "";
  return `${sensorViewFrameStem(topic)}${cameraSuffix}_optical`;
}

export function cameraMountingFrameId(
  topic: string | undefined,
  cameraIndex = 0,
  cameraCount = 1,
): string {
  const cameraSuffix = cameraCount > 1 ? `_camera_${String(cameraIndex)}` : "";
  return `${sensorViewFrameStem(topic)}${cameraSuffix}_mounting`;
}

export function lidarFrameId(topic: string | undefined, lidarIndex = 0, lidarCount = 1): string {
  const lidarSuffix = lidarCount > 1 ? `_lidar_${String(lidarIndex)}` : "";
  return `${sensorViewFrameStem(topic)}${lidarSuffix}_lidar`;
}

export function convertSensorViewToRawImage(
  message: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): RawImage | undefined {
  const alertPrefix = "sensorview-raw-image";
  const timestamp = sensorViewTime(message, context, alertPrefix);
  const cameraView = selectCameraView(message, context, alertPrefix);
  if (timestamp == undefined || cameraView == undefined) {
    return undefined;
  }

  const configuration = cameraConfiguration(cameraView, context, alertPrefix);
  if (configuration == undefined) {
    return undefined;
  }
  const dimensions = imageDimensions(configuration, context, alertPrefix);
  const layout = imageLayout(configuration, context, alertPrefix);
  if (dimensions == undefined || layout == undefined) {
    return undefined;
  }

  const source = cameraView.image_data;
  if (source == undefined) {
    emitWarning(
      context,
      `${alertPrefix}-missing-data`,
      "CameraSensorView has no image_data",
      "Populate CameraSensorView.image_data with packed raw pixels.",
    );
    return undefined;
  }

  const expectedLength = dimensions.width * dimensions.height * layout.bytesPerPixel;
  if (source.length !== expectedLength) {
    emitWarning(
      context,
      `${alertPrefix}-invalid-data-length`,
      `CameraSensorView image_data has ${String(source.length)} bytes; expected ${String(expectedLength)}`,
      "Ensure image_data matches the configured dimensions and channel format.",
    );
    return undefined;
  }

  const data = normalizePixelOrder(
    source,
    dimensions.width,
    dimensions.height,
    layout.bytesPerPixel,
    configuration.pixel_order,
    context,
    alertPrefix,
  );
  if (data == undefined) {
    return undefined;
  }

  return {
    timestamp,
    frame_id: cameraOpticalFrameId(event.topic, 0, message.camera_sensor_view?.length ?? 1),
    width: dimensions.width,
    height: dimensions.height,
    encoding: layout.encoding,
    step: dimensions.width * layout.bytesPerPixel,
    data,
  };
}

function validFieldOfView(value: number | undefined): value is number {
  return value != undefined && Number.isFinite(value) && value > 0 && value < Math.PI;
}

export function convertSensorViewToCameraCalibration(
  message: SensorView,
  event: Immutable<MessageEvent<SensorView>>,
  _globalVariables?: Readonly<Record<string, VariableValue>>,
  context?: MessageConverterContext,
): CameraCalibration | undefined {
  const alertPrefix = "sensorview-camera-calibration";
  const timestamp = sensorViewTime(message, context, alertPrefix);
  const cameraView = selectCameraView(message, context, alertPrefix);
  if (timestamp == undefined || cameraView == undefined) {
    return undefined;
  }

  const configuration = cameraConfiguration(cameraView, context, alertPrefix);
  if (configuration == undefined) {
    return undefined;
  }
  const dimensions = imageDimensions(configuration, context, alertPrefix);
  if (dimensions == undefined) {
    return undefined;
  }

  const horizontalFov = configuration.field_of_view_horizontal;
  const verticalFov = configuration.field_of_view_vertical;
  if (!validFieldOfView(horizontalFov) && !validFieldOfView(verticalFov)) {
    emitWarning(
      context,
      `${alertPrefix}-invalid-field-of-view`,
      "CameraSensorView has no valid field of view",
      "Provide a horizontal or vertical FOV between 0 and pi radians.",
    );
    return undefined;
  }

  let focalX: number;
  let focalY: number;
  if (validFieldOfView(horizontalFov)) {
    focalX = dimensions.width / (2 * Math.tan(horizontalFov / 2));
  } else {
    focalX = dimensions.height / (2 * Math.tan(verticalFov! / 2));
  }
  if (validFieldOfView(verticalFov)) {
    focalY = dimensions.height / (2 * Math.tan(verticalFov / 2));
  } else {
    focalY = focalX;
  }

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  return {
    timestamp,
    frame_id: cameraOpticalFrameId(event.topic, 0, message.camera_sensor_view?.length ?? 1),
    width: dimensions.width,
    height: dimensions.height,
    distortion_model: "plumb_bob",
    D: [],
    K: [focalX, 0, centerX, 0, focalY, centerY, 0, 0, 1],
    R: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    P: [focalX, 0, centerX, 0, 0, focalY, centerY, 0, 0, 0, 1, 0],
  };
}
