
export interface TicketAiInput {
  title: string;
  description: string;
  comments?: string[];
}

export interface TicketAiSuggestion {
  category: "General" | "Technical" | "Account" | "Network" | "Billing";
  priority: "P1" | "P2" | "P3" | "P4";
}

export interface AiProvider {
  suggestReply(input: TicketAiInput, signal?: AbortSignal): Promise<string>;
  categorise(input: TicketAiInput, signal?: AbortSignal): Promise<unknown>;
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

    // Category detection
    if (/payment|invoice|billing|refund/.test(text)) {
      category = "Billing";
    } else if (/password|login|account|profile/.test(text)) {
      category = "Account";
    } else if (/network|wifi|internet|connection/.test(text)) {
      category = "Network";
    } else if (/bug|error|software|application|technical|upload/.test(text)) {
      category = "Technical";
    }

    // Priority detection: critical issues
    let priority: TicketAiSuggestion["priority"] = "P3";

    if (
      /amount.*deduct|payment.*fail|refund.*not|application.*crash|network.*unavailable|reset.*password.*still.*cannot/.test(text)
    ) {
      priority = "P1";
    }

    // High-priority issues
    else if (
      /login.*error|forgot.*password|invoice.*not generated|cannot download.*invoice|wifi.*unavailable|connection.*drop|disconnect|bug|technical error|incorrect.*billing|software.*error/.test(text)
    ) {
      priority = "P2";
    }

    // Low-priority general enquiries
    else if (
      /service enquiry|available support services|information about/.test(text)
    ) {
      priority = "P4";
    }

    return { category, priority };
  }
}