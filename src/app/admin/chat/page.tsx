"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/context/auth-context";
import { markChatRead, sendChatMessage, subscribeToAllChats } from "@/lib/services/chat";
import { cn, formatDateTime } from "@/lib/utils";
import type { ChatThread } from "@/types";

export default function AdminChatPage() {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllChats((items) => {
      setThreads([...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const selected = useMemo(() => threads.find((t) => t.id === selectedId) ?? null, [threads, selectedId]);

  useEffect(() => {
    if (selected?.unreadByAdmin) markChatRead(selected, true);
  }, [selected]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [selected?.messages.length]);

  async function send() {
    const text = draft.trim();
    if (!text || !selected || !user || sending) return;
    setSending(true);
    setDraft("");
    try {
      await sendChatMessage(selected, {
        senderId: user.uid,
        senderName: profile?.displayName ?? "Admin",
        isAdmin: true,
        text,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Live chat</h1>
      <p className="text-sm text-foreground/55">Respond to customers in real time.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[19rem_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="max-h-[36rem] overflow-y-auto lg:max-h-[38rem]">
            {!loading && threads.length === 0 && (
              <EmptyState
                icon={<MessageCircle size={22} />}
                title="No conversations yet"
                description="Customer chats will appear here."
                className="py-14"
              />
            )}
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-black/6 p-3.5 text-left transition last:border-0 dark:border-white/8",
                  selectedId === t.id ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                )}
              >
                <Avatar name={t.userName} className="h-9 w-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{t.userName}</p>
                    {t.unreadByAdmin && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                  </div>
                  <p className="truncate text-xs text-foreground/50">
                    {t.messages.length > 0 ? t.messages[t.messages.length - 1].text : "No messages yet"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden p-0">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-foreground/45">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-black/8 p-4 dark:border-white/10">
                <Avatar name={selected.userName} />
                <p className="font-semibold">{selected.userName}</p>
              </div>

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "28rem" }}>
                {selected.messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-foreground/45">No messages yet.</p>
                ) : (
                  selected.messages.map((m) => (
                    <div key={m.id} className={cn("flex flex-col", m.isAdmin ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                          m.isAdmin
                            ? "rounded-br-sm bg-brand-600 text-white"
                            : "rounded-bl-sm bg-black/5 text-foreground dark:bg-white/8"
                        )}
                      >
                        {m.text}
                      </div>
                      <p className="mt-1 px-1 text-[10px] text-foreground/40">
                        {m.isAdmin ? "You" : m.senderName} · {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t border-black/8 p-3 dark:border-white/10"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a reply…"
                  className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                  aria-label="Send reply"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
