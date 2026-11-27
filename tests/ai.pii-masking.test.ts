import { AiService } from "../apps/api/src/ai/ai.service";
import { GeminiAiProvider } from "../apps/api/src/ai/gemini-ai.provider";
import {
  MockAiProvider,
  type TicketAiInput,
} from "../apps/api/src/ai/mock-ai.provider";
import { maskAiInputPii, maskPii } from "../apps/api/src/ai/pii-masker";

async function collectReply(
  service: AiService,
  input: TicketAiInput
): Promise<string> {
  let output = "";
  for await (const chunk of service.streamSuggestedReply(input)) {
    output += chunk;
  }
  return output;
}

describe("Day 17 PII masking", () => {
  test("masks emails, phone numbers, payment cards, and sensitive IDs/tokens", () => {
    const raw = [
      "Contact alice.smith+vip@example.co.uk or +91 98765 43210 / (555) 123-4567 / 9876543210.",
      "Card 4532-0151-1283-0366, SSN 123-45-6789, ID 1234 5678 9012, PAN ABCDE1234F.",
      "Header Bearer test-bearer-token-12345 and JWT eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signaturevalue12.",
    ].join(" ");

    const masked = maskPii(raw);

    expect(masked).not.toContain("alice.smith+vip@example.co.uk");
    expect(masked).not.toContain("+91 98765 43210");
    expect(masked).not.toContain("(555) 123-4567");
    expect(masked).not.toContain("9876543210");
    expect(masked).not.toContain("4532-0151-1283-0366");
    expect(masked).not.toContain("123-45-6789");
    expect(masked).not.toContain("1234 5678 9012");
    expect(masked).not.toContain("ABCDE1234F");
    expect(masked).not.toContain("test-bearer-token-12345");
    expect(masked).not.toContain("eyJhbGciOiJIUzI1NiJ9");

    expect(masked).toContain("[EMAIL]");
    expect(masked).toContain("[PHONE]");
    expect(masked).toContain("[CARD]");
    expect(masked).toContain("[SSN]");
    expect(masked).toContain("[ID]");
    expect(masked).toContain("[PAN]");
    expect(masked).toContain("Bearer [TOKEN]");
    expect(masked).toContain("[TOKEN]");
  });

  test("preserves normal support text, ticket IDs, dates, ports, and IP addresses", () => {
    const normal =
      "Ticket TKT-20261126-001 created on 2026-11-26: HTTP 500 error on port 5432 at 192.168.100.200 for Order #123456.";

    expect(maskPii(normal)).toBe(normal);
  });

  test("preserves original input object without mutating ticket fields", () => {
    const original: TicketAiInput = {
      title: "Billing issue for bob@example.com",
      description: "Call back on 555-987-6543 regarding invoice.",
      comments: ["Alternate email: carol@example.org"],
    };

    const maskedCopy = maskAiInputPii(original);

    expect(maskedCopy).toEqual({
      title: "Billing issue for [EMAIL]",
      description: "Call back on [PHONE] regarding invoice.",
      comments: ["Alternate email: [EMAIL]"],
    });
    expect(original.title).toBe("Billing issue for bob@example.com");
    expect(original.description).toBe(
      "Call back on 555-987-6543 regarding invoice."
    );
    expect(original.comments).toEqual(["Alternate email: carol@example.org"]);
  });

  test("MockAiProvider receives only masked input through AiService", async () => {
    const mockProvider = new MockAiProvider();
    const suggestSpy = jest.spyOn(mockProvider, "suggestReply");
    const categoriseSpy = jest.spyOn(mockProvider, "categorise");
    const service = new AiService(mockProvider);

    const ticketInput: TicketAiInput = {
      title: "Payment problem for user@example.com",
      description: "Charged card 4532 0151 1283 0366, call +1-555-234-5678",
      comments: ["Customer phone 9876543210"],
    };

    const draft = await collectReply(service, ticketInput);
    const suggestion = await service.categoriseTicket(ticketInput);

    expect(suggestSpy).toHaveBeenCalledWith({
      title: "Payment problem for [EMAIL]",
      description: "Charged card [CARD], call [PHONE]",
      comments: ["Customer phone [PHONE]"],
    });
    expect(categoriseSpy).toHaveBeenCalledWith({
      title: "Payment problem for [EMAIL]",
      description: "Charged card [CARD], call [PHONE]",
      comments: ["Customer phone [PHONE]"],
    });

    expect(draft).toContain("[EMAIL]");
    expect(draft).not.toContain("user@example.com");
    expect(suggestion).toEqual({ category: "Billing", priority: "P3" });
    expect(ticketInput.title).toBe("Payment problem for user@example.com");
  });

  test("GeminiAiProvider receives only masked input through AiService and direct calls", async () => {
    const generateContent = jest
      .fn()
      .mockResolvedValueOnce({ text: "We checked your billing request." })
      .mockResolvedValueOnce({
        text: '{"category":"Billing","priority":"P2"}',
      })
      .mockResolvedValueOnce({ text: "Direct masked draft." });

    const fakeClient = {
      models: { generateContent },
    } as unknown as ConstructorParameters<typeof GeminiAiProvider>[0];

    const geminiProvider = new GeminiAiProvider(fakeClient);
    const service = new AiService(geminiProvider);

    const ticketInput: TicketAiInput = {
      title: "Refund for jane.doe@example.com",
      description: "Reach me at +44 20 7946 0958, SSN 123-45-6789.",
      comments: ["Backup contact: jane2@example.org"],
    };

    await expect(collectReply(service, ticketInput)).resolves.toBe(
      "We checked your billing request."
    );
    await expect(service.categoriseTicket(ticketInput)).resolves.toEqual({
      category: "Billing",
      priority: "P2",
    });

    await expect(geminiProvider.suggestReply(ticketInput)).resolves.toBe(
      "Direct masked draft."
    );

    expect(generateContent).toHaveBeenCalledTimes(3);

    for (const call of generateContent.mock.calls) {
      const contents: string = call[0].contents;
      expect(contents).not.toContain("jane.doe@example.com");
      expect(contents).not.toContain("+44 20 7946 0958");
      expect(contents).not.toContain("123-45-6789");
      expect(contents).not.toContain("jane2@example.org");
      expect(contents).toContain("[EMAIL]");
      expect(contents).toContain("[PHONE]");
      expect(contents).toContain("[SSN]");
    }
  });
});
