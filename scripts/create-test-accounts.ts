import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const customerPassword = process.env.SUPPORTDESK_CUSTOMER_PASSWORD;
  const adminPassword = process.env.SUPPORTDESK_ADMIN_PASSWORD;

  if (!customerPassword || !adminPassword) {
    throw new Error("Both passwords are required.");
  }

  for (const password of [customerPassword, adminPassword]) {
    const bytes = Buffer.byteLength(password, "utf8");
    if (bytes < 8 || bytes > 72) {
      throw new Error("Passwords must be 8 to 72 UTF-8 bytes.");
    }
  }

  const customerEmail = "supportdesk.customer.test2026@example.com";
  const adminEmail = "supportdesk.admin.test2026@example.com";

  const existing = await prisma.user.findMany({
    where: { email: { in: [customerEmail, adminEmail] } },
    select: { email: true },
  });

  if (existing.length > 0) {
    throw new Error(
      `Account already exists: ${existing.map((u) => u.email).join(", ")}. No accounts changed.`
    );
  }

  const customerHash = await bcrypt.hash(customerPassword, 12);
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const accounts = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "SupportDesk Test Customer",
        email: customerEmail,
        passwordHash: customerHash,
        role: "customer",
      },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.user.create({
      data: {
        name: "SupportDesk Test Admin",
        email: adminEmail,
        passwordHash: adminHash,
        role: "admin",
      },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  console.log("Successfully created test accounts:");
  console.table(accounts);
}

main()
  .catch((error) => {
    console.error("Account creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
