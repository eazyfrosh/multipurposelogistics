"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createShipment } from "@/lib/services/shipments";
import { downloadBulkImportTemplate, parseBulkImportCsv } from "@/lib/utils/bulk-import";
import { logActivity } from "@/lib/services/activity";

export function BulkImportDialog({
  open,
  onClose,
  userId,
  userName,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onComplete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  async function handleFile(file: File) {
    setProcessing(true);
    setResult(null);
    try {
      const text = await file.text();
      const { valid, errors } = parseBulkImportCsv(text, userId);
      for (const input of valid) {
        await createShipment(input, userName);
      }
      if (valid.length > 0) {
        await logActivity(userId, userName, "bulk_upload", "shipment", "-", `Bulk uploaded ${valid.length} shipments`);
      }
      setResult({ created: valid.length, errors });
      if (valid.length > 0) {
        toast.success(`${valid.length} shipment${valid.length === 1 ? "" : "s"} created`);
        onComplete();
      }
    } catch {
      toast.error("Failed to process file");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Bulk upload shipments">
      <div className="space-y-4">
        <p className="text-sm text-foreground/60">
          Upload a CSV file to create multiple shipments at once. Download the template to see the
          required columns.
        </p>
        <Button variant="outline" size="sm" onClick={downloadBulkImportTemplate}>
          <Download size={14} /> Download CSV template
        </Button>

        <div className="rounded-xl border border-dashed border-black/15 p-6 text-center dark:border-white/20">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Upload className="mx-auto text-foreground/40" size={24} />
          <p className="mt-2 text-sm text-foreground/60">Select a CSV file to upload</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3"
            disabled={processing}
            onClick={() => fileRef.current?.click()}
          >
            {processing ? "Processing…" : "Choose file"}
          </Button>
        </div>

        {result && (
          <div className="rounded-xl bg-black/5 p-3 text-sm dark:bg-white/5">
            <p className="font-medium">{result.created} shipment(s) created</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-32 list-disc space-y-1 overflow-y-auto pl-5 text-xs text-red-500">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
