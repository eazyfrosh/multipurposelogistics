"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  DollarSign,
  Plus,
  PackageSearch,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthlyShipmentsChart } from "@/components/dashboard/monthly-shipments-chart";
import { DeliveryStatusChart } from "@/components/dashboard/delivery-status-chart";
import { CarrierDistributionChart } from "@/components/dashboard/carrier-distribution-chart";
import { RecentActivity, type ActivityItem } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/context/auth-context";
import { getShipmentsByUser, getTrackingEvents } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, type Shipment } from "@/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DashboardHome() {
  const { user, profile } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const items = await getShipmentsByUser(user.uid);
      setShipments(items);

      const eventLists = await Promise.all(
        items.map(async (s) => {
          const events = await getTrackingEvents(s.id);
          return events.map((e) => ({ ...e, trackingNumber: s.trackingNumber }));
        })
      );
      const merged = eventLists
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
      setActivity(merged);
      setLoading(false);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const inTransit = shipments.filter((s) =>
      ["picked_up", "in_transit", "arrived_at_hub", "customs_clearance", "out_for_delivery"].includes(s.status)
    ).length;
    const pending = shipments.filter((s) => ["pending", "processing"].includes(s.status)).length;
    const cancelled = shipments.filter((s) => ["cancelled", "failed_delivery", "returned"].includes(s.status)).length;
    const revenue = shipments.reduce((sum, s) => sum + s.shippingCost, 0);
    return { total, delivered, inTransit, pending, cancelled, revenue };
  }, [shipments]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = shipments.filter((s) => {
        const created = new Date(s.createdAt);
        return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
      }).length;
      months.push({ month: MONTH_LABELS[d.getMonth()], count });
    }
    return months;
  }, [shipments]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    shipments.forEach((s) => counts.set(s.status, (counts.get(s.status) ?? 0) + 1));
    return Object.entries(STATUS_LABELS).map(([key, label]) => ({ label, value: counts.get(key) ?? 0 }));
  }, [shipments]);

  const carrierData = useMemo(() => {
    const counts = new Map<string, number>();
    shipments.forEach((s) => {
      const name = getCarrier(s.carrierCode).name;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([carrier, count]) => ({ carrier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [shipments]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.displayName?.split(" ")[0] ?? "there"}</h1>
          <p className="text-sm text-foreground/55">Here&apos;s what&apos;s happening with your shipments.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/track">
            <Button variant="outline" size="sm">
              <PackageSearch size={14} /> Track a shipment
            </Button>
          </Link>
          <Link href="/dashboard/shipments/new">
            <Button size="sm">
              <Plus size={14} /> New shipment
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total shipments" value={String(stats.total)} icon={Package} tone="brand" />
            <StatCard label="Delivered" value={String(stats.delivered)} icon={CheckCircle2} tone="good" />
            <StatCard label="In transit" value={String(stats.inTransit)} icon={Truck} tone="brand" />
            <StatCard label="Pending" value={String(stats.pending)} icon={Clock} tone="warning" />
            <StatCard label="Cancelled" value={String(stats.cancelled)} icon={XCircle} tone="critical" />
            <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={DollarSign} tone="neutral" />
          </>
        )}
      </div>

      {!loading && shipments.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Package size={22} />}
          title="No shipments yet"
          description="Create your first shipment to see analytics and activity here."
          action={
            <Link href="/dashboard/shipments/new">
              <Button size="sm">
                <Plus size={14} /> Create a shipment
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <MonthlyShipmentsChart data={monthlyData} />
            <DeliveryStatusChart data={statusData} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CarrierDistributionChart data={carrierData} />
            <RecentActivity items={activity} />
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardHome />;
}
