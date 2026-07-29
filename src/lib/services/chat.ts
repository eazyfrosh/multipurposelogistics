import { getOne, subscribeAll, subscribeOne, upsert } from "@/lib/services/store";
import { generateId } from "@/lib/utils";
import type { ChatMessage, ChatThread } from "@/types";

const COLLECTION = "chats";

export async function getOrCreateChat(userId: string, userName: string): Promise<ChatThread> {
  const existing = await getOne<ChatThread>(COLLECTION, userId);
  if (existing) return existing;
  const thread: ChatThread = {
    id: userId,
    userId,
    userName,
    messages: [],
    updatedAt: new Date().toISOString(),
    unreadByAdmin: false,
    unreadByUser: false,
  };
  await upsert(COLLECTION, thread);
  return thread;
}

/** Live updates for a single user's thread — the chat widget and an open admin conversation. */
export function subscribeToChat(userId: string, callback: (thread: ChatThread | null) => void): () => void {
  return subscribeOne<ChatThread>(COLLECTION, userId, callback);
}

/** Live updates for every thread — the admin inbox list. */
export function subscribeToAllChats(callback: (threads: ChatThread[]) => void): () => void {
  return subscribeAll<ChatThread>(COLLECTION, callback);
}

export async function sendChatMessage(
  thread: ChatThread,
  message: Omit<ChatMessage, "id" | "createdAt">
): Promise<void> {
  const updated: ChatThread = {
    ...thread,
    messages: [
      ...thread.messages,
      { ...message, id: generateId("msg_"), createdAt: new Date().toISOString() },
    ],
    updatedAt: new Date().toISOString(),
    // A message marks it unread for whichever side didn't just send it.
    unreadByAdmin: message.isAdmin ? thread.unreadByAdmin : true,
    unreadByUser: message.isAdmin ? true : thread.unreadByUser,
  };
  await upsert(COLLECTION, updated);
}

export async function markChatRead(thread: ChatThread, asAdmin: boolean): Promise<void> {
  const key = asAdmin ? "unreadByAdmin" : "unreadByUser";
  if (!thread[key]) return;
  await upsert(COLLECTION, { ...thread, [key]: false });
}
