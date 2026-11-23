import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { assertDevelopmentDatabaseTarget } from "./dev-database-guard";
import {
  createDevelopmentTestAccounts,
  developmentTestAccounts,
} from "./dev-test-accounts";

dotenv.config({
  path: resolve(__dirname, "../.env"),
  override: false,
});
dotenv.config({
  path: resolve(__dirname, "../.env.test.local"),
  override: false,
});

async function main() {
  const { databaseUrl, databaseName } = assertDevelopmentDatabaseTarget({
    nodeEnv: process.env.NODE_ENV,
    allowSetup: process.env.SUPPORTDESK_ALLOW_DEV_TEST_ACCOUNT_SETUP,
    databaseUrl: process.env.DATABASE_URL,
    expectedDatabaseName: process.env.SUPPORTDESK_DEV_DATABASE_NAME,
    testDatabaseUrl: process.env.TEST_DATABASE_URL,
  });

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    const [database] = await prisma.$queryRaw<
      Array<{ database_name: string }>
    >`SELECT current_database() AS database_name`;

    if (!database || database.database_name !== databaseName) {
      throw new Error(
        "Connected database does not match the confirmed development database."
      );
    }

    const passwords = {
      SUPPORTDESK_DEV_CUSTOMER_PASSWORD:
        process.env.SUPPORTDESK_DEV_CUSTOMER_PASSWORD,
      SUPPORTDESK_DEV_AGENT_PASSWORD:
        process.env.SUPPORTDESK_DEV_AGENT_PASSWORD,
      SUPPORTDESK_DEV_ADMIN_PASSWORD:
        process.env.SUPPORTDESK_DEV_ADMIN_PASSWORD,
    };

    await createDevelopmentTestAccounts(passwords, {
      findExistingEmails: async (emails) => {
        const existing = await prisma.user.findMany({
          where: { email: { in: emails } },
          select: { email: true },
        });
        return existing.map(({ email }) => email);
      },
      createAccounts: async (accounts) => {
        await prisma.$transaction(
          accounts.map((account) =>
            prisma.user.create({
              data: account,
              select: { id: true },
            })
          )
        );
      },
    });

    console.log(
      `Created development test accounts for ${developmentTestAccounts.length} roles.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(() => {
    console.error(
      "Development test account setup failed. Check local target confirmation and inputs."
    );
    process.exitCode = 1;
  });
}
