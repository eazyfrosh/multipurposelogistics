import { getAll, getOne, queryByField, upsert } from "@/lib/services/store";
import { generateId } from "@/lib/utils";
import type { SupportTicket, TicketPriority, TicketReply, TicketStatus } from "@/types";

export interface CreateTicketInput {
  userId: string;
  userName: string;
  subject: string;
  message: string;
  priority: TicketPriority;
  shipmentId?: string;
}

export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: generateId("tkt_"),
    userId: input.userId,
    userName: input.userName,
    subject: input.subject,
    message: input.message,
    status: "open",
    priority: input.priority,
    shipmentId: input.shipmentId,
    replies: [],
    createdAt: now,
    updatedAt: now,
  };
  await upsert("support_tickets", ticket);
  return ticket;
}

export async function getTicket(id: string) {
  return getOne<SupportTicket>("support_tickets", id);
}

export async function getAllTickets() {
  const items = await getAll<SupportTicket>("support_tickets");
  return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getTicketsForUser(userId: string) {
  const items = await queryByField<SupportTicket>("support_tickets", "userId", userId);
  return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function replyToTicket(
  ticket: SupportTicket,
  reply: Omit<TicketReply, "id" | "createdAt">
): Promise<SupportTicket> {
  const updated: SupportTicket = {
    ...ticket,
    replies: [
      ...ticket.replies,
      { ...reply, id: generateId("rpl_"), createdAt: new Date().toISOString() },
    ],
    updatedAt: new Date().toISOString(),
  };
  await upsert("support_tickets", updated);
  return updated;
}

export async function setTicketStatus(ticket: SupportTicket, status: TicketStatus): Promise<SupportTicket> {
  const updated: SupportTicket = { ...ticket, status, updatedAt: new Date().toISOString() };
  await upsert("support_tickets", updated);
  return updated;
}
