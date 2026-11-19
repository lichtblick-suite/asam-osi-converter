import { _electron as electron, ElectronApplication, expect, Page } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

import { Vec3 } from "../helpers/osiGeometry";

export const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const LICHTBLICK_BIN = process.env.LICHTBLICK_BIN ?? "/opt/Lichtblick/lichtblick";

/** A layout with a single 3D panel looking straight down on `center` (orthographic). */
export function topViewLayout(
  center: Vec3,
  distance: number,
  topics: Record<string, unknown>,
): Record<string, unknown> {
  return {
    configById: {
      "3D!probe": {
        cameraState: {
          perspective: false,
          distance,
          phi: 0.01,
          thetaOffset: 0,
          fovy: 45,
          near: 0.5,
          far: 5000,
          target: [0, 0, 0],
          targetOffset: center,
          targetOrientation: [0, 0, 0, 1],
        },
        followMode: "follow-none",
        followTf: "global",
        scene: {},
        transforms: {},
        layers: {},
        publish: {},
        imageMode: {},
        topics,
      },
    },
    globalVariables: {},
    userNodes: {},
    playbackConfig: { speed: 1 },
    layout: "3D!probe",
  };
}

/**
 * Creates an isolated Lichtblick home directory with the freshly built extension
 * (`yarn build`) and the given layouts installed.
 */
export function createLichtblickHome(layouts: Record<string, unknown>): string {
  const extension = path.join(REPO_ROOT, "dist", "extension.js");
  if (!fs.existsSync(extension)) {
    throw new Error(`${extension} not found, run "yarn build" first`);
  }
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "lichtblick-e2e-"));
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
    publisher: string;
    name: string;
    version: string;
  };
  const extensionDir = path.join(
    home,
    ".lichtblick-suite",
    "extensions",
    `${pkg.publisher}.${pkg.name}-${pkg.version}`.toLowerCase(),
  );
  fs.mkdirSync(path.join(extensionDir, "dist"), { recursive: true });
  fs.copyFileSync(path.join(REPO_ROOT, "package.json"), path.join(extensionDir, "package.json"));
  fs.copyFileSync(extension, path.join(extensionDir, "dist", "extension.js"));
  const layoutDir = path.join(home, ".lichtblick-suite", "layouts");
  fs.mkdirSync(layoutDir, { recursive: true });
  for (const [name, layout] of Object.entries(layouts)) {
    fs.writeFileSync(path.join(layoutDir, `${name}.json`), JSON.stringify(layout));
  }
  return home;
}

/** Launches the Lichtblick desktop app with software rendering, so images are reproducible. */
export async function launchLichtblick(
  home: string,
): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    executablePath: LICHTBLICK_BIN,
    args: [
      `--user-data-dir=${path.join(home, "userdata")}`,
      `--home-dir=${home}`,
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1400, height: 900 }).catch(() => undefined);
  return { app, page };
}

export async function openFile(page: Page, file: string): Promise<void> {
  await page.getByTestId("DataSourceDialog").getByTestId("CloseIcon").click();
  await page.locator("[data-puppeteer-file-upload]").setInputFiles(file);
  await expect(page.getByTestId("PlaybackTime-text")).toBeVisible({ timeout: 60_000 });
}

/** Switches to a layout from the sidebar and plays briefly, so every panel has a message. */
export async function showLayout(page: Page, name: string): Promise<void> {
  if (!(await page.getByTestId("layouts-left").isVisible())) {
    await page.getByTestId("left-sidebar-button").click();
  }
  await page.getByTestId("layouts-left").click();
  await page.getByTestId("layout-list-item").getByText(name, { exact: true }).click();
  await page.getByTestId("left-sidebar-button").click();
  await page.waitForTimeout(2000);
  await page.getByTestId("play-button").click();
  await page.waitForTimeout(1500);
  await page.getByTestId("play-button").click();
  await page.waitForTimeout(3000);
}
