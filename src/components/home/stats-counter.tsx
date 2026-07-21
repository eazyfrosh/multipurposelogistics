"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 2400000, suffix: "+", label: "Shipments tracked" },
  { value: 4, suffix: "", label: "Supported carriers" },
  { value: 180, suffix: "+", label: "Countries reached" },
  { value: 99, suffix: "%", label: "On-time visibility" },
];

export function StatsCounter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4"
    >
      {STATS.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <p className="text-2xl font-bold text-white sm:text-3xl">
            <AnimatedNumber value={s.value} suffix={s.suffix} />
          </p>
          <p className="mt-0.5 text-xs text-white/60 sm:text-sm">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
}
