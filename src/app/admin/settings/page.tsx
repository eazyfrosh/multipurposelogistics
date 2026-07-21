"use client";

import { Settings as SettingsIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function AdminSettingsPage() {
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
    </div>
  );
}
