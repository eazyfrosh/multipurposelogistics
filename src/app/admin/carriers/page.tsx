"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getCarrierSettings, setCarrierActive } from "@/lib/services/carrier-settings";
import { logActivity } from "@/lib/services/activity";
import { SERVICE_LABELS } from "@/types";
import type { CarrierSetting } from "@/types";

export default function AdminCarriersPage() {
  const { user, profile } = useAuth();
  const [carriers, setCarriers] = useState<CarrierSetting[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    setCarriers(await getCarrierSettings());
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function toggle(c: CarrierSetting) {
    await setCarrierActive(c.code, !c.active);
    if (user) {
      await logActivity(user.uid, profile?.displayName ?? user.email, "carrier_updated", "carrier", c.code, `${!c.active ? "Enabled" : "Disabled"} ${c.name}`);
    }
    toast.success(`${c.name} ${!c.active ? "enabled" : "disabled"}`);
    reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Carriers</h1>
      <p className="text-sm text-foreground/55">Manage supported carrier integrations and service types.</p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
              <th className="p-4">Carrier</th>
              <th className="p-4">Prefix</th>
              <th className="p-4">Service types</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
            {!loading &&
              carriers.map((c) => (
                <tr key={c.code} className="border-b border-black/6 last:border-0 dark:border-white/8">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 font-mono text-xs text-foreground/60">{c.prefix}</td>
                  <td className="p-4 text-foreground/60">{c.serviceTypes.map((s) => SERVICE_LABELS[s]).join(", ")}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => toggle(c)}
                      className="cursor-pointer"
                    >
                      <Badge tone={c.active ? "green" : "neutral"}>{c.active ? "Active" : "Disabled"}</Badge>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
