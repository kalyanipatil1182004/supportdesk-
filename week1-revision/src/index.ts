import * as readline from "readline";
import { TicketManager } from "./ticketManager";
import { TicketStatus } from "./ticket";

const manager = new TicketManager();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main(): Promise<void> {
  let running = true;

  while (running) {
    console.log("\n===== SIMPLE TICKET MANAGER =====");
    console.log("1. Create Ticket");
    console.log("2. View Tickets");
    console.log("3. Update Ticket Status");
    console.log("4. Close Ticket");
    console.log("5. Exit");

    const choice = await ask("Enter your choice: ");

    try {
      switch (choice) {
        case "1": {
          const title = await ask("Enter ticket title: ");
          const description = await ask("Enter description: ");
          const ticket = manager.createTicket(title, description);
          console.log("Ticket created successfully! ID:", ticket.id);
          break;
        }

        case "2": {
          const tickets = manager.getAllTickets();

          if (tickets.length === 0) {
            console.log("No tickets found.");
          } else {
            console.table(tickets);
          }
          break;
        }

        case "3": {
          const id = Number(await ask("Enter ticket ID: "));
          const status = await ask(
            "Enter status (open/in_progress/resolved/closed): "
          );

          const validStatuses: TicketStatus[] = [
            "open",
            "in_progress",
            "resolved",
            "closed",
          ];

          if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid ticket ID");
          }

          if (!validStatuses.includes(status as TicketStatus)) {
            throw new Error("Invalid ticket status");
          }

          manager.updateTicketStatus(id, status as TicketStatus);
          console.log("Ticket status updated successfully!");
          break;
        }

        case "4": {
          const id = Number(await ask("Enter ticket ID: "));

          if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid ticket ID");
          }

          manager.closeTicket(id);
          console.log("Ticket closed successfully!");
          break;
        }

        case "5":
          running = false;
          console.log("Thank you for using Ticket Manager!");
          break;

        default:
          console.log("Invalid choice. Please try again.");
      }
    } catch (error) {
      console.log(
        "Error:",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error("Application error:", error);
  rl.close();
});
