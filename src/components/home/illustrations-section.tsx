"use client";

import { motion } from "framer-motion";
import {
  GlobalNetworkArt,
  WarehouseArt,
  LiveTrackingArt,
  AirSeaFreightArt,
  DoorstepDeliveryArt,
} from "@/components/home/logistics-illustrations";

const ITEMS = [
  { Art: GlobalNetworkArt, label: "Global network" },
  { Art: WarehouseArt, label: "Warehouse handling" },
  { Art: LiveTrackingArt, label: "Live tracking" },
  { Art: AirSeaFreightArt, label: "Air & sea freight" },
  { Art: DoorstepDeliveryArt, label: "Doorstep delivery" },
];

export function IllustrationsSection() {
  return (
    <section className="bg-black/[0.015] py-20 dark:bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Every step of the journey</h2>
          <p className="mt-3 text-foreground/60">From warehouse to doorstep, illustrated.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ITEMS.map(({ Art, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-black/8 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="h-20 w-20">
                <Art />
              </div>
              <p className="text-sm font-medium text-foreground/75">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
