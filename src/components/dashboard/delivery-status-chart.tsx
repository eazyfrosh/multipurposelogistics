"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useChartPalette } from "@/lib/chart-colors";
import { PieChart as PieChartIcon } from "lucide-react";

export function DeliveryStatusChart({ data }: { data: { label: string; value: number }[] }) {
  const { categorical, ink } = useChartPalette();
  const filtered = data.filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery status</CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length > 0 ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-[220px] w-full sm:w-[220px] sm:shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                  data={filtered}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={filtered.length > 1 ? 2 : 0}
                >
                  {filtered.map((entry, i) => (
                    <Cell key={entry.label} fill={categorical[i % categorical.length]} stroke="none" />
                  ))}
                </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid flex-1 grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {filtered.map((entry, i) => (
                <li key={entry.label} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categorical[i % categorical.length] }}
                  />
                  <span className="text-foreground/70">{entry.label}</span>
                  <span className="ml-auto font-medium tabular-nums" style={{ color: ink.secondary }}>
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState icon={<PieChartIcon size={20} />} title="No data yet" description="Status breakdown appears once you have shipments." />
        )}
      </CardContent>
    </Card>
  );
}
