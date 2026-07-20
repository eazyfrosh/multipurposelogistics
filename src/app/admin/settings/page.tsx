"use client";

import { toast } from "sonner";
import { Trash2, Settings as SettingsIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export default function AdminSettingsPage() {
  const { isDemoMode } = useAuth();

  function clearDemoData() {
    if (!confirm("This clears all locally-stored demo data (shipments, users, tickets, etc.) in this browser. Continue?")) return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("tracknova_"))
      .forEach((k) => window.localStorage.removeItem(k));
    toast.success("Demo data cleared. Reloading…");
    setTimeout(() => window.location.reload(), 800);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-foreground/55">Platform configuration.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon size={16} /> Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform name</Label>
            <Input defaultValue="TrackNova" disabled />
          </div>
          <div>
            <Label>Support email</Label>
            <Input defaultValue="support@tracknova.demo" disabled />
          </div>
          <p className="flex items-start gap-1.5 text-xs text-foreground/45">
            <Info size={13} className="mt-0.5 shrink-0" />
            Branding fields are read-only in this demo — wire them to a settings collection to make them editable.
          </p>
        </CardContent>
      </Card>

      {isDemoMode && (
        <Card className="mt-6 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-500">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60">
              Clear all shipments, users, and tickets stored in this browser&apos;s demo-mode storage.
            </p>
            <Button variant="danger" size="sm" className="mt-3" onClick={clearDemoData}>
              <Trash2 size={14} /> Clear demo data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
