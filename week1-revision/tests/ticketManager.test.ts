
import { TicketManager } from "../src/ticketManager";

describe("TicketManager Tests", () => {
  let manager: TicketManager;

  beforeEach(() => {
    manager = new TicketManager();
  });

  // Test 1: Create a ticket
  test("should create a new ticket", () => {
    const ticket = manager.createTicket(
      "Login issue",
      "Unable to login"
    );

    expect(ticket.id).toBe(1);
    expect(ticket.title).toBe("Login issue");
    expect(ticket.status).toBe("open");
  });

  // Test 2: Reject empty title
  test("should reject an empty title", () => {
    expect(() =>
      manager.createTicket("", "Description")
    ).toThrow("Ticket title is required");
  });

  // Test 3: Reject empty description
  test("should reject an empty description", () => {
    expect(() =>
      manager.createTicket("Login issue", "")
    ).toThrow("Ticket description is required");
  });

  // Test 4: View all tickets
  test("should return all created tickets", () => {
    manager.createTicket("Ticket 1", "Description 1");
    manager.createTicket("Ticket 2", "Description 2");

    expect(manager.getAllTickets()).toHaveLength(2);
  });

  // Test 5: Update ticket status
  test("should update ticket status", () => {
    const ticket = manager.createTicket(
      "Login issue",
      "Unable to login"
    );

    const updated = manager.updateTicketStatus(
      ticket.id,
      "in_progress"
    );

    expect(updated.status).toBe("in_progress");
  });

  // Test 6: Reject invalid ticket ID
  test("should throw error for invalid ticket ID", () => {
    expect(() =>
      manager.updateTicketStatus(99, "resolved")
    ).toThrow("Ticket not found");
  });

  // Test 7: Close a ticket
  test("should close a ticket", () => {
    const ticket = manager.createTicket(
      "Network issue",
      "Internet not working"
    );

    const closed = manager.closeTicket(ticket.id);

    expect(closed.status).toBe("closed");
  });

  // Test 8: Generate unique ticket IDs
  test("should generate unique IDs for multiple tickets", () => {
    const first = manager.createTicket("First", "First description");
    const second = manager.createTicket("Second", "Second description");

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });
});
