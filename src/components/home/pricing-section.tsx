"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: string;
  cadence?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    description: "For individuals tracking occasional shipments.",
    features: [
      "Up to 10 active shipments",
      "Public tracking pages & QR codes",
      "Email delivery notifications",
      "Live chat support",
    ],
    cta: "Get started",
    href: "/auth/signup",
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "/month",
    description: "For growing teams shipping regularly.",
    features: [
      "Unlimited active shipments",
      "Priority carrier support",
      "CSV & Excel reporting",
      "Live chat support",
      "Team member access",
    ],
    cta: "Get started",
    href: "/auth/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume logistics operations.",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Custom carrier integrations",
      "SLA-backed priority support",
      "Advanced analytics & audit logs",
    ],
    cta: "Contact sales",
    href: "mailto:support@tracknova.com",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-foreground/60">Start free, upgrade as your shipping volume grows.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className={cn(
                "relative flex flex-col rounded-3xl p-7 transition hover:-translate-y-1",
                tier.highlighted
                  ? "bg-gradient-to-br from-brand-600 to-teal-accent-500 text-white shadow-xl shadow-brand-600/25 lg:scale-105"
                  : "border border-black/8 bg-white shadow-sm hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-black shadow-lg">
                  <Sparkles size={12} /> Most popular
                </span>
              )}

              <h3 className={cn("text-lg font-semibold", tier.highlighted && "text-white")}>{tier.name}</h3>
              <p className={cn("mt-1 text-sm", tier.highlighted ? "text-white/75" : "text-foreground/55")}>
                {tier.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                {tier.cadence && (
                  <span className={cn("text-sm", tier.highlighted ? "text-white/70" : "text-foreground/50")}>
                    {tier.cadence}
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full",
                        tier.highlighted ? "bg-white/20" : "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                      )}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className={tier.highlighted ? "text-white/90" : "text-foreground/70"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.href} className="mt-7 block">
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    tier.highlighted
                      ? "bg-white text-brand-700 hover:bg-white/90"
                      : "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                  )}
                >
                  {tier.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-foreground/40">
          Billing is simulated for this portfolio project — no real payment is ever processed.
        </p>
      </div>
    </section>
  );
}
