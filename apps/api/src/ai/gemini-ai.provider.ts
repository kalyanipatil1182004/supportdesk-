
import { GoogleGenAI } from "@google/genai";
import type {
  AiProvider,
  TicketAiInput,
} from "./mock-ai.provider";

export class GeminiAiProvider implements AiProvider {
  private readonly ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async suggestReply(input: TicketAiInput): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a professional customer support agent.

Create a short, polite and helpful reply for this ticket.

Title: ${input.title}
Description: ${input.description}

Return only the customer-facing reply.`,
    });

    const reply = response.text?.trim();

    if (!reply) {
      throw new Error("Gemini returned an empty reply");
    }

    return reply;
  }

  async categorise(input: TicketAiInput): Promise<unknown> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyse this support ticket.

Title: ${input.title}
Description: ${input.description}

Choose exactly one category:
General, Technical, Account, Network, Billing.

Choose exactly one priority:
P1, P2, P3, P4.

Return only valid JSON in this format:
{"category":"Network","priority":"P3"}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = response.text?.trim();

    if (!result) {
      throw new Error("Gemini returned an empty categorisation");
    }

    return JSON.parse(result);
  }
}
