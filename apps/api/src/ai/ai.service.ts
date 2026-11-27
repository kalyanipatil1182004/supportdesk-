import "dotenv/config";

import {
  MockAiProvider,
  type AiProvider,
  type TicketAiInput,
} from "./mock-ai.provider";
import { GeminiAiProvider } from "./gemini-ai.provider";
import {
  AiTimeoutError,
  resolveAiTimeoutMs,
  validateCategorisationOutput,
  validateSuggestedReplyOutput,
  type ValidatedTicketAiSuggestion,
} from "./ai.schemas";
import { maskAiInputPii } from "./pii-masker";
import { enforceAiModeration } from "./moderation";
import { validateAndGuardAiInput } from "./prompt-guard";

export interface AiServiceOptions {
  timeoutMs?: number;
  fallbackProvider?: AiProvider;
}

export type AiProviderName = "gemini" | "mock";

export class AiService {
  private readonly mockProvider = new MockAiProvider();
  private readonly provider: AiProvider;
  private readonly activeProvider: AiProviderName;
  private readonly fallbackProvider?: AiProvider;
  private readonly timeoutMs: number;

  constructor(provider?: AiProvider, options: AiServiceOptions = {}) {
    this.timeoutMs = resolveAiTimeoutMs(options.timeoutMs);

    if (provider) {
      this.provider = provider;
      this.activeProvider = "mock";
      this.fallbackProvider = options.fallbackProvider;
    } else if (process.env.GEMINI_API_KEY?.trim()) {
      this.provider = new GeminiAiProvider();
      this.activeProvider = "gemini";
      this.fallbackProvider = options.fallbackProvider ?? this.mockProvider;
    } else {
      this.provider = this.mockProvider;
      this.activeProvider = "mock";
      this.fallbackProvider = options.fallbackProvider;
    }
  }

  get providerName() {
    return this.activeProvider;
  }

  private async executeWithTimeout<T>(
    operation: (provider: AiProvider, signal: AbortSignal) => Promise<T>,
    provider: AiProvider
  ): Promise<T> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new AiTimeoutError());
      }, this.timeoutMs);
      if (typeof timer === "object" && timer !== null && "unref" in timer) {
        (timer as { unref: () => void }).unref();
      }
    });

    try {
      return await Promise.race([
        operation(provider, controller.signal),
        timeoutPromise,
      ]);
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  private async withFallback<T>(
    operation: (provider: AiProvider, signal: AbortSignal) => Promise<T>
  ): Promise<{ result: T; providerUsed: "gemini" | "mock" }> {
    try {
      const result = await this.executeWithTimeout(operation, this.provider);
      return { result, providerUsed: this.activeProvider };
    } catch (error) {
      if (!this.fallbackProvider || this.fallbackProvider === this.provider) {
        throw error;
      }

      const errorType = error instanceof Error ? error.name : "UnknownError";
      console.error(
        `Primary AI provider failed (${errorType}). Using request-scoped fallback provider.`
      );

      const result = await this.executeWithTimeout(
        operation,
        this.fallbackProvider
      );
      return { result, providerUsed: "mock" };
    }
  }

  async *streamSuggestedReply(
    input: TicketAiInput
  ): AsyncGenerator<string> {
    const { reply } = await this.suggestReplyWithMeta(input);
    const chunks = reply.match(/\S+\s*/g) ?? [];

    for (const chunk of chunks) {
      yield chunk;
    }
  }

  async suggestReplyWithMeta(input: TicketAiInput): Promise<{
    reply: string;
    provider: AiProviderName;
  }> {
    const validatedInput = validateAndGuardAiInput(input);
    enforceAiModeration(validatedInput);
    const guardedInput = maskAiInputPii(validatedInput);

    const { result: reply, providerUsed } = await this.withFallback(
      async (provider, signal) => {
        const draft =
          provider.suggestReply.length >= 2
            ? await provider.suggestReply(guardedInput, signal)
            : await provider.suggestReply(guardedInput);
        return validateSuggestedReplyOutput(draft);
      }
    );

    return { reply, provider: providerUsed };
  }

  async categoriseTicketWithMeta(input: TicketAiInput): Promise<{
    suggestion: ValidatedTicketAiSuggestion;
    provider: AiProviderName;
  }> {
    const validatedInput = validateAndGuardAiInput(input);
    enforceAiModeration(validatedInput);
    const guardedInput = maskAiInputPii(validatedInput);

    const { result: suggestion, providerUsed } = await this.withFallback(
      async (provider, signal) => {
        const result =
          provider.categorise.length >= 2
            ? await provider.categorise(guardedInput, signal)
            : await provider.categorise(guardedInput);
        return validateCategorisationOutput(result);
      }
    );

    return { suggestion, provider: providerUsed };
  }

  async categoriseTicket(
    input: TicketAiInput
  ): Promise<ValidatedTicketAiSuggestion> {
    const { suggestion } = await this.categoriseTicketWithMeta(input);
    return suggestion;
  }
}
