// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
export const Sentry = require("@sentry/bun");
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");
import { SupabaseIntegration } from "@supabase/sentry-js-integration";
import { SupabaseClient } from "@supabase/supabase-js";

// Init Sentry if DSN is provided in env as SENTRY_DSN
if (process.env.SENTRY_DSN)
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // TypeError: getCurrentHub is not a function. (In 'getCurrentHub()', 'getCurrentHub' is undefined
      // new SupabaseIntegration(SupabaseClient, {
      //   tracing: true,
      //   breadcrumbs: true,
      //   errors: true,
      // }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 0.5,
  });
