"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getNotificationsForUser } from "@/lib/services/notifications";
import { formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/types";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getNotificationsForUser(user.uid).then((n) => setNotifications(n.slice(0, 8)));
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!user) return null;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-black/8 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b0e17]">
          <div className="border-b border-black/8 px-4 py-2.5 text-sm font-semibold dark:border-white/10">Notifications</div>
          <ul className="max-h-80 divide-y divide-black/6 overflow-y-auto dark:divide-white/8">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-foreground/45">No notifications yet</li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className={`px-4 py-2.5 text-sm ${!n.read ? "bg-brand-50/50 dark:bg-brand-500/[0.06]" : ""}`}>
                <p className="font-medium">{n.title}</p>
                <p className="truncate text-xs text-foreground/55">{n.message}</p>
                <p className="mt-0.5 text-[11px] text-foreground/35">{formatDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-black/8 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-black/5 dark:border-white/10 dark:text-brand-400 dark:hover:bg-white/10"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
