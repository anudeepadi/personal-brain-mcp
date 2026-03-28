/**
 * Conditional Sentry initialization for the frontend.
 * Only activates when NEXT_PUBLIC_SENTRY_DSN is set.
 */

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "development",
    });
    initialized = true;
  });
}
