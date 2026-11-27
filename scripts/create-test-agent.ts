import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: resolve(__dirname, "../.env.test.local"),
  override: false,
});

const { getVerifiedTestDatabaseUrl } = require("./verify-test-database.cjs") as {
  getVerifiedTestDatabaseUrl: () => string;
};

getVerifiedTestDatabaseUrl();

const prisma = new PrismaClient();

async function main() {
  const email = z.string().email().safeParse(process.env.SUPPORTDESK_AGENT_EMAIL);
  const password = process.env.SUPPORTDESK_AGENT_PASSWORD;

  if (!email.success || !password) {
    throw new Error(
      "A valid SUPPORTDESK_AGENT_EMAIL and SUPPORTDESK_AGENT_PASSWORD are required."
    );
  }

  const passwordBytes = Buffer.byteLength(password, "utf8");
  if (passwordBytes < 8 || passwordBytes > 72) {
    throw new Error("The Agent password must be 8 to 72 UTF-8 bytes.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.data },
    select: { role: true },
  });

  if (existing) {
    if (existing.role === "agent") {
      console.log("The requested test Agent account already exists; no changes made.");
      return;
    }

    throw new Error(
      "An account with the requested email already exists with a different role; no changes made."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: "SupportDesk Test Agent",
      email: email.data,
      passwordHash,
      role: "agent",
    },
  });

  console.log("Successfully created the test Agent account.");
}

main()
  .catch(() => {
    console.error(
      "Test Agent account setup failed. Verify the isolated test database and account inputs."
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
