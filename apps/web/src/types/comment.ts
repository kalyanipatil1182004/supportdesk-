export interface TicketComment {
  id: number;
  body: string;
  isInternal: boolean;
  ticketId: number;
  authorId: number;
  createdAt: string;
}