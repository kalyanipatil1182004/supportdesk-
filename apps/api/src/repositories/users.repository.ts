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
};
