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
});