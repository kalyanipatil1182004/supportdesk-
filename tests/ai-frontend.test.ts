import {
  formatAiErrorMessage,
  parseAiProvider,
  parseCategoriseResponse,
  parseTicketAiSuggestion,
  streamTextResponse,
} from "../apps/web/src/features/tickets/api/ai-response";

function createTextResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });

  return { body } as Response;
}

async function collectStream(response: Response): Promise<string> {
  let result = "";
  for await (const chunk of streamTextResponse(response)) {
    result += chunk;
  }
  return result;
}

describe("frontend AI response handling", () => {
  test("reads a text response as a sequence of draft chunks", async () => {
    await expect(
      collectStream(createTextResponse(["Hello ", "there."]))
    ).resolves.toBe("Hello there.");
  });

  test("preserves UTF-8 characters split across stream chunks", async () => {
    const bytes = new TextEncoder().encode("Reply 🙂");
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, bytes.length - 2));
        controller.enqueue(bytes.slice(bytes.length - 2));
        controller.close();
      },
    });

    await expect(collectStream({ body } as Response)).resolves.toBe("Reply 🙂");
  });

  test("rejects an empty or whitespace-only stream", async () => {
    await expect(collectStream(createTextResponse([]))).rejects.toThrow(
      "The AI service returned an empty reply."
    );
    await expect(collectStream(createTextResponse(["  \n"]))).rejects.toThrow(
      "The AI service returned an empty reply."
    );
  });

  test("validates the categorisation values returned by the API", () => {
    expect(
      parseTicketAiSuggestion({ category: "Network", priority: "P2" })
    ).toEqual({ category: "Network", priority: "P2" });
    expect(() =>
      parseTicketAiSuggestion({ category: "Unknown", priority: "P2" })
    ).toThrow("The AI service returned an invalid suggestion.");
  });

  test("accepts only known AI provider metadata", () => {
    expect(parseAiProvider("gemini")).toBe("gemini");
    expect(parseAiProvider("mock")).toBe("mock");
    expect(parseAiProvider("unknown")).toBeNull();
    expect(parseAiProvider(null)).toBeNull();
  });

  test("requires categorisation response to explicitly remain unsaved", () => {
    expect(
      parseCategoriseResponse({
        data: { category: "Technical", priority: "P3" },
        meta: { saved: false, provider: "mock" },
      })
    ).toEqual({
      suggestion: { category: "Technical", priority: "P3" },
      provider: "mock",
    });
    expect(
      parseCategoriseResponse({
        data: { category: "Technical", priority: "P3" },
        meta: { saved: false },
      }).provider
    ).toBeNull();
    expect(() =>
      parseCategoriseResponse({
        data: { category: "Technical", priority: "P3" },
        meta: { saved: true },
      })
    ).toThrow("The AI response did not confirm that the suggestion is unsaved.");
  });

  test("shows actionable messages for unauthorized and forbidden responses", () => {
    const unauthorized = Object.assign(new Error("Authentication required"), {
      status: 401,
    });
    const forbidden = Object.assign(new Error("Access forbidden"), {
      status: 403,
    });

    expect(formatAiErrorMessage(unauthorized)).toBe(
      "Your session has expired. Please sign in again."
    );
    expect(formatAiErrorMessage(forbidden)).toBe(
      "You do not have permission to use AI assistance."
    );
  });
});
