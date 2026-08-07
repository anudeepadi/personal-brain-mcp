"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated counter that counts from 0 to target value on scroll into view.
 * Uses requestAnimationFrame — compositor-friendly, no layout thrash.
 * Respects prefers-reduced-motion.
 */

interface CountUpProps {
  readonly target: string; // e.g. "1,247" or "94.2%" or "<10ms"
  readonly duration?: number; // ms, default 1200
  readonly className?: string;
}

function parseNumeric(value: string): { prefix: string; number: number; suffix: string; decimals: number } {
  const match = value.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) return { prefix: value, number: 0, suffix: "", decimals: 0 };

  const prefix = match[1];
  const numStr = match[2].replace(/,/g, "");
  const suffix = match[3];
  const number = parseFloat(numStr);
  const decimalMatch = numStr.match(/\.(\d+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;

  return { prefix, number, suffix, decimals };
}

function formatNumber(n: number, decimals: number, original: string): string {
  const hasCommas = original.includes(",");
  const formatted = decimals > 0 ? n.toFixed(decimals) : Math.floor(n).toString();

  if (hasCommas) {
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  return formatted;
}

export function CountUp({ target, duration = 1200, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const { prefix, number, suffix, decimals } = parseNumeric(target);
          if (number === 0) return;

          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * number;
            setDisplay(`${prefix}${formatNumber(current, decimals, target)}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(target);
            }
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
