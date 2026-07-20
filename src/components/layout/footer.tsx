import Link from "next/link";
import { Boxes, Globe, Mail, Share2 } from "lucide-react";
import { CARRIER_DISCLAIMER } from "@/lib/data/carriers";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/track", label: "Track a shipment" },
      { href: "/#features", label: "Features" },
      { href: "/#carriers", label: "Carriers" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/signup", label: "Create account" },
      { href: "/auth/login", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "Support" },
      { href: "/track", label: "Shipment lookup" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/6 bg-black/[0.015] dark:border-white/8 dark:bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-accent-500 text-white">
                <Boxes size={17} />
              </span>
              <span className="text-lg tracking-tight">TrackNova</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-foreground/55">
              A premium, multi-carrier shipment tracking &amp; logistics management demo platform.
            </p>
            <div className="mt-4 flex gap-3 text-foreground/40">
              <Globe size={16} />
              <Mail size={16} />
              <Share2 size={16} />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-foreground/55 transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-black/8 pt-6 dark:border-white/10">
          <p className="text-xs leading-relaxed text-foreground/40">{CARRIER_DISCLAIMER}</p>
          <div className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-xs text-foreground/40">© {new Date().getFullYear()} TrackNova. Demo project — not a real logistics provider.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
