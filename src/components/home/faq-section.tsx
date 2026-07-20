"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is TrackNova connected to real carriers like DHL, FedEx, or UPS?",
    a: "No. TrackNova is a fictional demo platform. Carrier names are shown as illustrative \"supported integrations\" using generic icons — no real carrier APIs, logos, or trademarks are used, and no real shipments are ever created.",
  },
  {
    q: "How are tracking numbers generated?",
    a: "Each shipment gets a unique tracking number with a prefix matching its selected carrier (e.g. FDX for FedEx-style, DHL for DHL-style), followed by random digits — similar to real-world tracking number formats.",
  },
  {
    q: "Can I use this without creating a Firebase project?",
    a: "Yes. TrackNova ships with a local demo mode that stores everything in your browser, including a seeded admin account, so you can explore every feature without any setup.",
  },
  {
    q: "What happens when I scan a shipment's QR code?",
    a: "It opens that shipment's public tracking page, letting anyone with the code (or the tracking number) view its live status timeline without signing in.",
  },
  {
    q: "Can admins edit tracking events after a shipment is created?",
    a: "Yes. Admins have a full tracking event editor to add checkpoints, change status, update delivery dates, attach proof of delivery, and trigger notifications.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
      </div>
      <div className="mt-10 space-y-3">
        {FAQS.map((item, i) => {
          const expanded = open === i;
          return (
            <div key={item.q} className="overflow-hidden rounded-2xl border border-black/8 bg-white dark:border-white/10 dark:bg-white/[0.03]">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium">{item.q}</span>
                <ChevronDown size={18} className={cn("shrink-0 text-foreground/40 transition-transform", expanded && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-foreground/60">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
