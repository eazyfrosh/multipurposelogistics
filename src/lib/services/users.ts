import { getAll, upsert } from "@/lib/services/store";
import type { UserProfile, UserRole } from "@/types";

export async function getAllUsers() {
  const users = await getAll<UserProfile>("users");
  return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function setUserRole(user: UserProfile, role: UserRole) {
  await upsert<UserProfile>("users", { ...user, role });
}
