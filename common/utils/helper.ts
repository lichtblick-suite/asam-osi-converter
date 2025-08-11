import { Color } from "@foxglove/schemas";

export function Key(...key_array: unknown[]): string {
  return key_array.join(":");
}

type RGB = { r: number; g: number; b: number };

const COLOR_MAP = new Map<string, RGB>([
  ["r", { r: 1, g: 0, b: 0 }], // red
  ["g", { r: 0, g: 1, b: 0 }], // green
  ["b", { r: 0, g: 0, b: 1 }], // blue
  ["c", { r: 0, g: 1, b: 1 }], // cyan
  ["m", { r: 1, g: 0, b: 1 }], // magenta
  ["y", { r: 1, g: 1, b: 0 }], // yellow
  ["w", { r: 1, g: 1, b: 1 }], // white
  ["k", { r: 0, g: 0, b: 0 }], // black
  ["red", { r: 1, g: 0, b: 0 }], // red
  ["green", { r: 0, g: 1, b: 0 }], // green
  ["blue", { r: 0, g: 0, b: 1 }], // blue
  ["cyan", { r: 0, g: 1, b: 1 }], // cyan
  ["magenta", { r: 1, g: 0, b: 1 }], // magenta
  ["yellow", { r: 1, g: 1, b: 0 }], // yellow
  ["white", { r: 1, g: 1, b: 1 }], // white
  ["black", { r: 0, g: 0, b: 0 }], // black
  ["gray", { r: 0.5, g: 0.5, b: 0.5 }], // gray
  ["orange", { r: 1, g: 0.5, b: 0 }], // orange
  ["red_orange", { r: 1, g: 0.3, b: 0 }], // red_orange
]);

export function ColorCode(color: string, alpha = 1.0): Color {
  const c = COLOR_MAP.get(color) ?? { r: 1, g: 1, b: 1 };
  return { r: c.r, g: c.g, b: c.b, a: alpha };
}

export function convertDataURIToBinary(dataURI: string): Uint8Array {
  return Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, "")), (v) => v.charCodeAt(0));
}

export type ColorCodeName = { code: Color; name: string };

export function convertPathToFileUrl(inputPath: string): string {
  let normalizedPath = inputPath;

  const isWindows = /[a-zA-Z]:\\|\\{2}/.test(inputPath);

  if (isWindows) {
    // Convert '\' to '/'
    normalizedPath = normalizedPath.replace(/\\/g, "/");

    if (/^\/\/[^/]+/.test(normalizedPath)) {
      return "file:" + encodeURI(normalizedPath);
    }

    if (/^[a-zA-Z]:\//.test(normalizedPath)) {
      return "file:///" + encodeURI(normalizedPath);
    }

    return "";
  }

  if (normalizedPath.startsWith("/")) {
    return "file://" + encodeURI(normalizedPath);
  }

  return "";
}
