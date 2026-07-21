"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Plus, Trash2, CreditCard, ShieldCheck, User as UserIcon, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { generateId } from "@/lib/utils";
import { profileSchema, type ProfileValues } from "@/lib/validation/profile";
import type { NotificationPrefs } from "@/types";

const NOTIF_LABELS: Record<keyof NotificationPrefs, string> = {
  shipmentCreated: "Shipment created",
  pickedUp: "Picked up",
  inTransit: "In transit",
  delayed: "Delayed",
  outForDelivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
};

export default function ProfilePage() {
  const { user, profile, resetPassword, updateUserProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [genKeyLabel, setGenKeyLabel] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      company: profile?.company ?? "",
      phone: profile?.phone ?? "",
    },
  });

  async function onSaveProfile(values: ProfileValues) {
    setSaving(true);
    try {
      await updateUserProfile(values);
      toast.success("Profile updated");
    } finally {
      setSaving(false);
    }
  }

  async function sendReset() {
    if (!user) return;
    setSendingReset(true);
    try {
      await resetPassword(user.email);
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setSendingReset(false);
    }
  }

  async function toggleNotif(key: keyof NotificationPrefs) {
    if (!profile) return;
    await updateUserProfile({
      notificationPrefs: { ...profile.notificationPrefs, [key]: !profile.notificationPrefs[key] },
    });
  }

  async function generateApiKey() {
    if (!profile) return;
    const raw = generateId();
    const key = {
      id: generateId("key_"),
      label: genKeyLabel.trim() || "Untitled key",
      keyPreview: `tn_live_${raw.slice(0, 4)}…${raw.slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    await updateUserProfile({ apiKeys: [...profile.apiKeys, key] });
    setGenKeyLabel("");
    toast.success("API key generated (demo)");
  }

  async function removeApiKey(id: string) {
    if (!profile) return;
    await updateUserProfile({ apiKeys: profile.apiKeys.filter((k) => k.id !== id) });
  }

  if (!profile || !user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Avatar name={profile.displayName} className="h-14 w-14 text-base" />
        <div>
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-sm text-foreground/55">{profile.email}</p>
        </div>
        {profile.role === "admin" && <Badge tone="brand" className="ml-auto">Admin</Badge>}
      </div>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile"><UserIcon size={13} className="mr-1 inline" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck size={13} className="mr-1 inline" /> Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell size={13} className="mr-1 inline" /> Notifications</TabsTrigger>
          <TabsTrigger value="api"><KeyRound size={13} className="mr-1 inline" /> API Keys</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard size={13} className="mr-1 inline" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Profile information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <div>
                  <Label>Full name</Label>
                  <Input {...register("displayName")} />
                  <FieldError>{errors.displayName?.message}</FieldError>
                </div>
                <div>
                  <Label>Company</Label>
                  <Input {...register("company")} placeholder="Acme Inc." />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} placeholder="+1 555 000 1234" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile.email} disabled />
                </div>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Password</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/60">
                For security, password changes are handled by email — we&apos;ll send a reset link to {profile.email}.
              </p>
              <Button className="mt-3" variant="outline" onClick={sendReset} disabled={sendingReset}>
                {sendingReset ? "Sending…" : "Send password reset email"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Email notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(NOTIF_LABELS) as (keyof NotificationPrefs)[]).map((key) => (
                <label key={key} className="flex items-center justify-between text-sm">
                  <span>{NOTIF_LABELS[key]}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={profile.notificationPrefs[key]}
                    onChange={() => toggleNotif(key)}
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-5">
          <Card>
            <CardHeader><CardTitle>API keys (demo)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/60">
                Simulated API keys for demonstration — no real API is exposed.
              </p>
              <div className="mt-3 flex gap-2">
                <Input value={genKeyLabel} onChange={(e) => setGenKeyLabel(e.target.value)} placeholder="Key label (e.g. Production)" />
                <Button onClick={generateApiKey}><Plus size={14} /> Generate</Button>
              </div>
              <ul className="mt-4 divide-y divide-black/6 dark:divide-white/8">
                {profile.apiKeys.map((k) => (
                  <li key={k.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{k.label}</p>
                      <p className="font-mono text-xs text-foreground/45">{k.keyPreview}</p>
                    </div>
                    <button onClick={() => removeApiKey(k.id)} className="text-red-500 hover:text-red-600" aria-label="Revoke key">
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
                {profile.apiKeys.length === 0 && <p className="py-4 text-sm text-foreground/45">No API keys yet.</p>}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Billing (demo)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-black/5 p-4 dark:bg-white/5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-foreground/45">Current plan</p>
                  <p className="text-lg font-bold capitalize">{profile.plan ?? "starter"}</p>
                </div>
                <Button variant="secondary" onClick={() => toast.info("Billing is simulated in this demo")}>
                  Upgrade plan
                </Button>
              </div>
              <p className="mt-4 text-sm text-foreground/50">No invoices yet — this is a demo billing panel with no real payment processing.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
