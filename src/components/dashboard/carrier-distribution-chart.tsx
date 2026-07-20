"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useChartPalette } from "@/lib/chart-colors";
import { Globe2 } from "lucide-react";

export function CarrierDistributionChart({ data }: { data: { carrier: string; count: number }[] }) {
  const { sequential, ink } = useChartPalette();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrier distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 42)}>
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke={ink.grid} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: ink.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="carrier"
                width={100}
                tick={{ fill: ink.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: ink.grid, opacity: 0.4 }} contentStyle={{ borderRadius: 10, border: "none", fontSize: 13 }} />
              <Bar dataKey="count" name="Shipments" fill={sequential[3]} radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={<Globe2 size={20} />} title="No data yet" description="Carrier usage appears once you have shipments." />
        )}
      </CardContent>
    </Card>
  );
}
