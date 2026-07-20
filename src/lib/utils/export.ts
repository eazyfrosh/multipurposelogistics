import * as XLSX from "xlsx";
import { STATUS_LABELS, SERVICE_LABELS, type Shipment } from "@/types";
import { getCarrier } from "@/lib/data/carriers";

function shipmentRows(shipments: Shipment[]) {
  return shipments.map((s) => ({
    "Shipment #": s.shipmentNumber,
    "Tracking #": s.trackingNumber,
    "Reference #": s.referenceNumber ?? "",
    Carrier: getCarrier(s.carrierCode).name,
    Service: SERVICE_LABELS[s.serviceType],
    Status: STATUS_LABELS[s.status],
    Sender: s.sender.name,
    "Sender City": s.sender.city,
    "Sender Country": s.sender.country,
    Receiver: s.receiver.name,
    "Receiver City": s.receiver.city,
    "Receiver Country": s.receiver.country,
    "Weight (kg)": s.package.weightKg,
    "Cost (USD)": s.shippingCost,
    "Est. Delivery": s.estimatedDeliveryDate?.slice(0, 10) ?? "",
    "Created At": s.createdAt.slice(0, 10),
  }));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportShipmentsCsv(shipments: Shipment[]) {
  const rows = shipmentRows(shipments);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h as keyof typeof row])).join(",")),
  ];
  downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), "shipments.csv");
}

export function exportShipmentsExcel(shipments: Shipment[]) {
  const rows = shipmentRows(shipments);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([buffer], { type: "application/octet-stream" }),
    "shipments.xlsx"
  );
}
