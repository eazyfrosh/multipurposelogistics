"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { LifeBuoy, Send } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { createTicket, getTicketsForUser, replyToTicket } from "@/lib/services/tickets";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket, TicketPriority, TicketStatus } from "@/types";

const STATUS_TONE: Record<TicketStatus, BadgeTone> = {
  open: "brand",
  in_progress: "gold",
  resolved: "green",
  closed: "neutral",
};

function SupportInner() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  async function reload() {
    if (!user) return;
    setLoading(true);
    setTickets(await getTicketsForUser(user.uid));
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await createTicket({
        userId: user.uid,
        userName: profile?.displayName ?? user.email,
        subject: subject.trim(),
        message: message.trim(),
        priority,
      });
      toast.success("Support ticket submitted");
      setSubject("");
      setMessage("");
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply(ticket: SupportTicket) {
    const draft = replyDrafts[ticket.id]?.trim();
    if (!draft || !user) return;
    await replyToTicket(ticket, {
      authorId: user.uid,
      authorName: profile?.displayName ?? user.email,
      message: draft,
      isAdmin: false,
    });
    setReplyDrafts((d) => ({ ...d, [ticket.id]: "" }));
    reload();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Support</h1>
      <p className="text-sm text-foreground/55">Get help with a shipment or your account.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>New ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Question about my shipment" />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue…" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Send size={14} /> {submitting ? "Submitting…" : "Submit ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!loading && tickets.length === 0 && (
            <EmptyState icon={<LifeBuoy size={22} />} title="No support tickets yet" description="Submitted tickets will appear here." />
          )}
          {tickets.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{t.subject}</p>
                  <Badge tone={STATUS_TONE[t.status]}>{t.status.replace("_", " ")}</Badge>
                </div>
                <p className="mt-1 text-xs text-foreground/45">{formatDateTime(t.createdAt)}</p>
                <p className="mt-2 text-sm text-foreground/70">{t.message}</p>
                {t.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-black/8 pt-3 dark:border-white/10">
                    {t.replies.map((r) => (
                      <div key={r.id} className={`rounded-lg p-2.5 text-sm ${r.isAdmin ? "bg-brand-50 dark:bg-brand-500/10" : "bg-black/5 dark:bg-white/5"}`}>
                        <p className="text-xs font-medium">{r.authorName}{r.isAdmin && " · Support team"}</p>
                        <p className="text-foreground/70">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                {t.status !== "closed" && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={replyDrafts[t.id] ?? ""}
                      onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                      placeholder="Add a reply…"
                    />
                    <Button size="sm" variant="secondary" onClick={() => sendReply(t)}>Reply</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return <SupportInner />;
}
