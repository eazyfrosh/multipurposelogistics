"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getOrCreateChat, markChatRead, sendChatMessage, subscribeToChat } from "@/lib/services/chat";
import { cn, formatDateTime } from "@/lib/utils";
import type { ChatThread } from "@/types";

export function ChatWidget() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const userName = profile?.displayName ?? user?.email ?? "";

  useEffect(() => {
    if (!user) {
      setThread(null);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getOrCreateChat(user.uid, userName).then(() => {
      if (cancelled) return;
      unsubscribe = subscribeToChat(user.uid, setThread);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (open && thread?.unreadByUser) markChatRead(thread, false);
  }, [open, thread]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [open, thread?.messages.length]);

  // Admins have their own live chat inbox in /admin/chat — a floating widget
  // for "their own" thread there would just be confusing clutter.
  if (!user || pathname?.startsWith("/admin")) return null;

  async function send() {
    const text = draft.trim();
    if (!text || !thread || sending) return;
    setSending(true);
    setDraft("");
    try {
      await sendChatMessage(thread, { senderId: user!.uid, senderName: userName, isAdmin: false, text });
    } finally {
      setSending(false);
    }
  }

  const unread = thread?.unreadByUser ?? false;

  return (
    <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b0e17]"
          >
            <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-brand-600 to-teal-accent-500 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">Live chat support</p>
                <p className="text-xs text-white/75">We typically reply within a few minutes</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {!thread || thread.messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground/45">
                  Send a message and our team will get back to you here.
                </p>
              ) : (
                thread.messages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.isAdmin ? "items-start" : "items-end")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                        m.isAdmin
                          ? "rounded-bl-sm bg-black/5 text-foreground dark:bg-white/8"
                          : "rounded-br-sm bg-brand-600 text-white"
                      )}
                    >
                      {m.text}
                    </div>
                    <p className="mt-1 px-1 text-[10px] text-foreground/40">
                      {m.isAdmin ? "Support team" : "You"} · {formatDateTime(m.createdAt)}
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
                placeholder="Type a message…"
                className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-teal-accent-500 text-white shadow-lg shadow-brand-600/30 transition hover:scale-105 active:scale-95"
        aria-label={open ? "Close live chat" : "Open live chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 dark:border-[#05070d]" />
        )}
      </button>
    </div>
  );
}
