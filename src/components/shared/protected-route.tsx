"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoadingState } from "@/components/ui/loading-state";

export function ProtectedRoute({
  children,
  requireAdmin,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (requireAdmin && profile && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, profile, requireAdmin, router]);

  if (loading || !user || (requireAdmin && profile?.role !== "admin")) {
    return <LoadingState label="Checking your session…" />;
  }

  return <>{children}</>;
}
