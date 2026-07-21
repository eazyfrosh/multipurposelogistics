"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { EmptyState } from "@/components/ui/empty-state";
import { CARRIERS, CARRIER_DISCLAIMER } from "@/lib/data/carriers";

export function CarriersSection() {
  return (
    <section id="carriers" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Supported carrier integrations</h2>
        <p className="mt-3 text-foreground/60">
          TrackNova aggregates tracking across major carrier integrations worldwide.
        </p>
      </div>

      {CARRIERS.length === 0 ? (
        <EmptyState
          className="mx-auto mt-10 max-w-lg"
          icon={<Truck size={22} />}
          title="Carrier integrations coming soon"
          description="Carrier logos are being onboarded — check back shortly."
        />
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CARRIERS.map((carrier, i) => (
            <motion.div
              key={carrier.code}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: (i % 10) * 0.03 }}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-black/8 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              <CarrierLogo carrier={carrier.code} size={40} />
              <div>
                <p className="text-xs font-semibold leading-tight">{carrier.name}</p>
                <p className="text-[11px] text-foreground/45">{carrier.region}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-foreground/40">
        {CARRIER_DISCLAIMER}
      </p>
    </section>
  );
}
