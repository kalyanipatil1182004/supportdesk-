import { prisma } from "../config/prisma";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const usersRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      },
    });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: publicUserSelect,
    });
  },

  async findCustomers(page: number, limit: number) {
    const where = { role: "customer" as const };
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { customers, total };
  },

  async findAdmins(page: number, limit: number) {
    const where = { role: "admin" as const };
    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { admins, total };
  },
};
