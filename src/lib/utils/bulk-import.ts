import type { CreateShipmentInput } from "@/lib/services/shipments";
import { ALL_CARRIERS } from "@/lib/data/carriers";
import type { ServiceType } from "@/types";

const REQUIRED_HEADERS = [
  "senderName",
  "senderEmail",
  "senderPhone",
  "senderAddress",
  "senderCity",
  "senderCountry",
  "senderPostalCode",
  "receiverName",
  "receiverEmail",
  "receiverPhone",
  "receiverAddress",
  "receiverCity",
  "receiverCountry",
  "receiverPostalCode",
  "carrierCode",
  "serviceType",
  "weightKg",
  "lengthCm",
  "widthCm",
  "heightCm",
  "shippingCost",
  "estimatedDeliveryDate",
];

export const BULK_IMPORT_TEMPLATE_HEADERS = [...REQUIRED_HEADERS, "referenceNumber", "packageType", "description"];

export interface BulkImportResult {
  valid: CreateShipmentInput[];
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseBulkImportCsv(text: string, userId: string): BulkImportResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  const valid: CreateShipmentInput[] = [];
  if (lines.length < 2) {
    return { valid, errors: ["File must contain a header row and at least one data row."] };
  }
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { valid, errors: [`Missing required columns: ${missing.join(", ")}`] };
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));

    const rowNum = i + 1;
    const carrier = ALL_CARRIERS.find((c) => c.code === row.carrierCode);
    if (!carrier) {
      errors.push(`Row ${rowNum}: unknown carrierCode "${row.carrierCode}"`);
      continue;
    }
    const serviceType = row.serviceType as ServiceType;
    if (!["express", "economy", "priority", "standard"].includes(serviceType)) {
      errors.push(`Row ${rowNum}: invalid serviceType "${row.serviceType}"`);
      continue;
    }
    const weightKg = Number(row.weightKg);
    const lengthCm = Number(row.lengthCm);
    const widthCm = Number(row.widthCm);
    const heightCm = Number(row.heightCm);
    const shippingCost = Number(row.shippingCost);
    if ([weightKg, lengthCm, widthCm, heightCm, shippingCost].some((n) => Number.isNaN(n))) {
      errors.push(`Row ${rowNum}: package dimensions/cost must be numeric`);
      continue;
    }
    if (!row.senderName || !row.receiverName) {
      errors.push(`Row ${rowNum}: sender and receiver names are required`);
      continue;
    }

    valid.push({
      userId,
      carrierCode: carrier.code,
      serviceType,
      referenceNumber: row.referenceNumber || undefined,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        phone: row.senderPhone,
        address: row.senderAddress,
        city: row.senderCity,
        country: row.senderCountry,
        postalCode: row.senderPostalCode,
      },
      receiver: {
        name: row.receiverName,
        email: row.receiverEmail,
        phone: row.receiverPhone,
        address: row.receiverAddress,
        city: row.receiverCity,
        country: row.receiverCountry,
        postalCode: row.receiverPostalCode,
      },
      package: {
        weightKg,
        lengthCm,
        widthCm,
        heightCm,
        packageType: (row.packageType as CreateShipmentInput["package"]["packageType"]) || "box",
        description: row.description || undefined,
      },
      estimatedDeliveryDate: row.estimatedDeliveryDate,
      shippingCost,
      insured: false,
    });
  }

  return { valid, errors };
}

export function downloadBulkImportTemplate() {
  const sample = [
    "Jane Doe,jane@example.com,+1 555 000 1111,123 Main St,Austin,United States,73301,John Smith,john@example.com,+1 555 000 2222,45 High St,London,United Kingdom,SW1A 1AA,FEDEX,express,2.5,30,20,15,45.00,2026-08-01,,box,Sample package",
  ];
  const csv = [BULK_IMPORT_TEMPLATE_HEADERS.join(","), ...sample].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shipment-bulk-import-template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
