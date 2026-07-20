import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-accent-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
