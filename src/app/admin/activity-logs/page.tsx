"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { getAllActivity } from "@/lib/services/activity";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLog } from "@/types";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllActivity().then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Activity logs</h1>
      <p className="text-sm text-foreground/55">Full audit trail of platform actions.</p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
              <th className="p-4">By</th>
              <th className="p-4">When</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
            {!loading &&
              logs.slice(0, 100).map((l) => (
                <tr key={l.id} className="border-b border-black/6 last:border-0 dark:border-white/8">
                  <td className="p-4"><Badge tone="neutral">{l.action.replace(/_/g, " ")}</Badge></td>
                  <td className="p-4 text-foreground/70">{l.details}</td>
                  <td className="p-4 text-foreground/55">{l.userName}</td>
                  <td className="p-4 text-foreground/45">{formatDateTime(l.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && logs.length === 0 && (
          <EmptyState icon={<ScrollText size={22} />} title="No activity recorded yet" />
        )}
      </Card>
    </div>
  );
}
