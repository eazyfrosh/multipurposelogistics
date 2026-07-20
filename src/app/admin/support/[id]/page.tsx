"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getTicket, replyToTicket, setTicketStatus } from "@/lib/services/tickets";
import { logActivity } from "@/lib/services/activity";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/types";

function AdminTicketDetail() {
  const params = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null | undefined>(undefined);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setTicket(await getTicket(params.id));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (ticket === undefined) return <LoadingState label="Loading ticket…" />;
  if (ticket === null) return <div className="py-16 text-center text-foreground/60">Ticket not found.</div>;

  async function sendReply() {
    if (!reply.trim() || !user) return;
    setSending(true);
    try {
      const updated = await replyToTicket(ticket!, {
        authorId: user.uid,
        authorName: profile?.displayName ?? "Admin",
        message: reply.trim(),
        isAdmin: true,
      });
      await logActivity(user.uid, profile?.displayName ?? user.email, "ticket_updated", "ticket", ticket!.id, `Replied to ticket "${ticket!.subject}"`);
      setTicket(updated);
      setReply("");
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(status: TicketStatus) {
    const updated = await setTicketStatus(ticket!, status);
    setTicket(updated);
    if (user) {
      await logActivity(user.uid, profile?.displayName ?? user.email, "ticket_updated", "ticket", ticket!.id, `Set ticket "${ticket!.subject}" to ${status}`);
    }
    toast.success(`Ticket marked ${status.replace("_", " ")}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-foreground/55">From {ticket.userName} · {formatDateTime(ticket.createdAt)}</p>
        </div>
        <Select value={ticket.status} onChange={(e) => changeStatus(e.target.value as TicketStatus)} className="w-40">
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-5">
          <div className="rounded-xl bg-black/5 p-4 dark:bg-white/5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold">{ticket.userName}</span>
              <Badge tone="neutral">{ticket.priority}</Badge>
            </div>
            <p className="text-sm text-foreground/70">{ticket.message}</p>
          </div>
          {ticket.replies.map((r) => (
            <div key={r.id} className={`rounded-xl p-4 ${r.isAdmin ? "bg-brand-50 dark:bg-brand-500/10" : "bg-black/5 dark:bg-white/5"}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold">{r.authorName} {r.isAdmin && <Badge tone="brand" className="ml-1">Staff</Badge>}</span>
                <span className="text-xs text-foreground/45">{formatDateTime(r.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground/70">{r.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
          <Button className="mt-3" onClick={sendReply} disabled={sending}>
            <Send size={14} /> {sending ? "Sending…" : "Send reply"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminTicketPage() {
  return <AdminTicketDetail />;
}
