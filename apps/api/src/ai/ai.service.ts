import {
  MockAiProvider,
  type AiProvider,
  type TicketAiInput,
} from "./mock-ai.provider";
import { ticketAiSuggestionSchema } from "./ai.schemas";

export class AiService {
  constructor(
    private readonly provider: AiProvider = new MockAiProvider()
  ) {}

  async *streamSuggestedReply(
    input: TicketAiInput
  ): AsyncGenerator<string> {
    const draft = await this.provider.suggestReply(input);
    const chunks = draft.match(/\S+\s*/g) ?? [];

    for (const chunk of chunks) {
      yield chunk;
    }
  }

  async categoriseTicket(input: TicketAiInput) {
    const result = await this.provider.categorise(input);
    return ticketAiSuggestionSchema.parse(result);
  }
}
