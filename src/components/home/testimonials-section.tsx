"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    role: "Operations Lead, demo persona",
    quote:
      "The tracking timeline is exactly what our support team needed — every checkpoint, timestamped, in one view.",
  },
  {
    name: "Marcus Reyes",
    role: "Warehouse Manager, demo persona",
    quote:
      "Bulk status updates and CSV export turned a manual afternoon task into a five-minute job.",
  },
  {
    name: "Elena Kovač",
    role: "Customer Success, demo persona",
    quote:
      "QR verification on every shipment means customers trust the tracking page instead of emailing us to ask 'where's my order?'",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-black/[0.015] py-20 dark:bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by demo teams everywhere</h2>
          <p className="mt-3 text-foreground/60">Illustrative testimonials for this demonstration platform.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-black/8 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/70">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar name={t.name} />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-foreground/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
