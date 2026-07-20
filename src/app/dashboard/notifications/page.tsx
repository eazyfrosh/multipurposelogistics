"use client";

import { useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { EmailPreview } from "@/components/notifications/email-preview";
import { useAuth } from "@/context/auth-context";
import { getNotificationsForUser, markNotificationRead } from "@/lib/services/notifications";
import { NOTIFICATION_TONE, NOTIFICATION_TYPE_LABEL } from "@/lib/notification-ui";
import { formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/types";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<AppNotification | null>(null);

  async function reload() {
    if (!user) return;
    setLoading(true);
    setNotifications(await getNotificationsForUser(user.uid));
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-foreground/55">Updates about your shipments.</p>

      <Card className="mt-6 overflow-hidden">
        {loading && (
          <table className="w-full"><tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={1} />)}</tbody></table>
        )}
        {!loading && notifications.length === 0 && (
          <EmptyState icon={<Bell size={22} />} title="No notifications yet" description="You'll see updates here as your shipments move." />
        )}
        {!loading && (
          <ul className="divide-y divide-black/6 dark:divide-white/8">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-4 p-4 ${!n.read ? "bg-brand-50/50 dark:bg-brand-500/[0.06]" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={NOTIFICATION_TONE[n.type]}>{NOTIFICATION_TYPE_LABEL[n.type]}</Badge>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-1.5 font-medium">{n.title}</p>
                  <p className="text-sm text-foreground/60">{n.message}</p>
                  <p className="mt-1 text-xs text-foreground/40">{formatDateTime(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => setPreview(n)}>
                    <Mail size={13} /> Email
                  </Button>
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await markNotificationRead(n);
                        reload();
                      }}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!preview} onClose={() => setPreview(null)} title="Email preview" className="max-w-md">
        {preview && <EmailPreview notification={preview} recipientEmail={user?.email ?? ""} />}
      </Dialog>
    </div>
  );
}
