const { spawnSync } = require("node:child_process");
require("dotenv").config({
  path: require("node:path").resolve(__dirname, "../.env.test.local"),
  override: false,
});

const { getVerifiedTestDatabaseUrl } = require("./verify-test-database.cjs");

const testDatabaseUrl = getVerifiedTestDatabaseUrl();
const prismaCli = require("node:path").resolve(
  __dirname,
  "../node_modules/prisma/build/index.js"
);

const result = spawnSync(
  process.execPath,
  [
    prismaCli,
    "migrate",
    "deploy",
    "--schema",
    "apps/api/prisma/schema.prisma",
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
    encoding: "utf8",
  }
);

const redactTestDatabaseUrl = (output) =>
  output.replaceAll(testDatabaseUrl, "[redacted test database URL]");

if (result.stdout) {
  process.stdout.write(redactTestDatabaseUrl(result.stdout));
}

if (result.stderr) {
  process.stderr.write(redactTestDatabaseUrl(result.stderr));
}

if (result.error) {
  throw new Error(
    "Unable to run Prisma migrations against the verified test database."
  );
}

process.exitCode = result.status ?? 1;
