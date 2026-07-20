import { getAll, queryByField, upsert } from "@/lib/services/store";
import { generateId } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types";

export interface PushNotificationInput {
  userId: string;
  shipmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
}

export async function pushNotification(input: PushNotificationInput): Promise<AppNotification> {
  const notification: AppNotification = {
    id: generateId("ntf_"),
    userId: input.userId,
    shipmentId: input.shipmentId,
    type: input.type,
    title: input.title,
    message: input.message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await upsert("notifications", notification);
  return notification;
}

export async function getNotificationsForUser(userId: string) {
  const items = await queryByField<AppNotification>("notifications", "userId", userId);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllNotifications() {
  const items = await getAll<AppNotification>("notifications");
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(notification: AppNotification) {
  await upsert("notifications", { ...notification, read: true });
}
