"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function DemoBanner() {
  const { isDemoMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  if (!isDemoMode || dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-teal-accent-500 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <Info size={14} className="shrink-0" />
      <span>
        Demo mode — data is stored in this browser only. TrackNova is a fictional platform for
        demonstration purposes and is not affiliated with any real carrier.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 rounded-full p-1 transition hover:bg-white/20"
      >
        <X size={14} />
      </button>
    </div>
  );
}
