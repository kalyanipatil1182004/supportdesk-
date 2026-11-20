require("dotenv").config({
  path: require("node:path").resolve(__dirname, "../../.env.test.local"),
  override: false,
});

const { getVerifiedTestDatabaseUrl } = require("../../scripts/verify-test-database.cjs");

getVerifiedTestDatabaseUrl();

process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.JWT_SECRET = "supportdesk-integration-test-only-secret";
process.env.JWT_EXPIRES_IN = "1h";
