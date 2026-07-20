import { getAll, upsert } from "@/lib/services/store";
import { generateId } from "@/lib/utils";
import type { ActivityAction, ActivityLog } from "@/types";

export async function getAllActivity() {
  const items = await getAll<ActivityLog>("activity_logs");
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function logActivity(
  userId: string,
  userName: string,
  action: ActivityAction,
  targetType: string,
  targetId: string,
  details: string
) {
  const entry: ActivityLog = {
    id: generateId("act_"),
    userId,
    userName,
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  };
  await upsert<ActivityLog>("activity_logs", entry);
  return entry;
}
