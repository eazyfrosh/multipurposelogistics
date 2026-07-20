"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { getAllNotifications, pushNotification } from "@/lib/services/notifications";
import { getAllUsers } from "@/lib/services/users";
import { formatDateTime } from "@/lib/utils";
import { NOTIFICATION_TONE as TYPE_TONE } from "@/lib/notification-ui";
import type { AppNotification, UserProfile } from "@/types";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [targetUid, setTargetUid] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  async function reload() {
    setLoading(true);
    const [n, u] = await Promise.all([getAllNotifications(), getAllUsers()]);
    setNotifications(n);
    setUsers(u);
    if (!targetUid && u.length > 0) setTargetUid(u[0].uid);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendNotification(e: FormEvent) {
    e.preventDefault();
    if (!targetUid || !title.trim() || !message.trim()) {
      toast.error("Fill in all fields");
      return;
    }
    setSending(true);
    try {
      await pushNotification({ userId: targetUid, type: "system", title: title.trim(), message: message.trim() });
      toast.success("Notification sent");
      setTitle("");
      setMessage("");
      reload();
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-foreground/55">All notifications generated across the platform.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="overflow-x-auto lg:col-span-2">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
                <th className="p-4">Type</th>
                <th className="p-4">Title</th>
                <th className="p-4">Sent</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)}
              {!loading &&
                notifications.slice(0, 30).map((n) => (
                  <tr key={n.id} className="border-b border-black/6 last:border-0 dark:border-white/8">
                    <td className="p-4"><Badge tone={TYPE_TONE[n.type]}>{n.type.replace(/_/g, " ")}</Badge></td>
                    <td className="p-4">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-xs text-foreground/45">{n.message}</p>
                    </td>
                    <td className="p-4 text-foreground/55">{formatDateTime(n.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && notifications.length === 0 && (
            <EmptyState icon={<Bell size={22} />} title="No notifications yet" />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send size={16} /> Send a notification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendNotification} className="space-y-3">
              <div>
                <Label>Recipient</Label>
                <Select value={targetUid} onChange={(e) => setTargetUid(e.target.value)}>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Account update" />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message…" />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send notification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
