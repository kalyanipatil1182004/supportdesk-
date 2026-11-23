import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { z } from "zod";
import { assertDevelopmentDatabaseTarget } from "./dev-database-guard";
import { createDevAgentAccount } from "./dev-agent-account";

dotenv.config({
  path: resolve(__dirname, "../.env"),
  override: false,
});
dotenv.config({
  path: resolve(__dirname, "../.env.test.local"),
  override: false,
});

async function main() {
  const emailResult = z.string().email().safeParse(
    process.env.SUPPORTDESK_DEV_AGENT_EMAIL
  );
  const password = process.env.SUPPORTDESK_DEV_AGENT_PASSWORD;

  if (!emailResult.success || !password) {
    throw new Error(
      "A valid SUPPORTDESK_DEV_AGENT_EMAIL and SUPPORTDESK_DEV_AGENT_PASSWORD are required."
    );
  }

  const { databaseUrl, databaseName } = assertDevelopmentDatabaseTarget({
    nodeEnv: process.env.NODE_ENV,
    allowSetup: process.env.SUPPORTDESK_ALLOW_DEV_AGENT_SETUP,
    databaseUrl: process.env.DATABASE_URL,
    expectedDatabaseName: process.env.SUPPORTDESK_DEV_DATABASE_NAME,
    testDatabaseUrl: process.env.TEST_DATABASE_URL,
  });

  const passwordBytes = Buffer.byteLength(password, "utf8");
  if (passwordBytes < 8 || passwordBytes > 72) {
    throw new Error("The Agent password must be 8 to 72 UTF-8 bytes.");
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  try {
    const [database] = await prisma.$queryRaw<
      Array<{ database_name: string }>
    >`SELECT current_database() AS database_name`;

    if (
      !database ||
      database.database_name !== databaseName ||
      database.database_name.endsWith("_test")
    ) {
      throw new Error(
        "Connected database does not match the confirmed development database name."
      );
    }

    const result = await createDevAgentAccount(
      emailResult.data,
      password,
      {
        findRoleByEmail: async (email) =>
          prisma.user.findUnique({
            where: { email },
            select: { role: true },
          }),
        createAgent: async (data) => {
          await prisma.user.create({ data });
        },
      }
    );

    console.log(
      result === "created"
        ? "Development Agent account created."
        : "Development Agent account already exists; no changes made."
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(() => {
    console.error(
      "Development Agent setup failed. Check the local development target and inputs."
    );
    process.exitCode = 1;
  });
}
