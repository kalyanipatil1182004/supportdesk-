import { PrismaClient, TicketStatus, TicketPriority } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface SeedTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

async function main() {
  const filePath = join(process.cwd(), "data", "seed-tickets.json");

  const tickets: SeedTicket[] = JSON.parse(
    readFileSync(filePath, "utf-8")
  );

  // Create one fictional demo customer
  const creator = await prisma.user.upsert({
    where: { email: "demo.customer@example.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo.customer@example.com",
      passwordHash: "LOCAL_TEST_ONLY",
      role: "customer",
    },
  });

  const statusMap: Record<string, TicketStatus> = {
    "Open": "open",
    "In Progress": "in_progress",
    "Resolved": "resolved",
  };

  const priorityMap: Record<string, TicketPriority> = {
    "High": "P1",
    "Medium": "P2",
    "Low": "P3",
  };

  for (const item of tickets) {
    await prisma.ticket.create({
      data: {
        title: item.title,
        description: `Sample ticket: ${item.title}`,
        status: statusMap[item.status],
        priority: priorityMap[item.priority],
        creatorId: creator.id,
      },
    });
  }

  console.log(`Successfully seeded ${tickets.length} tickets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });