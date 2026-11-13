import type { Request, Response } from "express";
import { prisma } from "../apps/api/src/config/prisma";
import { commentsController } from "../apps/api/src/controllers/comments.controller";
import { commentsRepository } from "../apps/api/src/repositories/comments.repository";
import { commentsService } from "../apps/api/src/services/comments.service";
import { ticketsService } from "../apps/api/src/services/tickets.service";

jest.mock("../apps/api/src/config/prisma", () => ({
  prisma: {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const createMock = prisma.comment.create as jest.Mock;
const findManyMock = prisma.comment.findMany as jest.Mock;
const findPublicMock = jest.spyOn(commentsRepository, "findPublicByTicketId");
const repositoryCreateMock = jest.spyOn(commentsRepository, "create");
const findTicketMock = jest.spyOn(ticketsService, "findById");
const listServiceMock = jest.spyOn(commentsService, "listForTicket");
const createServiceMock = jest.spyOn(commentsService, "createForTicket");

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("comments endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("repository lists only public comments for a ticket", async () => {
    findManyMock.mockResolvedValue([]);

    await commentsRepository.findPublicByTicketId(15);

    expect(findManyMock).toHaveBeenCalledWith({
      where: { ticketId: 15, isInternal: false },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        body: true,
        isInternal: true,
        ticketId: true,
        authorId: true,
        createdAt: true,
      },
    });
  });

  test("service checks ticket access before listing comments", async () => {
    findTicketMock.mockResolvedValue({ id: 15 } as never);
    findPublicMock.mockResolvedValue([]);

    await commentsService.listForTicket(15, 7, "customer");

    expect(findTicketMock).toHaveBeenCalledWith(15, 7, "customer");
    expect(findPublicMock).toHaveBeenCalledWith(15);
  });

  test("service assigns the authenticated user as author when creating a comment", async () => {
    findTicketMock.mockResolvedValue({ id: 15 } as never);
    repositoryCreateMock.mockResolvedValue({
      id: 2,
      body: "Following up",
      isInternal: false,
      ticketId: 15,
      authorId: 7,
      createdAt: new Date(),
    });

    await commentsService.createForTicket(
      15,
      7,
      "customer",
      { body: "Following up" }
    );

    expect(findTicketMock).toHaveBeenCalledWith(15, 7, "customer");
    expect(repositoryCreateMock).toHaveBeenCalledWith({
      body: "Following up",
      ticketId: 15,
      authorId: 7,
    });
  });

  test("service does not read comments when ticket access is denied", async () => {
    findTicketMock.mockRejectedValue(new Error("Ticket not found"));

    await expect(
      commentsService.listForTicket(15, 7, "customer")
    ).rejects.toThrow("Ticket not found");

    expect(findPublicMock).not.toHaveBeenCalled();
  });

  test("service does not create comments when ticket access is denied", async () => {
    findTicketMock.mockRejectedValue(new Error("Ticket not found"));

    await expect(
      commentsService.createForTicket(
        15,
        7,
        "customer",
        { body: "Following up" }
      )
    ).rejects.toThrow("Ticket not found");

    expect(repositoryCreateMock).not.toHaveBeenCalled();
  });

  test("service propagates comment repository failures", async () => {
    const error = new Error("repository unavailable");
    findTicketMock.mockResolvedValue({ id: 15 } as never);
    findPublicMock.mockRejectedValue(error);

    await expect(
      commentsService.listForTicket(15, 7, "customer")
    ).rejects.toBe(error);

    findTicketMock.mockResolvedValue({ id: 15 } as never);
    repositoryCreateMock.mockRejectedValue(error);

    await expect(
      commentsService.createForTicket(
        15,
        7,
        "customer",
        { body: "Following up" }
      )
    ).rejects.toBe(error);
  });

  test("controller validates comment body and uses the existing error envelope", async () => {
    const req = {
      params: { ticketId: "15" },
      body: { body: "   " },
      user: { id: 7, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await commentsController.create(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { message: "Invalid comment data" },
      meta: {
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ["body"] }),
        ]),
      },
    });
    expect(createServiceMock).not.toHaveBeenCalled();
  });

  test("controller creates public comments and returns the existing success envelope", async () => {
    const comment = {
      id: 2,
      body: "Following up",
      isInternal: false,
      ticketId: 15,
      authorId: 7,
      createdAt: new Date(),
    };
    createServiceMock.mockResolvedValue(comment);

    const req = {
      params: { ticketId: "15" },
      body: { body: "  Following up  ", isInternal: true },
      user: { id: 7, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await commentsController.create(req, res as unknown as Response);

    expect(createServiceMock).toHaveBeenCalledWith(
      15,
      7,
      "customer",
      { body: "Following up" }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: comment,
      error: null,
      meta: {},
    });
  });

  test("controller returns comments in the existing success envelope", async () => {
    const comments = [{
      id: 2,
      body: "Following up",
      isInternal: false,
      ticketId: 15,
      authorId: 7,
      createdAt: new Date(),
    }];
    listServiceMock.mockResolvedValue(comments);

    const req = {
      params: { ticketId: "15" },
      user: { id: 7, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await commentsController.list(req, res as unknown as Response);

    expect(listServiceMock).toHaveBeenCalledWith(15, 7, "customer");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: comments,
      error: null,
      meta: {},
    });
  });

  test("controller rejects malformed ticket IDs using the existing error envelope", async () => {
    const req = {
      params: { ticketId: "0" },
      user: { id: 7, role: "customer" },
    } as unknown as Request;
    const res = createMockResponse();

    await commentsController.list(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { message: "Invalid ticket ID" },
      meta: {},
    });
    expect(listServiceMock).not.toHaveBeenCalled();
  });
});
