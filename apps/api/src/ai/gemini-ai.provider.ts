
import { GoogleGenAI } from "@google/genai";
import {
  AiOutputValidationError,
  validateCategorisationOutput,
  validateSuggestedReplyOutput,
  type ValidatedTicketAiSuggestion,
} from "./ai.schemas";
import type {
  AiProvider,
  TicketAiInput,
} from "./mock-ai.provider";
import {
  buildCategorisePrompt,
  buildSuggestReplyPrompt,
} from "./prompt-guard";

export class GeminiAiProvider implements AiProvider {
  private readonly ai: GoogleGenAI;

  constructor(client?: GoogleGenAI) {
    if (client) {
      this.ai = client;
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async suggestReply(
    input: TicketAiInput,
    signal?: AbortSignal
  ): Promise<string> {
    const prompt = buildSuggestReplyPrompt(input);
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt.userPrompt,
      config: {
        systemInstruction: prompt.systemInstruction,
        ...(signal ? { abortSignal: signal } : {}),
      },
    });

    return validateSuggestedReplyOutput(response.text);
  }

  async categorise(
    input: TicketAiInput,
    signal?: AbortSignal
  ): Promise<ValidatedTicketAiSuggestion> {
    const prompt = buildCategorisePrompt(input);
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt.userPrompt,
      config: {
        systemInstruction: prompt.systemInstruction,
        responseMimeType: "application/json",
        ...(signal ? { abortSignal: signal } : {}),
      },
    });

    const result = response.text?.trim();

    if (!result) {
      throw new AiOutputValidationError(
        "Gemini returned an empty categorisation"
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(result);
    } catch {
      throw new AiOutputValidationError(
        "Gemini returned malformed JSON categorisation"
      );
    }

    return validateCategorisationOutput(parsed);
  }
}
