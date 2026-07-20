"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, ShieldCheck, LogOut, User, ChevronDown, PackageSearch } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/track", label: "Track Shipment" },
  { href: "/#carriers", label: "Carriers" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logOut } = useAuth();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 glass border-b border-black/6 dark:border-white/8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-black/10 py-1 pl-1 pr-2.5 transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <Avatar name={profile?.displayName ?? user.displayName ?? user.email} />
                <ChevronDown size={14} className="text-foreground/50" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/8 bg-white py-1.5 shadow-xl dark:border-white/10 dark:bg-[#0b0e17]">
                  <div className="border-b border-black/8 px-3.5 py-2.5 dark:border-white/10">
                    <p className="truncate text-sm font-medium">{profile?.displayName ?? user.displayName}</p>
                    <p className="truncate text-xs text-foreground/50">{user.email}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 px-3.5 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 px-3.5 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                    <User size={15} /> Profile
                  </Link>
                  {profile?.role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2 px-3.5 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                      <ShieldCheck size={15} /> Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await logOut();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2 border-t border-black/8 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:border-white/10 dark:text-red-400"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-black/6 transition-all duration-300 md:hidden dark:border-white/8",
          open ? "max-h-[28rem]" : "max-h-0 border-t-0"
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          <Link href="/track" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
            <PackageSearch size={15} /> Track a shipment
          </Link>
          <div className="mt-2 flex items-center justify-between border-t border-black/8 pt-3 dark:border-white/10">
            <ThemeToggle />
            {user ? (
              <div className="flex gap-2">
                <Link href="/dashboard"><Button size="sm" variant="secondary">Dashboard</Button></Link>
                <Button size="sm" variant="outline" onClick={() => logOut()}>Sign out</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login"><Button size="sm" variant="ghost">Sign in</Button></Link>
                <Link href="/auth/signup"><Button size="sm">Get started</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
