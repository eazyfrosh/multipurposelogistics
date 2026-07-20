"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { MonthlyShipmentsChart } from "@/components/dashboard/monthly-shipments-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { getAllShipments } from "@/lib/services/shipments";
import { exportShipmentsCsv, exportShipmentsExcel } from "@/lib/utils/export";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency } from "@/lib/utils";
import { Package, DollarSign, TrendingUp, PackageCheck } from "lucide-react";
import type { Shipment } from "@/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminReportsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllShipments().then((s) => {
      setShipments(s);
      setLoading(false);
    });
  }, []);

  const revenue = useMemo(() => shipments.reduce((sum, s) => sum + s.shippingCost, 0), [shipments]);
  const delivered = useMemo(() => shipments.filter((s) => s.status === "delivered").length, [shipments]);
  const avgCost = shipments.length > 0 ? revenue / shipments.length : 0;

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = shipments.filter((s) => {
        const created = new Date(s.createdAt);
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
      }).length;
      months.push({ month: MONTH_LABELS[d.getMonth()], count });
    }
    return months;
  }, [shipments]);

  const topCarriers = useMemo(() => {
    const counts = new Map<string, number>();
    shipments.forEach((s) => {
      const name = getCarrier(s.carrierCode).name;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [shipments]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-foreground/55">Platform performance overview and data export.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportShipmentsCsv(shipments)}>
            <Download size={14} /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportShipmentsExcel(shipments)}>
            <FileSpreadsheet size={14} /> Export Excel
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total shipments" value={String(shipments.length)} icon={Package} tone="brand" />
            <StatCard label="Delivered" value={String(delivered)} icon={PackageCheck} tone="good" />
            <StatCard label="Total revenue" value={formatCurrency(revenue)} icon={DollarSign} tone="neutral" />
            <StatCard label="Avg. shipping cost" value={formatCurrency(avgCost)} icon={TrendingUp} tone="brand" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyShipmentsChart data={monthlyData} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Top carriers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {topCarriers.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="font-medium tabular-nums text-foreground/60">{count}</span>
                </li>
              ))}
              {topCarriers.length === 0 && <p className="text-foreground/45">No data yet</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
