"use client";

import { useEffect } from "react";
import { initSentry } from "@/lib/sentry";

/**
 * Client component that initializes Sentry on mount.
 * Safe no-op when NEXT_PUBLIC_SENTRY_DSN is not set.
 */
export function SentryInit(): null {
  useEffect(() => {
    initSentry();
  }, []);

  return null;
}
