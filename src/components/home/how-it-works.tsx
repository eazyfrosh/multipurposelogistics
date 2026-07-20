"use client";

import { motion } from "framer-motion";
import { FilePlus2, Truck, PackageCheck } from "lucide-react";

const STEPS = [
  { icon: FilePlus2, title: "Create a shipment", description: "Enter sender, receiver, and package details — a tracking number is generated automatically." },
  { icon: Truck, title: "Track every checkpoint", description: "Watch status updates flow through pickup, transit hubs, and customs to your door." },
  { icon: PackageCheck, title: "Confirm delivery", description: "Get proof of delivery, a QR-verified tracking summary, and downloadable documents." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-foreground/60">Three steps from order to doorstep.</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative rounded-2xl border border-black/8 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-lg">
              {i + 1}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <step.icon size={19} />
            </span>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-foreground/60">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
