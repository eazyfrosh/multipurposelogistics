"use client";

import { motion } from "framer-motion";
import {
  PackagePlus,
  Radar,
  BellRing,
  QrCode,
  Mail,
  History,
  Globe2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const FEATURES = [
  { icon: PackagePlus, title: "Shipment creation", description: "Build shipments with full sender, receiver, and package detail in a guided form." },
  { icon: Radar, title: "Live tracking", description: "A vertical timeline of every checkpoint, from pickup to final delivery." },
  { icon: BellRing, title: "Delivery updates", description: "Status changes are reflected instantly across dashboard, tracking page, and email." },
  { icon: QrCode, title: "QR verification", description: "Every shipment gets a scannable QR code that opens its public tracking page." },
  { icon: Mail, title: "Email notifications", description: "Automated notification templates for every stage of the delivery journey." },
  { icon: History, title: "Shipment history", description: "Full audit trail of every shipment, event, and status change ever recorded." },
  { icon: Globe2, title: "Multiple carriers", description: "Supported carrier integrations with carrier-specific tracking number formats." },
  { icon: ShieldCheck, title: "Secure dashboard", description: "Role-based access, Firebase authentication, and per-user data isolation." },
  { icon: UsersRound, title: "Admin management", description: "A complete back office for users, shipments, carriers, and support." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-black/[0.015] py-20 dark:bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything a logistics team needs</h2>
          <p className="mt-3 text-foreground/60">
            From shipment creation to proof of delivery, TrackNova covers the full lifecycle.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="rounded-2xl border border-black/8 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-accent-500 text-white shadow-lg shadow-brand-500/25">
                <f.icon size={19} />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-foreground/60">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
