"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { useAuth } from "@/context/auth-context";
import { getAllShipments, getShipmentsByUser } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import type { Shipment } from "@/types";

export function GlobalSearch() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    const loader = profile?.role === "admin" ? getAllShipments() : getShipmentsByUser(user.uid);
    loader.then(setShipments);
  }, [open, user, profile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return shipments
      .filter((s) => {
        const carrierName = getCarrier(s.carrierCode).name.toLowerCase();
        return (
          s.trackingNumber.toLowerCase().includes(q) ||
          s.shipmentNumber.toLowerCase().includes(q) ||
          (s.referenceNumber ?? "").toLowerCase().includes(q) ||
          s.sender.name.toLowerCase().includes(q) ||
          s.receiver.name.toLowerCase().includes(q) ||
          carrierName.includes(q)
        );
      })
      .slice(0, 8);
  }, [shipments, query]);

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Search size={17} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Search shipments" className="max-w-lg">
        <div className="flex items-center gap-2 rounded-xl border border-black/12 px-3 dark:border-white/15">
          <Search size={15} className="text-foreground/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tracking #, customer, carrier, or reference…"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-foreground/40"
          />
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground/45">No matches found</p>
          )}
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
                router.push(`/dashboard/shipments/${s.id}`);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CarrierLogo carrier={s.carrierCode} size={26} bare />
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.trackingNumber}</p>
                  <p className="truncate text-xs text-foreground/50">
                    {getCarrier(s.carrierCode).name} · {s.sender.name} → {s.receiver.name}
                  </p>
                </div>
              </div>
              <StatusBadge status={s.status} className="shrink-0" />
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
