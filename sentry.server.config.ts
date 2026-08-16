import * as Sentry from '@sentry/nextjs';
import { isSentryEnabled, sentryEnvironment, sentryTracesSampleRate } from '@/lib/sentry';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn,
    enabled: isSentryEnabled(dsn),
    environment: sentryEnvironment,
    tracesSampleRate: sentryTracesSampleRate,
    sendDefaultPii: false,
});
