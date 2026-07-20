"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardNav />
      {children}
    </ProtectedRoute>
  );
}
