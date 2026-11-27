import type { NextFunction, Request, Response } from "express";
import { AiService } from "../apps/api/src/ai/ai.service";
import {
  AI_DEFAULT_TIMEOUT_MS,
  AI_UNAVAILABLE_MESSAGE,
  AiTimeoutError,
  AiUnavailableError,
  resolveAiTimeoutMs,
} from "../apps/api/src/ai/ai.schemas";
import type { AiProvider, TicketAiInput } from "../apps/api/src/ai/mock-ai.provider";
import { errorHandler } from "../apps/api/src/middlewares/error-handler";
import {
  formatAiErrorMessage,
  streamTextResponse,
} from "../apps/web/src/features/tickets/api/ai-response";

const sampleInput: TicketAiInput = {
  title: "Cannot open dashboard",
  description: "Page spins indefinitely after signing in.",
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

describe("Day 17 AI timeout and safe fallback", () => {
  const originalTimeoutEnv = process.env.AI_REQUEST_TIMEOUT_MS;
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (originalTimeoutEnv === undefined) {
      delete process.env.AI_REQUEST_TIMEOUT_MS;
    } else {
      process.env.AI_REQUEST_TIMEOUT_MS = originalTimeoutEnv;
    }

    if (originalGeminiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    }

    jest.restoreAllMocks();
  });

  test("resolves configurable timeout from option or AI_REQUEST_TIMEOUT_MS", () => {
    delete process.env.AI_REQUEST_TIMEOUT_MS;
    expect(resolveAiTimeoutMs()).toBe(AI_DEFAULT_TIMEOUT_MS);

    process.env.AI_REQUEST_TIMEOUT_MS = "4500";
    expect(resolveAiTimeoutMs()).toBe(4500);
    expect(resolveAiTimeoutMs(250)).toBe(250);

    process.env.AI_REQUEST_TIMEOUT_MS = "invalid";
    expect(resolveAiTimeoutMs()).toBe(AI_DEFAULT_TIMEOUT_MS);
  });

  test("aborts slow provider calls on timeout and throws AiTimeoutError with exact fallback message", async () => {
    let observedSignal: AbortSignal | undefined;

    const slowProvider: AiProvider = {
      suggestReply: (_input, signal) => {
        observedSignal = signal;
        return new Promise((_resolve) => {
          // Intentionally never resolves to simulate a hung provider call.
        });
      },
      categorise: (_input, signal) => {
        observedSignal = signal;
        return new Promise((_resolve) => {
          // Intentionally never resolves.
        });
      },
    };

    const service = new AiService(slowProvider, { timeoutMs: 30 });

    await expect(collectReply(service, sampleInput)).rejects.toMatchObject({
      name: "AiTimeoutError",
      statusCode: 504,
      message: AI_UNAVAILABLE_MESSAGE,
    });
    expect(observedSignal?.aborted).toBe(true);

    await expect(service.categoriseTicket(sampleInput)).rejects.toBeInstanceOf(
      AiTimeoutError
    );
    expect(AI_UNAVAILABLE_MESSAGE).toBe("AI unavailable — reply manually.");
  });

  test("uses request-scoped fallback without permanently downgrading primary Gemini provider", async () => {
    process.env.GEMINI_API_KEY = "test-only-dummy-key-value-not-real";
    const service = new AiService(undefined, { timeoutMs: 500 });

    expect(service.providerName).toBe("gemini");

    const internalService = service as unknown as {
      provider: AiProvider;
    };

    const categoriseMock = jest
      .spyOn(internalService.provider, "categorise")
      .mockRejectedValueOnce(new Error("Temporary network error with secret details"))
      .mockResolvedValueOnce({ category: "Technical", priority: "P2" });
    const suggestReplyMock = jest
      .spyOn(internalService.provider, "suggestReply")
      .mockRejectedValueOnce(new Error("Temporary network error"))
      .mockResolvedValueOnce("Gemini draft reply.");

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const firstResult = await service.categoriseTicketWithMeta(sampleInput);
    expect(firstResult).toEqual({
      suggestion: { category: "General", priority: "P3" },
      provider: "mock",
    });

    // Primary provider identity must remain intact for subsequent requests.
    expect(service.providerName).toBe("gemini");

    const secondResult = await service.categoriseTicketWithMeta(sampleInput);
    expect(secondResult).toEqual({
      suggestion: { category: "Technical", priority: "P2" },
      provider: "gemini",
    });
    expect(categoriseMock).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    await expect(service.suggestReplyWithMeta(sampleInput)).resolves.toEqual({
      reply:
        "Thank you for reporting: Cannot open dashboard. We have received your request and our support team will review it. We will share an update after checking the details.",
      provider: "mock",
    });
    await expect(service.suggestReplyWithMeta(sampleInput)).resolves.toEqual({
      reply: "Gemini draft reply.",
      provider: "gemini",
    });
    expect(suggestReplyMock).toHaveBeenCalledTimes(2);
    expect(service.providerName).toBe("gemini");
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  test("reports Mock for requests when Gemini is not configured", async () => {
    delete process.env.GEMINI_API_KEY;
    const service = new AiService();

    expect(service.providerName).toBe("mock");
    await expect(service.suggestReplyWithMeta(sampleInput)).resolves.toMatchObject({
      provider: "mock",
    });
    await expect(service.categoriseTicketWithMeta(sampleInput)).resolves.toMatchObject({
      provider: "mock",
    });
  });

  test("reports Gemini when both AI requests succeed with the configured provider", async () => {
    process.env.GEMINI_API_KEY = "test-only-dummy-key-value-not-real";
    const service = new AiService(undefined, { timeoutMs: 500 });
    const internalService = service as unknown as { provider: AiProvider };
    jest
      .spyOn(internalService.provider, "suggestReply")
      .mockResolvedValue("Gemini draft reply.");
    jest.spyOn(internalService.provider, "categorise").mockResolvedValue({
      category: "Technical",
      priority: "P2",
    });

    await expect(service.suggestReplyWithMeta(sampleInput)).resolves.toEqual({
      reply: "Gemini draft reply.",
      provider: "gemini",
    });
    await expect(service.categoriseTicketWithMeta(sampleInput)).resolves.toEqual({
      suggestion: { category: "Technical", priority: "P2" },
      provider: "gemini",
    });
  });

  test("errorHandler hides provider internals and returns exact fallback message for 502/503/504", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    for (const err of [
      new AiUnavailableError(),
      new AiTimeoutError(),
      Object.assign(new Error("Gemini failed with key AIzaDummySecret123"), {
        statusCode: 502,
      }),
    ]) {
      const status = jest.fn().mockReturnThis();
      const json = jest.fn().mockReturnThis();
      const res = { status, json } as unknown as Response;
      const next = jest.fn() as NextFunction;

      errorHandler(err, {} as Request, res, next);

      expect(json).toHaveBeenCalledWith({
        data: null,
        error: { message: "AI unavailable — reply manually." },
        meta: {},
      });
      const payloadString = JSON.stringify(json.mock.calls[0][0]);
      expect(payloadString).not.toContain("AIzaDummySecret123");
    }

    consoleSpy.mockRestore();
  });

  test("frontend handles provider failures, empty responses, and interrupted streams with exact fallback message", async () => {
    const serverError = Object.assign(new Error("Internal error"), {
      status: 503,
    });
    expect(formatAiErrorMessage(serverError)).toBe(
      "AI unavailable — reply manually."
    );
    expect(formatAiErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "AI unavailable — reply manually."
    );
    expect(
      formatAiErrorMessage(new Error("The AI service returned an empty reply."))
    ).toBe("AI unavailable — reply manually.");

    const encoder = new TextEncoder();
    const interruptedBody = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("Partial "));
      },
      pull(controller) {
        controller.error(new Error("Connection reset by peer"));
      },
    });

    let caughtError: unknown;
    try {
      for await (const _chunk of streamTextResponse({
        body: interruptedBody,
      } as unknown as globalThis.Response)) {
        // Consume stream until interruption.
      }
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(Error);
    expect(formatAiErrorMessage(caughtError)).toBe(
      "AI unavailable — reply manually."
    );
  });
});
