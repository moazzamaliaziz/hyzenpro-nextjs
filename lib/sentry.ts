const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

function parseSampleRate(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export const SENTRY_ORG = 'hyzenpro';
export const SENTRY_PROJECT = 'sentry-emerald-school';
export const sentryEnvironment =
    process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
export const sentryTracesSampleRate = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    DEFAULT_TRACES_SAMPLE_RATE,
);

export function isSentryEnabled(dsn: string | undefined): boolean {
    return Boolean(dsn);
}
