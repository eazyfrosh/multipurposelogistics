"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Bell,
  LifeBuoy,
  MessageCircle,
  FileBarChart,
  Settings,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToAllChats } from "@/lib/services/chat";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/shipments", label: "Shipments", icon: Package },
  { href: "/admin/carriers", label: "Carriers", icon: Truck },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/chat", label: "Live chat", icon: MessageCircle },
  { href: "/admin/support", label: "Support tickets", icon: LifeBuoy },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/activity-logs", label: "Activity logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAllChats((threads) => {
      setUnreadChats(threads.filter((t) => t.unreadByAdmin).length);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-foreground/40">Admin panel</p>
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                    : "text-foreground/65 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <item.icon size={15} />
                {item.label}
                {item.href === "/admin/chat" && unreadChats > 0 && (
                  <span
                    className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                      active ? "bg-white text-brand-700" : "bg-red-500 text-white"
                    )}
                  >
                    {unreadChats}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1 lg:hidden">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
                  active ? "bg-brand-600 text-white" : "bg-black/5 text-foreground/65 dark:bg-white/10"
                )}
              >
                {item.label}
                {item.href === "/admin/chat" && unreadChats > 0 && ` (${unreadChats})`}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
