import Link from "next/link";
import { Boxes } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold ${className ?? ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-accent-500 text-white shadow-lg shadow-brand-500/30">
        <Boxes size={17} />
      </span>
      <span className="text-lg tracking-tight">TrackNova</span>
    </Link>
  );
}
