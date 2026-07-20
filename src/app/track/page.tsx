"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { findShipment } from "@/lib/services/shipments";

function TrackSearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function runSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setNotFound(false);
    const result = await findShipment(q);
    if (result) {
      router.push(`/track/${result.id}`);
      return;
    }
    setNotFound(true);
    setSearching(false);
  }

  useEffect(() => {
    const q = params.get("q");
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(value);
  }

  if (searching) return <LoadingState label="Looking up your shipment…" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-accent-500 text-white shadow-lg shadow-brand-500/25">
          <PackageSearch size={24} />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Track your shipment</h1>
        <p className="mt-2 text-foreground/60">Enter a tracking number, reference number, or shipment number.</p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-8 flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-sm sm:flex-row dark:border-white/10 dark:bg-white/[0.03]">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. FDX482252259"
          className="w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-foreground/40"
          autoFocus
        />
        <Button type="submit" size="lg" className="shrink-0">
          Track <ArrowRight size={16} />
        </Button>
      </form>

      {notFound && (
        <div className="mx-auto mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/15 p-8 text-center dark:border-white/20">
          <SearchX size={22} className="text-foreground/40" />
          <p className="font-medium text-foreground/70">No shipment found</p>
          <p className="text-sm text-foreground/50">Double-check the number and try again.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TrackSearchInner />
    </Suspense>
  );
}
