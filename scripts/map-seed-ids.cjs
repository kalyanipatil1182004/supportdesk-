
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), "data", "seed-tickets.json");
  const items = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Fetch existing database tickets
  const rows = await prisma.ticket.findMany({
    select: {
      id: true,
      title: true,
      seedId: true,
    },
  });

  // Safety checks: do not modify anything unless all 50 match
  if (items.length !== 50 || rows.length !== 50) {
    throw new Error("Expected exactly 50 JSON and database tickets.");
  }

  for (const item of items) {
    const existing = rows.find(
      (ticket) => ticket.id === Number(item.id)
    );

    if (
      !existing ||
      existing.title !== item.title ||
      existing.seedId !== null
    ) {
      throw new Error(
        `Verification failed for ticket ID ${item.id}. No updates made.`
      );
    }
  }

  // Map existing tickets; do not create duplicates
  await prisma.$transaction(
    items.map((item) =>
      prisma.ticket.update({
        where: { id: Number(item.id) },
        data: { seedId: item.id },
      })
    )
  );

  console.log("Successfully mapped 50 existing tickets.");
}

main()
  .catch((error) => {
    console.error("Mapping failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
