import { ticketsRepository } from "../apps/api/src/repositories/tickets.repository";
import { ticketsService } from "../apps/api/src/services/tickets.service";
import { ticketListQuerySchema } from "../apps/api/src/validators/tickets.schema";

jest.mock("../apps/api/src/repositories/tickets.repository", () => ({
  ticketsRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const findAllMock = ticketsRepository.findAll as jest.Mock;
const findByIdMock = ticketsRepository.findById as jest.Mock;
const createMock = ticketsRepository.create as jest.Mock;
const updateMock = ticketsRepository.update as jest.Mock;

describe("ticketsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    test.each([
      ["customer", 12],
      ["agent", undefined],
      ["admin", undefined],
    ] as const)("preserves repository result and scopes %s access", async (role, creatorId) => {
      const result = { tickets: [{ id: 1 }], total: 1 };
      const query = ticketListQuerySchema.parse({});
      findAllMock.mockResolvedValue(result);

      await expect(ticketsService.findAll(12, role, query)).resolves.toBe(result);
      expect(findAllMock).toHaveBeenCalledWith(creatorId, query);
    });

    test("propagates repository errors", async () => {
      const error = new Error("repository unavailable");
      findAllMock.mockRejectedValue(error);

      await expect(
        ticketsService.findAll(12, "customer", ticketListQuerySchema.parse({}))
      ).rejects.toBe(error);
    });
  });

  describe("findById", () => {
    test("returns a customer-owned ticket using creator scope", async () => {
      const ticket = { id: 7, creatorId: 12 };
      findByIdMock.mockResolvedValue(ticket);

      await expect(ticketsService.findById(7, 12, "customer")).resolves.toBe(ticket);
      expect(findByIdMock).toHaveBeenCalledWith(7, 12);
    });

    test.each(["agent", "admin"] as const)(
      "looks up tickets without a creator restriction for %s",
      async (role) => {
        const ticket = { id: 7, creatorId: 99 };
        findByIdMock.mockResolvedValue(ticket);

        await expect(ticketsService.findById(7, 12, role)).resolves.toBe(ticket);
        expect(findByIdMock).toHaveBeenCalledWith(7, undefined);
      }
    );

    test("throws the existing 404 error when the ticket is missing or not owned", async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(
        ticketsService.findById(7, 12, "customer")
      ).rejects.toMatchObject({
        message: "Ticket not found",
        statusCode: 404,
      });
    });

    test("propagates repository errors", async () => {
      const error = new Error("repository unavailable");
      findByIdMock.mockRejectedValue(error);

      await expect(ticketsService.findById(7, 12, "agent")).rejects.toBe(error);
    });
  });

  describe("create", () => {
    test("uses the authenticated user as creator and returns the repository result", async () => {
      const ticket = { id: 4, title: "Unable to sign in", creatorId: 12 };
      createMock.mockResolvedValue(ticket);
      const input = {
        title: "Unable to sign in",
        description: "Sign-in fails when submitting the form.",
        priority: "P2" as const,
      };

      await expect(ticketsService.create(input, 12)).resolves.toBe(ticket);
      expect(createMock).toHaveBeenCalledWith({ ...input, creatorId: 12 });
    });

    test("propagates repository errors", async () => {
      const error = new Error("repository unavailable");
      createMock.mockRejectedValue(error);

      await expect(
        ticketsService.create(
          {
            title: "Unable to sign in",
            description: "Sign-in fails when submitting the form.",
            priority: "P2",
          },
          12
        )
      ).rejects.toBe(error);
    });
  });

  describe("update", () => {
    test("passes customer ownership scope and returns the updated ticket", async () => {
      const ticket = { id: 7, title: "Updated title", creatorId: 12 };
      const data = { title: "Updated title" };
      updateMock.mockResolvedValue(ticket);

      await expect(ticketsService.update(7, data, 12, "customer")).resolves.toBe(ticket);
      expect(updateMock).toHaveBeenCalledWith(7, data, 12);
    });

    test.each(["agent", "admin"] as const)(
      "updates without a creator restriction for %s",
      async (role) => {
        const ticket = { id: 7, title: "Updated title" };
        const data = { title: "Updated title" };
        updateMock.mockResolvedValue(ticket);

        await expect(ticketsService.update(7, data, 12, role)).resolves.toBe(ticket);
        expect(updateMock).toHaveBeenCalledWith(7, data, undefined);
      }
    );

    test("throws the existing 404 error when no ticket was updated", async () => {
      updateMock.mockResolvedValue(null);

      await expect(
        ticketsService.update(7, { title: "Updated title" }, 12, "customer")
      ).rejects.toMatchObject({
        message: "Ticket not found",
        statusCode: 404,
      });
    });

    test("propagates repository errors", async () => {
      const error = new Error("repository unavailable");
      updateMock.mockRejectedValue(error);

      await expect(
        ticketsService.update(7, { title: "Updated title" }, 12, "agent")
      ).rejects.toBe(error);
    });
  });
});
