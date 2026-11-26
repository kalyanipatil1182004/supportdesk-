import { prisma } from "../apps/api/src/config/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: {
          createdTickets: true,
          assignedTickets: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  console.log("\n===== USERS AND TICKET COUNTS =====");
  console.table(users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdTickets: user._count.createdTickets,
    assignedTickets: user._count.assignedTickets,
  })));

  const totalTickets = await prisma.ticket.count();

  console.log("\n===== TOTAL DATABASE TICKETS =====");
  console.log(totalTickets);

  const statuses = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  console.log("\n===== TICKETS BY STATUS =====");
  console.table(statuses.map((item) => ({
    status: item.status,
    count: item._count._all,
  })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
