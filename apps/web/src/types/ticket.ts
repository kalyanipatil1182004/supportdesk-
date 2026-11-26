export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_on_customer"
  | "resolved"
  | "closed";

export type TicketPriority = "P1" | "P2" | "P3" | "P4";

export interface Ticket {
  id: number;
  seedId: string | null;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  slaDueTime: string | null;
  creatorId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: number;
  search?: string;
  sortBy?: "id" | "title" | "status" | "priority" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
