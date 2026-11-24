export interface TicketAiInput {
  title: string;
  description: string;
}

export interface TicketAiSuggestion {
  category: "General" | "Technical" | "Account" | "Network" | "Billing";
  priority: "P1" | "P2" | "P3" | "P4";
}

export interface AiProvider {
  suggestReply(input: TicketAiInput): Promise<string>;
  categorise(input: TicketAiInput): Promise<unknown>;
}

/**
 * Deterministic local mock provider.
 * This is not a real AI model and makes no external API calls.
 */
export class MockAiProvider implements AiProvider {
  async suggestReply(input: TicketAiInput): Promise<string> {
    if (!input.title.trim() || !input.description.trim()) {
      throw new Error("Ticket context is required");
    }

    return [
      `Thank you for reporting: ${input.title}.`,
      "We have received your request and our support team will review it.",
      "We will share an update after checking the details.",
    ].join(" ");
  }

  async categorise(input: TicketAiInput): Promise<TicketAiSuggestion> {
    const text = `${input.title} ${input.description}`.toLowerCase();

    let category: TicketAiSuggestion["category"] = "General";

    if (/payment|invoice|billing|refund/.test(text)) category = "Billing";
    else if (/password|login|account|profile/.test(text)) category = "Account";
    else if (/network|wifi|internet|connection/.test(text)) category = "Network";
    else if (/bug|error|software|application|technical/.test(text)) category = "Technical";

    return { category, priority: "P3" };
  }
}
