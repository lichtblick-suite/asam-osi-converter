import {
  TrafficSign_MainSign_Classification_Type as MAIN_TYPE,
  TrafficSign_MainSign_Classification,
  TrafficSign_SupplementarySign_Classification,
  TrafficSignValue,
} from "@lichtblick/asam-osi-types";
import { DeepRequired } from "ts-essentials";

interface TrafficSignCustomization {
  getText: (
    classification:
      | TrafficSign_MainSign_Classification
      | TrafficSign_SupplementarySign_Classification,
  ) => string;
  getOptions: (
    classification?:
      | TrafficSign_MainSign_Classification
      | TrafficSign_SupplementarySign_Classification,
  ) => TrafficSignCustomizationOptions;
}

interface TrafficSignCustomizationOptions {
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  fillStyle?: string;
  x?: number;
  y?: number;
  x_offset?: number;
  y_offset?: number;
  maxW?: number;
}

export const drawTrafficSignText = (
  imageElement: HTMLImageElement,
  text: string,
  options: TrafficSignCustomizationOptions,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;

  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(imageElement, 0, 0);
  ctx.font = options.font ?? `bold ${canvas.width * 0.6}px sans-serif`;
  ctx.textAlign = options.textAlign ?? "center";
  ctx.textBaseline = options.textBaseline ?? "middle";
  ctx.fillStyle = options.fillStyle ?? "black";

  const x = (options.x ?? canvas.width * 0.5) + (options.x_offset ?? 0);
  const y = (options.y ?? canvas.height * 0.5) + (options.y_offset ?? 0);
  const maxW = options.maxW ?? canvas.width * 0.6;

  ctx.fillText(text, x, y, maxW);

  const result = canvas.toDataURL();
  canvas.remove();

  return result;
};

const getValueAsText = (
  classification:
    | TrafficSign_MainSign_Classification
    | TrafficSign_SupplementarySign_Classification,
): string => {
  const tsValue = classification.value as DeepRequired<TrafficSignValue>;
  return tsValue.value.toString();
};

const textures = {
  main: new Map<number, TrafficSignCustomization>([
    [
      MAIN_TYPE.SPEED_LIMIT_BEGIN,
      {
        getText: getValueAsText,
        getOptions: () => ({ y_offset: 8 }),
      },
    ],
    [
      MAIN_TYPE.SPEED_LIMIT_END,
      {
        getText: getValueAsText,
        getOptions: () => ({ y_offset: 8 }),
      },
    ],
    [
      MAIN_TYPE.SPEED_LIMIT_ZONE_BEGIN,
      {
        getText: getValueAsText,
        getOptions: () => ({ font: "bold 74px sans-serif", y: 86, maxW: 74 }),
      },
    ],
    [
      MAIN_TYPE.SPEED_LIMIT_ZONE_END,
      {
        getText: getValueAsText,
        getOptions: () => ({ font: "bold 74px sans-serif", y: 86, maxW: 74 }),
      },
    ],
    [
      MAIN_TYPE.MINIMUM_SPEED_BEGIN,
      {
        getText: getValueAsText,
        getOptions: () => ({ fillStyle: "white", y_offset: 8 }),
      },
    ],
    [
      MAIN_TYPE.MINIMUM_SPEED_END,
      {
        getText: getValueAsText,
        getOptions: () => ({ fillStyle: "white", y_offset: 8 }),
      },
    ],
    [
      MAIN_TYPE.ADVISORY_SPEED_LIMIT_BEGIN,
      {
        getText: getValueAsText,
        getOptions: () => ({ fillStyle: "white" }),
      },
    ],
    [
      MAIN_TYPE.ADVISORY_SPEED_LIMIT_END,
      {
        getText: getValueAsText,
        getOptions: () => ({ fillStyle: "white" }),
      },
    ],
  ]),
  supplementary: new Map<number, TrafficSignCustomization>(),
};

export default textures;
