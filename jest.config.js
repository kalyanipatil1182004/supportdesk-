
const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "\\.js$"],
  transform: {
    ...tsJestTransformCfg,
  },
};
