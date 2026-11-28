import { assertDevelopmentDatabaseTarget } from "../scripts/dev-database-guard";

const validOptions = {
  nodeEnv: "development",
  allowSetup: "true",
  databaseUrl: "postgresql://local:local@localhost:5432/mydb",
  expectedDatabaseName: "mydb",
  testDatabaseUrl:
    "postgresql://local:local@127.0.0.1:5433/supportdesk_integration_test",
};

describe("development database target guard", () => {
  test("accepts only the explicitly confirmed local development database", () => {
    expect(assertDevelopmentDatabaseTarget(validOptions)).toEqual({
      databaseUrl: validOptions.databaseUrl,
      databaseName: "mydb",
    });
  });

  test.each([
    ["non-development mode", { nodeEnv: "production" }],
    ["missing explicit opt-in", { allowSetup: undefined }],
    ["remote host", {
      databaseUrl:
        "postgresql://local:local@db.example.test:5432/mydb",
    }],
    ["test database", {
      databaseUrl:
        "postgresql://local:local@localhost:5433/supportdesk_test",
      expectedDatabaseName: "supportdesk_test",
    }],
    ["production database", {
      databaseUrl:
        "postgresql://local:local@localhost:5432/supportdesk_production",
      expectedDatabaseName: "supportdesk_production",
    }],
    ["mismatched expected database", {
      expectedDatabaseName: "anotherdb",
    }],
    ["same as test database", {
      databaseUrl:
        "postgresql://local:local@127.0.0.1:5433/supportdesk_integration_test",
      expectedDatabaseName: "supportdesk_integration_test",
    }],
  ])("rejects %s", (_description, overrides) => {
    expect(() =>
      assertDevelopmentDatabaseTarget({
        ...validOptions,
        ...overrides,
      })
    ).toThrow();
  });
});
