import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-black/8 dark:bg-white/10", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}
