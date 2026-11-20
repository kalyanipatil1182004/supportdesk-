import type { Request, Response } from "express";
import { prisma } from "../apps/api/src/config/prisma";
import { ticketsController } from "../apps/api/src/controllers/tickets.controller";
import { ticketsRepository } from "../apps/api/src/repositories/tickets.repository";
import { ticketsService } from "../apps/api/src/services/tickets.service";
import { ticketListQuerySchema } from "../apps/api/src/validators/tickets.schema";

jest.mock("../apps/api/src/config/prisma", () => ({
  prisma: {
    ticket: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const findManyMock = prisma.ticket.findMany as jest.Mock;
const countMock = prisma.ticket.count as jest.Mock;
const serviceFindAllMock = jest.spyOn(ticketsRepository, "findAll");
const controllerFindAllMock = jest.spyOn(ticketsService, "findAll") as jest.Mock;

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("ticket list query", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("applies pagination and sorting defaults and validates query options", () => {
    expect(ticketListQuerySchema.parse({})).toEqual({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(
      ticketListQuerySchema.parse({
        page: "2",
        limit: "50",
        status: "open",
        priority: "P1",
        assigneeId: "7",
        search: " login ",
        sortBy: "updatedAt",
        sortOrder: "asc",
        creatorId: "99",
      })
    ).toEqual({
      page: 2,
      limit: 50,
      status: "open",
      priority: "P1",
      assigneeId: 7,
      search: "login",
      sortBy: "updatedAt",
      sortOrder: "asc",
    });
  });

  test.each([
    { page: "0" },
    { page: "1.5" },
    { limit: "101" },
    { assigneeId: "-1" },
    { status: "unknown" },
    { priority: "P5" },
    { sortBy: "creatorId" },
    { sortOrder: "random" },
    { search: " " },
  ])("rejects invalid query options: %o", (query) => {
    expect(ticketListQuerySchema.safeParse(query).success).toBe(false);
  });

  test("combines customer ownership with filters, search, pagination, and sorting", async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);

    const options = ticketListQuerySchema.parse({
      page: "2",
      limit: "10",
      status: "open",
      priority: "P1",
      assigneeId: "7",
      search: "login",
      sortBy: "priority",
      sortOrder: "asc",
    });

    const result = await ticketsRepository.findAll(42, options);

    const where = {
      creatorId: 42,
      status: "open",
      priority: "P1",
      assigneeId: 7,
      OR: [
        { title: { contains: "login", mode: "insensitive" } },
        { description: { contains: "login", mode: "insensitive" } },
        { category: { contains: "login", mode: "insensitive" } },
      ],
    };

    expect(findManyMock).toHaveBeenCalledWith({
      where,
      orderBy: [{ priority: "asc" }, { id: "asc" }],
      skip: 10,
      take: 10,
    });
    expect(countMock).toHaveBeenCalledWith({ where });
    expect(result).toEqual({ tickets: [], total: 0 });
  });

  test.each(["agent", "admin"] as const)(
    "%s repository query does not include a creatorId ownership filter",
    async () => {
      findManyMock.mockResolvedValue([]);
      countMock.mockResolvedValue(0);

      await ticketsRepository.findAll(undefined, ticketListQuerySchema.parse({}));

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
      expect(countMock).toHaveBeenCalledWith({ where: {} });
      expect(findManyMock.mock.calls[0][0].where).not.toHaveProperty("creatorId");
    }
  );

  test("service scopes customers but preserves unscoped agent and admin access", async () => {
    serviceFindAllMock.mockResolvedValue({ tickets: [], total: 0 });
    const options = ticketListQuerySchema.parse({});

    await ticketsService.findAll(42, "customer", options);
    await ticketsService.findAll(9, "agent", options);
    await ticketsService.findAll(3, "admin", options);

    expect(serviceFindAllMock).toHaveBeenNthCalledWith(1, 42, options);
    expect(serviceFindAllMock).toHaveBeenNthCalledWith(2, undefined, options);
    expect(serviceFindAllMock).toHaveBeenNthCalledWith(3, undefined, options);
  });

  test("controller returns the existing 400 envelope for invalid list query", async () => {
    const req = {
      query: { limit: "101" },
      user: { id: 42, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await ticketsController.getAll(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { message: "Invalid ticket query" },
      meta: {
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ["limit"] }),
        ]),
      },
    });
    expect(controllerFindAllMock).not.toHaveBeenCalled();
  });

  test("controller returns ticket data with correct pagination metadata", async () => {
    const tickets = [{ id: 8, title: "Cannot sign in" }];
    controllerFindAllMock.mockResolvedValue({ tickets, total: 45 });

    const req = {
      query: { page: "2", limit: "20" },
      user: { id: 42, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await ticketsController.getAll(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: tickets,
      error: null,
      meta: {
        pagination: {
          page: 2,
          limit: 20,
          total: 45,
          totalPages: 3,
        },
      },
    });
    expect(controllerFindAllMock).toHaveBeenCalledWith(
      42,
      "customer",
      ticketListQuerySchema.parse({ page: "2", limit: "20" })
    );
  });
});
