import { Boxes } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/types";

export function EmailPreview({ notification, recipientEmail }: { notification: AppNotification; recipientEmail: string }) {
  return (
    <div>
      <p className="mb-3 text-center text-xs text-foreground/40">
        This is a simulated preview — no email is actually sent.
      </p>
      <div className="overflow-hidden rounded-2xl border border-black/10 shadow-lg dark:border-white/10">
        <div className="space-y-1 bg-black/[0.03] px-5 py-4 text-xs text-foreground/60 dark:bg-white/5">
          <p><span className="font-semibold text-foreground/80">From:</span> TrackNova &lt;no-reply@tracknova.demo&gt;</p>
          <p><span className="font-semibold text-foreground/80">To:</span> {recipientEmail}</p>
          <p><span className="font-semibold text-foreground/80">Subject:</span> {notification.title}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900">
          <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-6 text-center text-white">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Boxes size={20} />
            </span>
            <p className="mt-2 text-lg font-bold">TrackNova</p>
          </div>

          <div className="px-6 py-6">
            <p className="text-base font-semibold">{notification.title}</p>
            <p className="mt-2 text-sm text-foreground/70">{notification.message}</p>
            <p className="mt-4 text-xs text-foreground/40">Sent {formatDateTime(notification.createdAt)}</p>
          </div>

          <div className="border-t border-black/8 bg-black/[0.02] px-6 py-4 text-center text-[11px] text-foreground/40 dark:border-white/10 dark:bg-white/5">
            TrackNova Demo · This is a portfolio project. No real shipments or emails are involved.
          </div>
        </div>
      </div>
    </div>
  );
}
