"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { TrackingSearch } from "@/components/home/tracking-search";
import { StatsCounter } from "@/components/home/stats-counter";
import { Button } from "@/components/ui/button";

const HERO_BACKGROUND_SRC = "/hero/logistics-hero.webp";

export function Hero() {
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 pb-24 pt-16 text-white sm:pt-24">
      {/* Decorative photo background — purely visual, falls back to the section's own gradient on load failure */}
      {!bgFailed && (
        <Image
          src={HERO_BACKGROUND_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          onError={() => setBgFailed(true)}
        />
      )}

      {/* Dark blue readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/92 via-brand-900/78 to-black/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

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
