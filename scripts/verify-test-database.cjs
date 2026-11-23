require("dotenv/config");
const { isIP } = require("node:net");

function parseDatabaseUrl(value, variableName) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid PostgreSQL connection URL.`);
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(`${variableName} must use PostgreSQL.`);
  }

  if (!url.hostname) {
    throw new Error(`${variableName} must include a database host.`);
  }

  let databaseName;

  try {
    databaseName = decodeURIComponent(url.pathname.slice(1));
  } catch {
    throw new Error(`${variableName} must include a valid database name.`);
  }

  if (!databaseName) {
    throw new Error(`${variableName} must include a database name.`);
  }

  return {
    url,
    databaseName,
  };
}

function normalizeHostname(hostname) {
  let normalized = hostname.toLowerCase().replace(/\.$/, "");

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }

  const isLoopback =
    normalized === "localhost" ||
    normalized === "::1" ||
    (isIP(normalized) === 4 && normalized.startsWith("127."));

  return isLoopback ? "<loopback>" : normalized;
}

function sameDatabase(left, right) {
  const leftDatabase = parseDatabaseUrl(left, "DATABASE_URL");
  const rightDatabase = parseDatabaseUrl(right, "TEST_DATABASE_URL");

  return (
    normalizeHostname(leftDatabase.url.hostname) ===
      normalizeHostname(rightDatabase.url.hostname) &&
    (leftDatabase.url.port || "5432") === (rightDatabase.url.port || "5432") &&
    leftDatabase.databaseName === rightDatabase.databaseName
  );
}

function getVerifiedTestDatabaseUrl() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl || !testDatabaseUrl.trim()) {
    throw new Error("TEST_DATABASE_URL is required for integration database tasks.");
  }

  const testDatabase = parseDatabaseUrl(
    testDatabaseUrl,
    "TEST_DATABASE_URL"
  );

  if (!testDatabase.databaseName.endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL database name must end with _test.");
  }

  const developmentDatabaseUrl = process.env.DATABASE_URL;

  if (developmentDatabaseUrl) {
    if (sameDatabase(developmentDatabaseUrl, testDatabaseUrl)) {
      throw new Error("TEST_DATABASE_URL must not point to the DATABASE_URL database.");
    }
  }

  process.env.DATABASE_URL = testDatabaseUrl;
  return testDatabaseUrl;
}

module.exports = { getVerifiedTestDatabaseUrl };
