import type { NextFunction, Request, Response } from "express";
import { AiService } from "../apps/api/src/ai/ai.service";
import {
  AI_MAX_REPLY_LENGTH,
  AiOutputValidationError,
  validateCategorisationOutput,
  validateSuggestedReplyOutput,
} from "../apps/api/src/ai/ai.schemas";
import { GeminiAiProvider } from "../apps/api/src/ai/gemini-ai.provider";
import type { AiProvider, TicketAiInput } from "../apps/api/src/ai/mock-ai.provider";
import { aiController } from "../apps/api/src/controllers/ai.controller";
import { ticketsService } from "../apps/api/src/services/tickets.service";
import { commentsService } from "../apps/api/src/services/comments.service";

const validInput: TicketAiInput = {
  title: "Unable to connect to VPN",
  description: "VPN fails with timeout error after password prompt.",
};

async function collectReply(
  service: AiService,
  input: TicketAiInput
): Promise<string> {
  let result = "";
  for await (const chunk of service.streamSuggestedReply(input)) {
    result += chunk;
  }
  return result;
}

describe("Day 17 AI output validation", () => {
  const provider: jest.Mocked<AiProvider> = {
    suggestReply: jest.fn(),
    categorise: jest.fn(),
  };

  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiService(provider);
  });

  describe("categorisation validation", () => {
    test.each([
      { category: "General", priority: "P4" },
      { category: "Technical", priority: "P2" },
      { category: "Account", priority: "P1" },
      { category: "Network", priority: "P3" },
      { category: "Billing", priority: "P2" },
    ])("accepts valid categorisation output %j", async (validOutput) => {
      provider.categorise.mockResolvedValue(validOutput);

      await expect(service.categoriseTicket(validInput)).resolves.toEqual(
        validOutput
      );
      expect(validateCategorisationOutput(validOutput)).toEqual(validOutput);
    });

    test.each([
      [{ category: "Network" }],
      [{ priority: "P2" }],
      [{}],
      [{ category: "Network", priority: "P2", extra: "unexpected" }],
      [{ category: "Network", priority: "P2", status: "closed" }],
      [{ category: "Security", priority: "P2" }],
      [{ category: "Network", priority: "P0" }],
      [{ category: "Network", priority: "P5" }],
      [{ category: "Network", priority: "High" }],
      [{ category: 123, priority: "P2" }],
      [{ category: "Network", priority: 2 }],
      ['{"category":"Network","priority":"P2"}'],
      [null],
      [undefined],
      [42],
      [["Network", "P2"]],
    ])("rejects invalid categorisation output: %j", async (badOutput) => {
      provider.categorise.mockResolvedValue(badOutput);

      await expect(service.categoriseTicket(validInput)).rejects.toBeInstanceOf(
        AiOutputValidationError
      );
    });

    test("GeminiAiProvider rejects malformed JSON, empty responses, and extra fields", async () => {
      const generateContent = jest
        .fn()
        .mockResolvedValueOnce({ text: "{not valid json" })
        .mockResolvedValueOnce({ text: "   " })
        .mockResolvedValueOnce({
          text: '{"category":"Network","priority":"P2","extra":true}',
        })
        .mockResolvedValueOnce({
          text: '{"category":"Network","priority":"P2"}',
        });

      const fakeClient = {
        models: { generateContent },
      } as unknown as ConstructorParameters<typeof GeminiAiProvider>[0];

      const gemini = new GeminiAiProvider(fakeClient);

      await expect(gemini.categorise(validInput)).rejects.toThrow(
        "Gemini returned malformed JSON categorisation"
      );
      await expect(gemini.categorise(validInput)).rejects.toThrow(
        "Gemini returned an empty categorisation"
      );
      await expect(gemini.categorise(validInput)).rejects.toBeInstanceOf(
        AiOutputValidationError
      );
      await expect(gemini.categorise(validInput)).resolves.toEqual({
        category: "Network",
        priority: "P2",
      });
    });
  });

  describe("suggested reply validation", () => {
    test("accepts trimmed non-empty reply within maximum length", async () => {
      const boundaryReply = "r".repeat(AI_MAX_REPLY_LENGTH);
      provider.suggestReply
        .mockResolvedValueOnce("  We are checking your VPN logs.  ")
        .mockResolvedValueOnce(boundaryReply);

      await expect(collectReply(service, validInput)).resolves.toBe(
        "We are checking your VPN logs."
      );
      await expect(collectReply(service, validInput)).resolves.toBe(
        boundaryReply
      );
    });

    test.each([
      "",
      "   \n\t  ",
      null,
      undefined,
      123,
      { text: "hello" },
      "x".repeat(AI_MAX_REPLY_LENGTH + 1),
    ])(
      "rejects invalid or oversized reply %j without yielding chunks",
      async (badReply) => {
        provider.suggestReply.mockResolvedValue(badReply as unknown as string);
        const chunks: string[] = [];

        await expect(
          (async () => {
            for await (const chunk of service.streamSuggestedReply(validInput)) {
              chunks.push(chunk);
            }
          })()
        ).rejects.toBeInstanceOf(AiOutputValidationError);

        expect(chunks).toEqual([]);
      }
    );

    test("GeminiAiProvider validates reply output length and non-emptiness", async () => {
      const generateContent = jest
        .fn()
        .mockResolvedValueOnce({ text: "   " })
        .mockResolvedValueOnce({ text: "y".repeat(AI_MAX_REPLY_LENGTH + 1) })
        .mockResolvedValueOnce({ text: "  Please restart your VPN client. " });

      const fakeClient = {
        models: { generateContent },
      } as unknown as ConstructorParameters<typeof GeminiAiProvider>[0];

      const gemini = new GeminiAiProvider(fakeClient);

      await expect(gemini.suggestReply(validInput)).rejects.toBeInstanceOf(
        AiOutputValidationError
      );
      await expect(gemini.suggestReply(validInput)).rejects.toBeInstanceOf(
        AiOutputValidationError
      );
      await expect(gemini.suggestReply(validInput)).resolves.toBe(
        "Please restart your VPN client."
      );
      expect(validateSuggestedReplyOutput("  Draft reply.  ")).toBe(
        "Draft reply."
      );
    });
  });

  describe("safe failure handling without persisting unvalidated AI output", () => {
    test("aiController passes validation/provider errors to next() without modifying tickets", async () => {
      const findSpy = jest.spyOn(ticketsService, "findById").mockResolvedValue({
        id: 10,
        title: "Network issue",
        description: "WiFi disconnects",
      } as never);
      const updateSpy = jest.spyOn(ticketsService, "update");
      const commentsSpy = jest
        .spyOn(commentsService, "listForTicket")
        .mockResolvedValue([] as never);

      const req = {
        params: { id: "10" },
        user: { id: 2, role: "agent" },
      } as unknown as Request;
      const res = {
        headersSent: false,
        destroyed: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      await aiController.categorise(req, res, next);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({ saved: false }),
        })
      );
      expect(updateSpy).not.toHaveBeenCalled();

      findSpy.mockRejectedValueOnce(new AiOutputValidationError("Invalid AI output"));
      await aiController.suggestReply(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AiOutputValidationError));
      expect(res.write).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();

      findSpy.mockRestore();
      updateSpy.mockRestore();
      commentsSpy.mockRestore();
    });
  });
});
