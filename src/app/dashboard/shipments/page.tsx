"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Upload,
  ListChecks,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { StatusBadge } from "@/components/shared/status-badge";
import { BulkImportDialog } from "@/components/shipments/bulk-import-dialog";
import { BulkStatusDialog } from "@/components/shipments/bulk-status-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getShipmentsByUser, updateShipment } from "@/lib/services/shipments";
import { logActivity } from "@/lib/services/activity";
import { exportShipmentsCsv, exportShipmentsExcel } from "@/lib/utils/export";
import { getCarrier, ALL_CARRIERS } from "@/lib/data/carriers";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { SHIPMENT_STATUSES, STATUS_LABELS, type Shipment, type ShipmentStatus } from "@/types";

const PAGE_SIZE = 10;

function ShipmentsList() {
  const { user, profile } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  async function reload() {
    if (!user) return;
    setLoading(true);
    const items = await getShipmentsByUser(user.uid);
    setShipments(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (carrierFilter !== "all" && s.carrierCode !== carrierFilter) return false;
      if (!q) return true;
      return (
        s.trackingNumber.toLowerCase().includes(q) ||
        s.shipmentNumber.toLowerCase().includes(q) ||
        (s.referenceNumber ?? "").toLowerCase().includes(q) ||
        s.receiver.name.toLowerCase().includes(q)
      );
    });
  }, [shipments, search, statusFilter, carrierFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, statusFilter, carrierFilter]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = paged.every((s) => next.has(s.id));
      paged.forEach((s) => (allSelected ? next.delete(s.id) : next.add(s.id)));
      return next;
    });
  }

  async function applyBulkStatus(status: ShipmentStatus) {
    const targets = shipments.filter((s) => selected.has(s.id));
    for (const s of targets) {
      await updateShipment({ ...s, status });
    }
    if (user && targets.length > 0) {
      await logActivity(
        user.uid,
        profile?.displayName ?? user.email,
        "bulk_status_update",
        "shipment",
        "-",
        `Updated ${targets.length} shipments to ${STATUS_LABELS[status]}`
      );
    }
    setSelected(new Set());
    reload();
  }

  const selectedShipments = shipments.filter((s) => selected.has(s.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Shipments</h1>
          <p className="text-sm text-foreground/55">Manage and track all of your shipments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={14} /> Bulk upload
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportShipmentsCsv(filtered)}>
            <Download size={14} /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportShipmentsExcel(filtered)}>
            <FileSpreadsheet size={14} /> Excel
          </Button>
          <Link href="/dashboard/shipments/new">
            <Button size="sm">
              <Plus size={14} /> New shipment
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-black/12 px-3 dark:border-white/15">
            <Search size={15} className="text-foreground/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking #, reference #, shipment #, or receiver…"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-foreground/40"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48">
            <option value="all">All statuses</option>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="sm:w-48">
            <option value="all">All carriers</option>
            {ALL_CARRIERS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-2.5 text-sm dark:bg-brand-500/10">
          <ListChecks size={16} className="text-brand-600 dark:text-brand-400" />
          <span>{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={() => setBulkStatusOpen(true)}>
            Update status
          </Button>
          <Button size="sm" variant="ghost" onClick={() => exportShipmentsCsv(selectedShipments)}>
            Export selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
              <th className="w-10 p-4">
                <input
                  type="checkbox"
                  checked={paged.length > 0 && paged.every((s) => selected.has(s.id))}
                  onChange={toggleSelectAllOnPage}
                />
              </th>
              <th className="p-4">Tracking #</th>
              <th className="p-4">Receiver</th>
              <th className="p-4">Carrier</th>
              <th className="p-4">Status</th>
              <th className="p-4">Est. Delivery</th>
              <th className="p-4">Cost</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
            {!loading &&
              paged.map((s) => (
                <tr key={s.id} className="border-b border-black/6 last:border-0 hover:bg-black/[0.02] dark:border-white/8 dark:hover:bg-white/[0.02]">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} />
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/shipments/${s.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                      {s.trackingNumber}
                    </Link>
                    <p className="text-xs text-foreground/45">{s.shipmentNumber}</p>
                  </td>
                  <td className="p-4">{s.receiver.name}</td>
                  <td className="p-4">{getCarrier(s.carrierCode).name}</td>
                  <td className="p-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="p-4 text-foreground/65">{formatDateShort(s.estimatedDeliveryDate)}</td>
                  <td className="p-4 text-foreground/65">{formatCurrency(s.shippingCost)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={<PackageSearch size={22} />}
            title="No shipments found"
            description="Try adjusting your filters, or create your first shipment."
            action={
              <Link href="/dashboard/shipments/new">
                <Button size="sm">
                  <Plus size={14} /> New shipment
                </Button>
              </Link>
            }
          />
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-foreground/55">
          <span>
            Page {page} of {totalPages} · {filtered.length} shipments
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {user && (
        <BulkImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          userId={user.uid}
          userName={profile?.displayName ?? user.email}
          onComplete={reload}
        />
      )}
      <BulkStatusDialog
        open={bulkStatusOpen}
        onClose={() => setBulkStatusOpen(false)}
        count={selected.size}
        onApply={applyBulkStatus}
      />
    </div>
  );
}

export default function ShipmentsPage() {
  return (
    <ProtectedRoute>
      <ShipmentsList />
    </ProtectedRoute>
  );
}
