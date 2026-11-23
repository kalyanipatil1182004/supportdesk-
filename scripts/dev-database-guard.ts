import { isIP } from "node:net";

interface DevelopmentDatabaseOptions {
  nodeEnv?: string;
  allowSetup?: string;
  databaseUrl?: string;
  expectedDatabaseName?: string;
  testDatabaseUrl?: string;
}

interface DatabaseTarget {
  hostname: string;
  port: string;
  databaseName: string;
}

function parseDatabaseTarget(value: string): DatabaseTarget {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Database URL is invalid.");
  }

  if (
    (url.protocol !== "postgres:" && url.protocol !== "postgresql:") ||
    !url.hostname
  ) {
    throw new Error("Database URL must be a PostgreSQL connection URL.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(url.pathname.slice(1));
  } catch {
    throw new Error("Database URL must contain a valid database name.");
  }

  if (!databaseName) {
    throw new Error("Database URL must contain a database name.");
  }

  return {
    hostname: url.hostname.toLowerCase().replace(/\.$/, ""),
    port: url.port || "5432",
    databaseName,
  };
}

function isLoopback(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "");

  return (
    normalized === "localhost" ||
    normalized === "::1" ||
    (isIP(normalized) === 4 && normalized.startsWith("127."))
  );
}

function isSameDatabase(
  first: DatabaseTarget,
  second: DatabaseTarget
): boolean {
  const sameHost =
    first.hostname === second.hostname ||
    (isLoopback(first.hostname) && isLoopback(second.hostname));

  return (
    sameHost &&
    first.port === second.port &&
    first.databaseName === second.databaseName
  );
}

export function assertDevelopmentDatabaseTarget(
  options: DevelopmentDatabaseOptions
): { databaseUrl: string; databaseName: string } {
  if (options.nodeEnv !== "development") {
    throw new Error("Development account setup requires NODE_ENV=development.");
  }
  if (options.allowSetup !== "true") {
    throw new Error("Explicit development account setup confirmation is required.");
  }
  if (!options.databaseUrl || !options.testDatabaseUrl) {
    throw new Error("Development and test database URLs are required.");
  }
  if (!options.expectedDatabaseName) {
    throw new Error("The expected development database name is required.");
  }

  const target = parseDatabaseTarget(options.databaseUrl);
  const testTarget = parseDatabaseTarget(options.testDatabaseUrl);

  if (!isLoopback(target.hostname)) {
    throw new Error("Development account setup is limited to a local database.");
  }
  if (
    target.databaseName !== options.expectedDatabaseName ||
    target.databaseName !== "mydb"
  ) {
    throw new Error("Database URL does not match the confirmed development database.");
  }
  if (
    /(^|[_-])(test|prod|production)([_-]|$)/i.test(target.databaseName) ||
    target.databaseName.endsWith("_test")
  ) {
    throw new Error("Test and production databases are not allowed.");
  }
  if (isSameDatabase(target, testTarget)) {
    throw new Error("Development database must differ from the test database.");
  }

  return {
    databaseUrl: options.databaseUrl,
    databaseName: target.databaseName,
  };
}
