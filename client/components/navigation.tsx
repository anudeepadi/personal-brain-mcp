"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Product" },
  { href: "/brain", label: "Dashboard" },
  { href: "/demo", label: "Demo" },
  { href: "/architecture", label: "Docs" },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 bg-background transition-all duration-200",
        scrolled ? "border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-text-primary"
        >
          <span className="font-display italic text-xl leading-none">
            Mnemonic
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-1.5 text-sm transition-colors",
                  active
                    ? "text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/brain"
            className="inline-flex items-center rounded-[var(--radius)] bg-text-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="border-b border-border bg-background px-6 pb-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-[var(--radius)] text-sm transition-colors",
                      active
                        ? "text-text-primary bg-surface font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/brain"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-[var(--radius)] bg-text-primary px-4 py-2.5 text-sm font-medium text-background text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
