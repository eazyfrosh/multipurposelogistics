"use client";

import { motion } from "framer-motion";
import { CARRIERS, CARRIER_DISCLAIMER, carrierMonogramColors } from "@/lib/data/carriers";

export function CarriersSection() {
  return (
    <section id="carriers" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Supported carrier integrations</h2>
        <p className="mt-3 text-foreground/60">
          TrackNova aggregates tracking across major carrier integrations, shown here with
          generic logo marks rather than official logos.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        {CARRIERS.map((carrier, i) => {
          const [from, to] = carrierMonogramColors(carrier.code);
          return (
            <motion.div
              key={carrier.code}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-black/8 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="relative">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-base font-bold tracking-tight text-white shadow-md"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 8px 20px -6px ${from}66` }}
                >
                  {carrier.prefix}
                </span>
                <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black/5 text-foreground/60 dark:border-[#0b0e17] dark:bg-white/10">
                  <carrier.icon size={12} />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{carrier.name}</p>
                <p className="text-xs text-foreground/45">{carrier.region}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-foreground/40">
        {CARRIER_DISCLAIMER}
      </p>
    </section>
  );
}
