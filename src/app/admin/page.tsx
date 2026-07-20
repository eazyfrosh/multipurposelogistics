"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Package, DollarSign, Truck as TruckIcon, ScrollText } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { CarrierDistributionChart } from "@/components/dashboard/carrier-distribution-chart";
import { DeliveryStatusChart } from "@/components/dashboard/delivery-status-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllShipments } from "@/lib/services/shipments";
import { getAllUsers } from "@/lib/services/users";
import { getAllActivity } from "@/lib/services/activity";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, type ActivityLog, type Shipment, type UserProfile } from "@/types";

export default function AdminDashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllShipments(), getAllUsers(), getAllActivity()]).then(([s, u, a]) => {
      setShipments(s);
      setUsers(u);
      setActivity(a.slice(0, 10));
      setLoading(false);
    });
  }, []);

  const revenue = useMemo(() => shipments.reduce((sum, s) => sum + s.shippingCost, 0), [shipments]);

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

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    shipments.forEach((s) => counts.set(s.status, (counts.get(s.status) ?? 0) + 1));
    return Object.entries(STATUS_LABELS).map(([key, label]) => ({ label, value: counts.get(key) ?? 0 }));
  }, [shipments]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="text-sm text-foreground/55">Platform-wide statistics and activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Users" value={String(users.length)} icon={Users} tone="brand" />
            <StatCard label="Shipments" value={String(shipments.length)} icon={Package} tone="brand" />
            <StatCard label="Revenue" value={formatCurrency(revenue)} icon={DollarSign} tone="good" />
            <StatCard label="Active carriers" value={String(carrierData.length)} icon={TruckIcon} tone="neutral" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CarrierDistributionChart data={carrierData} />
        <DeliveryStatusChart data={statusData} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <EmptyState icon={<ScrollText size={20} />} title="No activity yet" />
          ) : (
            <ul className="divide-y divide-black/6 dark:divide-white/8">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.details}</p>
                    <p className="text-xs text-foreground/45">{a.userName} · {formatDateTime(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
