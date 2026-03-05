"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sun, Moon, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/brain", label: "Brain" },
  { href: "/demo", label: "Demo" },
  { href: "/architecture", label: "How It Works" },
] as const;

function isDarkRoute(pathname: string): boolean {
  return pathname === "/demo" || pathname === "/architecture";
}

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = isDarkRoute(pathname);
  const isBrain = pathname === "/brain";

  const bgClass = dark
    ? "bg-[#0A0E1A]/90 border-[#1F2937]"
    : "bg-[#FEFCF8]/90 border-[#E8E4DE]";

  const textClass = dark ? "text-[#E5E7EB]" : "text-[#1A1A1A]";
  const mutedClass = dark ? "text-[#9CA3AF]" : "text-[#6B6B6B]";
  const accentClass = dark ? "text-[#818CF8]" : "text-[#E8A04C]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${bgClass}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 ${textClass}`}>
          <Brain className={`h-7 w-7 ${accentClass}`} />
          <span className="text-lg font-bold tracking-tight">Subconscious</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? `${accentClass} bg-[${dark ? "#1F2937" : "#F5F0EA"}]`
                    : `${mutedClass} hover:${textClass}`
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Theme indicator */}
        <div className={`hidden md:flex items-center gap-2 text-sm ${mutedClass}`}>
          {dark || isBrain ? (
            <>
              <Moon className="h-4 w-4 text-[#818CF8]" />
              <span>Sleep</span>
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 text-[#E8A04C]" />
              <span>Waking</span>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg ${textClass}`}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden border-t ${
              dark ? "bg-[#0A0E1A] border-[#1F2937]" : "bg-[#FEFCF8] border-[#E8E4DE]"
            }`}
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? accentClass : mutedClass
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
