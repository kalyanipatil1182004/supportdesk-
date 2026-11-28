import { Ticket, TicketStatus } from "./ticket";

export class TicketManager {
  private tickets: Ticket[] = [];
  private nextId = 1;

  createTicket(title: string, description: string): Ticket {
    if (!title.trim()) {
      throw new Error("Ticket title is required");
    }

    if (!description.trim()) {
      throw new Error("Ticket description is required");
    }

    const ticket: Ticket = {
      id: this.nextId++,
      title: title.trim(),
      description: description.trim(),
      status: "open",
      createdAt: new Date(),
    };

    this.tickets.push(ticket);
    return ticket;
  }

  getAllTickets(): Ticket[] {
    return [...this.tickets];
  }

  updateTicketStatus(id: number, status: TicketStatus): Ticket {
    const ticket = this.tickets.find((item) => item.id === id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.status = status;
    return ticket;
  }

  closeTicket(id: number): Ticket {
    return this.updateTicketStatus(id, "closed");
  }
}
