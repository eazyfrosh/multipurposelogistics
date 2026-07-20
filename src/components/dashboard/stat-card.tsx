import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "brand" | "good" | "warning" | "critical" | "neutral";
}) {
  const toneClasses: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
    good: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    critical: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
    neutral: "bg-black/5 text-foreground/60 dark:bg-white/10",
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/55">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", toneClasses[tone])}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}
