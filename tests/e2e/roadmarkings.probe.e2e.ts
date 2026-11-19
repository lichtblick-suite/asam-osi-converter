/**
 * Render probe: does Lichtblick show road markings where the OSI specification puts them?
 *
 * Six probe markings (see PROBE_MARKINGS) are rendered through two independent paths:
 * - D1: boxes computed by the OSI reference model, published as a plain foxglove.SceneUpdate
 * - D2: the same markings as OSI ground truth, converted by this extension
 *
 * Both top-view screenshots are measured against the reference model. D1 validates the
 * measurement (camera map, segmentation, Lichtblick itself), D2 the converter. The test also
 * checks that plausible wrong conventions would be detected, and that D1 and D2 are identical.
 */
import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

import {
  centroid,
  colorMasks,
  countComponents,
  countDifferentPixels,
  decodePng,
  fitAffine,
  iou,
  predictMask,
  shift,
} from "./imageAnalysis";
import {
  createLichtblickHome,
  launchLichtblick,
  LICHTBLICK_BIN,
  openFile,
  REPO_ROOT,
  showLayout,
  topViewLayout,
} from "./lichtblick";
import { PROBE_SCENE_TOPIC, writeProbeMcap } from "./probeMcap";
import {
  OSI_CONVENTION,
  predictRoadMarkingBoxes,
  PROBE_CENTER,
  PROBE_MARKINGS,
  WRONG_CONVENTIONS,
} from "../helpers/osiGeometry";

const SOURCE = path.join(REPO_ROOT, "example-data", "MovingHostWithStopLine.mcap");
const CAMERA_DISTANCE = 16;
const MIN_IOU = 0.9;
const MAX_WRONG_IOU = 0.5;
const CONVENTIONS = { "OSI v3.8.0": OSI_CONVENTION, ...WRONG_CONVENTIONS };

test.skip(!fs.existsSync(LICHTBLICK_BIN), `Lichtblick not found at ${LICHTBLICK_BIN}`);

test("road markings render where the OSI specification puts them", async () => {
  const info = test.info();
  const probeFile = info.outputPath("probe.mcap");
  const osiTopics = await writeProbeMcap(SOURCE, probeFile);
  const topics = (shown: "osi" | "scene") => ({
    ...Object.fromEntries(
      osiTopics.map((topic) => [
        topic,
        { visible: shown === "osi", showAxes: false, showOutlines: false },
      ]),
    ),
    [PROBE_SCENE_TOPIC]: { visible: shown === "scene", showOutlines: false },
  });
  const views = { "probe-scene": topics("scene"), "probe-osi": topics("osi") };
  const home = createLichtblickHome(
    Object.fromEntries(
      Object.entries(views).map(([name, t]) => [
        name,
        topViewLayout(PROBE_CENTER, CAMERA_DISTANCE, t),
      ]),
    ),
  );

  const screenshots = new Map<string, PNG>();
  const { app, page } = await launchLichtblick(home);
  try {
    await openFile(page, probeFile);
    for (const view of Object.keys(views)) {
      await showLayout(page, view);
      const png = await page.locator("canvas").first().screenshot();
      await info.attach(view, { body: png, contentType: "image/png" });
      screenshots.set(view, decodePng(png));
    }
  } finally {
    await app.close();
    fs.rmSync(home, { recursive: true, force: true });
  }

  for (const [view, image] of screenshots) {
    await test.step(`${view}: silhouettes match the OSI model`, async () => {
      const masks = colorMasks(image);
      const solid = PROBE_MARKINGS.filter((m) => predictRoadMarkingBoxes(m).length === 1);
      const centroids = solid.map((m) => centroid(masks[m.name]!));
      expect(centroids, "every solid probe is visible").not.toContain(undefined);
      const map = fitAffine(
        solid.map(({ base: { position } }) => [position.x, position.y]),
        centroids.map((c) => c!),
      );
      const anisotropy = Math.abs(map.scales[0] / map.scales[1] - 1);
      expect(map.residual, "camera is affine (orthographic)").toBeLessThan(1);
      expect(anisotropy, "pixels are square").toBeLessThan(0.01);
      expect(map.det, "top view is not mirrored").toBeLessThan(0);

      const table = Object.fromEntries(
        Object.entries(CONVENTIONS).map(([name, convention]) => [
          name,
          Object.fromEntries(
            PROBE_MARKINGS.map((m) => {
              const predicted = predictRoadMarkingBoxes(m, convention);
              const mask = predictMask(predicted, map, image.width, image.height);
              return [m.name, Number(iou(masks[m.name]!, mask).toFixed(3))];
            }),
          ),
        ]),
      );
      console.log(`${view}: IoU of rendered vs. predicted silhouettes`);
      console.table(table);
      await info.attach(`${view}-iou.json`, {
        body: JSON.stringify({ map, table }, undefined, 2),
        contentType: "application/json",
      });
      for (const [probe, value] of Object.entries(table["OSI v3.8.0"]!)) {
        expect.soft(value, `${probe} matches the OSI model`).toBeGreaterThanOrEqual(MIN_IOU);
      }
      for (const name of Object.keys(WRONG_CONVENTIONS)) {
        const worst = Math.min(...Object.values(table[name]!));
        expect.soft(worst, `probe set detects: ${name}`).toBeLessThan(MAX_WRONG_IOU);
      }

      const zebra = PROBE_MARKINGS.find((m) => m.name === "violet")!;
      expect(countComponents(masks.violet!), "zebra stripes").toBe(
        predictRoadMarkingBoxes(zebra).length,
      );
      // Green and blue are the same rotation written with different Euler angles (gimbal lock)
      const [green, blue] = [centroid(masks.green!)!, centroid(masks.blue!)!];
      const moved = shift(
        masks.blue!,
        Math.round(green[0] - blue[0]),
        Math.round(green[1] - blue[1]),
      );
      expect(iou(masks.green!, moved), "gimbal twins look the same").toBeGreaterThan(0.95);
    });
  }

  await test.step("converter output equals the independent SceneUpdate pixel by pixel", async () => {
    const scene = screenshots.get("probe-scene")!;
    const osi = screenshots.get("probe-osi")!;
    const differing = countDifferentPixels(scene, osi);
    console.log(
      `D1 vs D2: ${String(differing)} of ${String(scene.width * scene.height)} pixels differ`,
    );
    expect(differing).toBeLessThanOrEqual(scene.width * scene.height * 1e-3);
  });
});
