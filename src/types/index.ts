export type UserRole = "user" | "admin";

export interface NotificationPrefs {
  shipmentCreated: boolean;
  pickedUp: boolean;
  inTransit: boolean;
  delayed: boolean;
  outForDelivery: boolean;
  delivered: boolean;
  returned: boolean;
}

export const defaultNotificationPrefs: NotificationPrefs = {
  shipmentCreated: true,
  pickedUp: true,
  inTransit: true,
  delayed: true,
  outForDelivery: true,
  delivered: true,
  returned: true,
};

export interface ApiKey {
  id: string;
  label: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  createdAt: string;
  notificationPrefs: NotificationPrefs;
  apiKeys: ApiKey[];
  plan?: "starter" | "growth" | "enterprise";
}

export type ShipmentStatus =
  | "pending"
  | "processing"
  | "picked_up"
  | "in_transit"
  | "arrived_at_hub"
  | "customs_clearance"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery"
  | "returned"
  | "cancelled";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "pending",
  "processing",
  "picked_up",
  "in_transit",
  "arrived_at_hub",
  "customs_clearance",
  "out_for_delivery",
  "delivered",
  "failed_delivery",
  "returned",
  "cancelled",
];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_hub: "Arrived at Hub",
  customs_clearance: "Customs Clearance",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed_delivery: "Failed Delivery",
  returned: "Returned",
  cancelled: "Cancelled",
};

export type ServiceType = "express" | "economy" | "priority" | "standard";

export const SERVICE_TYPES: ServiceType[] = ["express", "economy", "priority", "standard"];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  express: "Express",
  economy: "Economy",
  priority: "Priority",
  standard: "Standard",
};

export type PackageType = "box" | "envelope" | "pallet" | "tube" | "crate" | "bag";

export const PACKAGE_TYPES: PackageType[] = ["box", "envelope", "pallet", "tube", "crate", "bag"];

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface PackageInfo {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  packageType: PackageType;
  description?: string;
}

export interface ShipmentAttachment {
  id: string;
  name: string;
  url: string;
  contentType: string;
  kind: "image" | "video";
  sizeBytes: number;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  trackingNumber: string;
  referenceNumber?: string;
  carrierCode: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  sender: ContactInfo;
  receiver: ContactInfo;
  package: PackageInfo;
  specialInstructions?: string;
  estimatedDeliveryDate: string;
  shippingCost: number;
  insured: boolean;
  insuranceValue?: number;
  attachments: ShipmentAttachment[];
  verificationToken: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  notes?: string;
  proofOfDeliveryUrl?: string;
  timestamp: string;
  createdBy?: string;
}

export type NotificationType =
  | "shipment_created"
  | "picked_up"
  | "in_transit"
  | "delayed"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  shipmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketReply {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  shipmentId?: string;
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CarrierSetting {
  id: string;
  code: string;
  name: string;
  prefix: string;
  active: boolean;
  serviceTypes: ServiceType[];
}

export type ActivityAction =
  | "shipment_created"
  | "shipment_updated"
  | "shipment_deleted"
  | "status_updated"
  | "event_added"
  | "user_role_changed"
  | "user_created"
  | "ticket_created"
  | "ticket_updated"
  | "carrier_updated"
  | "bulk_upload"
  | "bulk_status_update"
  | "notification_sent";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}
