"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export function DocumentLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="no-print mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer size={14} /> Print / Download PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none dark:border-white/10 dark:bg-white/[0.03] print:dark:bg-white">
        <div className="flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10">
          <Logo />
          <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">{title}</p>
        </div>
        <div className="mt-6">{children}</div>
        <p className="mt-8 border-t border-black/10 pt-4 text-center text-[11px] text-foreground/40 dark:border-white/10">
          TrackNova is a fictional demo platform. This document is simulated and holds no legal or shipping value.
        </p>
      </div>
    </div>
  );
}
