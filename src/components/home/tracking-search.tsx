"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackingSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/track?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/20 sm:flex-row dark:bg-white/[0.06] ${className ?? ""}`}
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl px-3.5 py-2.5">
        <PackageSearch size={18} className="shrink-0 text-foreground/40" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter tracking, reference, or shipment number"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
        />
      </div>
      <Button type="submit" size="lg" className="shrink-0">
        Track shipment <ArrowRight size={16} />
      </Button>
    </form>
  );
}
