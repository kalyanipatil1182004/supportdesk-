import { generateTicketId } from "../src/ticket";

describe("generateTicketId", () => {
  test("generates a ticket ID with the correct date and sequence", () => {
    expect(generateTicketId(1, new Date(2026, 0, 2)))
      .toBe("TKT-20260102-001");
  });

  test("adds zeros before a single-digit sequence", () => {
    expect(generateTicketId(5, new Date(2026, 0, 2)))
      .toBe("TKT-20260102-005");
  });

  test("supports a three-digit sequence", () => {
    expect(generateTicketId(123, new Date(2026, 0, 2)))
      .toBe("TKT-20260102-123");
  });

  test("rejects sequence zero", () => {
    expect(() => generateTicketId(0)).toThrow();
  });

  test("rejects a negative sequence", () => {
    expect(() => generateTicketId(-1)).toThrow();
  });

  test("rejects a decimal sequence", () => {
    expect(() => generateTicketId(1.5)).toThrow();
  });

  test("supports a sequence greater than three digits", () => {
    expect(generateTicketId(1000, new Date(2026, 0, 2)))
      .toBe("TKT-20260102-1000");
  });

  test("generates IDs for leap-day dates", () => {
    expect(generateTicketId(1, new Date(2024, 1, 29)))
      .toBe("TKT-20240229-001");
  });

  test("rejects an unsafe integer sequence", () => {
    expect(() => generateTicketId(Number.MAX_SAFE_INTEGER + 1)).toThrow(
      "Sequence must be a positive integer"
    );
  });
});