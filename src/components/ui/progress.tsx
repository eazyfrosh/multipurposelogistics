import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  /** "carrier" reads --carrier-primary/secondary (see CarrierThemeScope). */
  tone?: "brand" | "carrier";
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          tone === "carrier"
            ? "bg-[linear-gradient(to_right,var(--carrier-primary),var(--carrier-secondary))]"
            : "bg-gradient-to-r from-brand-500 to-teal-accent-400"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
