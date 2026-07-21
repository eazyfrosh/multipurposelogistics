"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { RouteIllustration } from "@/components/home/route-illustration";
import { TrackingSearch } from "@/components/home/tracking-search";
import { StatsCounter } from "@/components/home/stats-counter";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 pb-24 pt-16 text-white sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-400 blur-3xl animate-float-slow" />
        <div
          className="absolute right-0 top-40 h-96 w-96 rounded-full bg-teal-accent-500/40 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1.5px_1.5px_at_10%_20%,white,transparent),radial-gradient(1.5px_1.5px_at_85%_15%,white,transparent),radial-gradient(1px_1px_at_70%_40%,white,transparent),radial-gradient(1px_1px_at_25%_55%,white,transparent),radial-gradient(1.5px_1.5px_at_50%_12%,white,transparent),radial-gradient(1px_1px_at_92%_50%,white,transparent)]" />

      <RouteIllustration />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90">
            ✦ Demo platform — simulated shipments &amp; tracking data
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Every shipment, every carrier,
            <br className="hidden sm:block" /> one dashboard.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
            Create, track, and manage shipments across supported carrier integrations —
            with live status timelines, QR verification, and enterprise-grade reporting.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <TrackingSearch />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button variant="gold" size="lg">
                Create a shipment <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="bg-white/10 text-white hover:bg-white/20">
                <LayoutDashboard size={16} /> View dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <StatsCounter />
      </div>
    </section>
  );
}
