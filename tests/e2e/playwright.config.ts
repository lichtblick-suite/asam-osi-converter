import { defineConfig } from "@playwright/test";

/** Opt-in render tests against the Lichtblick desktop app; run with `yarn test:e2e`. */
export default defineConfig({
  testDir: ".",
  testMatch: "*.e2e.ts",
  outputDir: "../../test-results/e2e",
  timeout: 180_000,
  workers: 1,
  reporter: [["list"]],
});
