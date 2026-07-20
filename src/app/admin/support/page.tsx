"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { getAllTickets } from "@/lib/services/tickets";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket, TicketPriority, TicketStatus } from "@/types";

const STATUS_TONE: Record<TicketStatus, BadgeTone> = {
  open: "brand",
  in_progress: "gold",
  resolved: "green",
  closed: "neutral",
};
const PRIORITY_TONE: Record<TicketPriority, BadgeTone> = {
  low: "neutral",
  medium: "brand",
  high: "gold",
  urgent: "red",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    getAllTickets().then((t) => {
      setTickets(t);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => tickets.filter((t) => statusFilter === "all" || t.status === statusFilter),
    [tickets, statusFilter]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Support tickets</h1>
          <p className="text-sm text-foreground/55">Respond to customer support requests.</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
              <th className="p-4">Subject</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            {!loading &&
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-black/6 last:border-0 hover:bg-black/[0.02] dark:border-white/8 dark:hover:bg-white/[0.02]">
                  <td className="p-4">
                    <Link href={`/admin/support/${t.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                      {t.subject}
                    </Link>
                  </td>
                  <td className="p-4 text-foreground/65">{t.userName}</td>
                  <td className="p-4"><Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge></td>
                  <td className="p-4"><Badge tone={STATUS_TONE[t.status]}>{t.status.replace("_", " ")}</Badge></td>
                  <td className="p-4 text-foreground/55">{formatDateTime(t.updatedAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <EmptyState icon={<LifeBuoy size={22} />} title="No support tickets" description="Tickets submitted by customers will appear here." />
        )}
      </Card>
    </div>
  );
}
