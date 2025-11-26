const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  testMatch: ["<rootDir>/tests/**/*.spec.ts"],

  transform: {
    ...tsJestTransformCfg,
  },

  moduleNameMapper: {
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@converters/(.*)$": "<rootDir>/src/converters/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@/(.*)$": "<rootDir>/src/$1"
  }
};
