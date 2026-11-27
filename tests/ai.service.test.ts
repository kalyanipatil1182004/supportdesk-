import { AiService } from "../apps/api/src/ai/ai.service";
import type { AiProvider, TicketAiInput } from "../apps/api/src/ai/mock-ai.provider";

const input: TicketAiInput = {
  title: "Unable to login",
  description: "The password is not working.",
};

describe("AiService", () => {
  const provider: jest.Mocked<AiProvider> = {
    suggestReply: jest.fn(),
    categorise: jest.fn(),
  };

  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiService(provider);
  });

  test("generates a reply draft", async () => {
    provider.suggestReply.mockResolvedValue("We will review your request.");

    const chunks: string[] = [];
    for await (const chunk of service.streamSuggestedReply(input)) {
      chunks.push(chunk);
    }

    expect(chunks.join("")).toBe("We will review your request.");
  });

  test("propagates reply provider failures", async () => {
    const error = new Error("Provider unavailable");
    provider.suggestReply.mockRejectedValue(error);

    const collect = async () => {
      const chunks: string[] = [];
      for await (const chunk of service.streamSuggestedReply(input)) {
        chunks.push(chunk);
      }
      return chunks;
    };

    await expect(collect()).rejects.toBe(error);
  });

  test("accepts a valid category and priority", async () => {
    provider.categorise.mockResolvedValue({
      category: "Account",
      priority: "P2",
    });

    await expect(service.categoriseTicket(input)).resolves.toEqual({
      category: "Account",
      priority: "P2",
    });
  });

  test.each([
    [{ category: "Unknown", priority: "P2" }],
    [{ category: "Account", priority: "P5" }],
    [{ category: "Account" }],
    [{}],
  ])("rejects invalid categorisation output: %j", async (result) => {
    provider.categorise.mockResolvedValue(result);

    await expect(service.categoriseTicket(input)).rejects.toThrow();
  });

  test("propagates categorisation provider failures", async () => {
    const error = new Error("Provider unavailable");
    provider.categorise.mockRejectedValue(error);

    await expect(service.categoriseTicket(input)).rejects.toBe(error);
  });
});
