const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.integration.test.ts"],
  setupFiles: ["<rootDir>/tests/integration/setup-env.cjs"],
  maxWorkers: 1,
  transform: {
    ...tsJestTransformCfg,
  },
};
