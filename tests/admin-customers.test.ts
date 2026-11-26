import type { Request, Response } from "express";
import { prisma } from "../apps/api/src/config/prisma";
import { usersController } from "../apps/api/src/controllers/users.controller";
import { usersRepository } from "../apps/api/src/repositories/users.repository";

jest.mock("../apps/api/src/config/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const findManyMock = prisma.user.findMany as jest.Mock;
const countMock = prisma.user.count as jest.Mock;

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("staff account directory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns paginated customer-only data without sensitive account fields", async () => {
    const customers = [
      { id: 3, name: "Customer One", email: "customer@example.com", createdAt: new Date() },
    ];
    findManyMock.mockResolvedValue(customers);
    countMock.mockResolvedValue(21);

    await expect(usersRepository.findCustomers(2, 10)).resolves.toEqual({
      customers,
      total: 21,
    });
    expect(findManyMock).toHaveBeenCalledWith({
      where: { role: "customer" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: 10,
      take: 10,
    });
    expect(countMock).toHaveBeenCalledWith({ where: { role: "customer" } });
  });

  test("returns paginated admin-only data without sensitive account fields", async () => {
    const admins = [
      { id: 4, name: "Admin One", email: "admin@example.com", createdAt: new Date() },
    ];
    findManyMock.mockResolvedValue(admins);
    countMock.mockResolvedValue(1);

    await expect(usersRepository.findAdmins(1, 10)).resolves.toEqual({
      admins,
      total: 1,
    });
    expect(findManyMock).toHaveBeenCalledWith({
      where: { role: "admin" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: 0,
      take: 10,
    });
    expect(countMock).toHaveBeenCalledWith({ where: { role: "admin" } });
  });

  test("returns paginated customer data in the standard API envelope", async () => {
    const customers = [{ id: 8, name: "Customer", email: "c@example.com" }];
    const findCustomers = jest
      .spyOn(usersRepository, "findCustomers")
      .mockResolvedValue({ customers, total: 23 } as never);
    const req = { query: { page: "2", limit: "10" } } as unknown as Request;
    const res = createMockResponse();

    await usersController.listCustomers(req, res as unknown as Response);

    expect(findCustomers).toHaveBeenCalledWith(2, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: customers,
      error: null,
      meta: {
        pagination: { page: 2, limit: 10, total: 23, totalPages: 3 },
      },
    });
    findCustomers.mockRestore();
  });

  test("returns paginated admin data in the standard API envelope", async () => {
    const admins = [{ id: 8, name: "Admin", email: "a@example.com" }];
    const findAdmins = jest
      .spyOn(usersRepository, "findAdmins")
      .mockResolvedValue({ admins, total: 1 } as never);
    const req = { query: { page: "1", limit: "10" } } as unknown as Request;
    const res = createMockResponse();

    await usersController.listAdmins(req, res as unknown as Response);

    expect(findAdmins).toHaveBeenCalledWith(1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: admins,
      error: null,
      meta: {
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
    findAdmins.mockRestore();
  });

  test("rejects customer list queries with an invalid limit", async () => {
    const req = { query: { limit: "101" } } as unknown as Request;
    const res = createMockResponse();
    const findCustomers = jest.spyOn(usersRepository, "findCustomers");

    await usersController.listCustomers(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findCustomers).not.toHaveBeenCalled();
    findCustomers.mockRestore();
  });
});
