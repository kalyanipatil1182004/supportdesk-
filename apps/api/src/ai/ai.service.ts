
import {
  MockAiProvider,
  type AiProvider,
  type TicketAiInput,
} from "./mock-ai.provider";
import { GeminiAiProvider } from "./gemini-ai.provider";
import { ticketAiSuggestionSchema } from "./ai.schemas";

export class AiService {
  private readonly mockProvider = new MockAiProvider();
  private provider: AiProvider;
  private activeProvider: "gemini" | "mock";

  constructor(provider?: AiProvider) {
  if (provider) {
    this.provider = provider;
    this.activeProvider = "mock";
  } else if (process.env.GEMINI_API_KEY?.trim()) {
    this.provider = new GeminiAiProvider();
    this.activeProvider = "gemini";
  } else {
    this.provider = this.mockProvider;
    this.activeProvider = "mock";
  }
}

  get providerName() {
    return this.activeProvider;
  }

  private async withFallback<T>(
    operation: (provider: AiProvider) => Promise<T>
  ): Promise<T> {
    try {
      return await operation(this.provider);
    } catch (error) {
      if (this.activeProvider !== "gemini") {
        throw error;
      }

      console.error("Gemini request failed. Switching to Mock AI.");

      this.provider = this.mockProvider;
      this.activeProvider = "mock";

      return operation(this.provider);
    }
  }

  async *streamSuggestedReply(
    input: TicketAiInput
  ): AsyncGenerator<string> {
    const draft = await this.withFallback(
      (provider) => provider.suggestReply(input)
    );

    const chunks = draft.match(/\S+\s*/g) ?? [];

    for (const chunk of chunks) {
      yield chunk;
    }
  }

  async categoriseTicket(input: TicketAiInput) {
    return this.withFallback(async (provider) => {
      const result = await provider.categorise(input);
      return ticketAiSuggestionSchema.parse(result);
    });
  }
}
