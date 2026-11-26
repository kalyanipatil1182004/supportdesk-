import { AiService } from "../apps/api/src/ai/ai.service";
import { MockAiProvider } from "../apps/api/src/ai/mock-ai.provider";

describe("Mock AI provider edge cases", () => {
  const provider = new MockAiProvider();

  test("rejects an empty ticket context for suggested replies", async () => {
    await expect(
      provider.suggestReply({
        title: "",
        description: "",
      })
    ).rejects.toThrow("Ticket context is required");
  });

  test("stops consuming the reply stream when the consumer exits early", async () => {
    const service = new AiService(provider);
    const chunks: string[] = [];

    for await (const chunk of service.streamSuggestedReply({
      title: "Login issue",
      description: "Unable to login",
    })) {
      chunks.push(chunk);
      break;
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("Thank ");
  });
});
