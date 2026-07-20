"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useChartPalette } from "@/lib/chart-colors";
import { BarChart3 } from "lucide-react";

export function MonthlyShipmentsChart({ data }: { data: { month: string; count: number }[] }) {
  const { sequential, ink } = useChartPalette();
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly shipments</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke={ink.grid} />
              <XAxis dataKey="month" tick={{ fill: ink.muted, fontSize: 12 }} axisLine={{ stroke: ink.grid }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: ink.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: ink.grid, opacity: 0.4 }}
                contentStyle={{ borderRadius: 10, border: "none", fontSize: 13 }}
              />
              <Bar dataKey="count" name="Shipments" fill={sequential[3]} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<BarChart3 size={20} />} title="No data yet" description="Create shipments to see monthly trends." />
        )}
      </CardContent>
    </Card>
  );
}
