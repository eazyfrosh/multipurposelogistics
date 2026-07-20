"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users as UsersIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getAllUsers, setUserRole } from "@/lib/services/users";
import { logActivity } from "@/lib/services/activity";
import { formatDateShort } from "@/lib/utils";
import type { UserProfile, UserRole } from "@/types";

export default function AdminUsersPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    setUsers(await getAllUsers());
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function changeRole(target: UserProfile, role: UserRole) {
    await setUserRole(target, role);
    if (user) {
      await logActivity(
        user.uid,
        profile?.displayName ?? user.email,
        "user_role_changed",
        "user",
        target.uid,
        `Changed ${target.displayName}'s role to ${role}`
      );
    }
    toast.success(`${target.displayName} is now ${role}`);
    reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-foreground/55">Manage accounts and role permissions.</p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-black/8 text-left text-xs uppercase tracking-wide text-foreground/45 dark:border-white/10">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
            {!loading &&
              users.map((u) => (
                <tr key={u.id} className="border-b border-black/6 last:border-0 dark:border-white/8">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.displayName} />
                      <div>
                        <p className="font-medium">{u.displayName}</p>
                        {u.company && <p className="text-xs text-foreground/45">{u.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground/65">{u.email}</td>
                  <td className="p-4 text-foreground/65">{formatDateShort(u.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value as UserRole)}
                        className="w-32"
                        disabled={u.uid === user?.uid}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Select>
                      {u.role === "admin" && <Badge tone="brand">Admin</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <EmptyState icon={<UsersIcon size={22} />} title="No users yet" />
        )}
      </Card>
    </div>
  );
}
