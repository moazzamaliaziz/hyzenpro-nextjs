type RateLimitBucket = {
    count: number;
    resetAt: number;
};

type RateLimitOptions = {
    key: string;
    limit: number;
    windowMs: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
    __hyzenproRateLimitStore?: Map<string, RateLimitBucket>;
};

const store = globalForRateLimit.__hyzenproRateLimitStore ?? new Map<string, RateLimitBucket>();

if (!globalForRateLimit.__hyzenproRateLimitStore) {
    globalForRateLimit.__hyzenproRateLimitStore = store;
}

/** Used by auth, contact, and password-reset flows */
export function consumeRateLimit({ key, limit, windowMs }: RateLimitOptions) {
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
        const nextBucket: RateLimitBucket = {
            count: 1,
            resetAt: now + windowMs,
        };
        store.set(key, nextBucket);

        return {
            allowed: true,
            remaining: Math.max(limit - 1, 0),
            retryAfterMs: 0,
        };
    }

    if (current.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: Math.max(current.resetAt - now, 0),
        };
    }

    current.count += 1;
    store.set(key, current);

    return {
        allowed: true,
        remaining: Math.max(limit - current.count, 0),
        retryAfterMs: 0,
    };
}

export type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetAt: number;
};

/** Used by vendor API and edge proxy */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const result = consumeRateLimit({ key, limit, windowMs });
    const bucket = store.get(key);
    return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetAt: bucket?.resetAt ?? Date.now() + windowMs,
    };
}

export function getClientIp(source: Request | Headers | { get(name: string): string | null | undefined }) {
    const headers = source instanceof Request ? source.headers : source;
    const forwardedFor =
        headers.get('x-forwarded-for') ||
        headers.get('cf-connecting-ip') ||
        headers.get('x-real-ip');
    if (!forwardedFor) {
        return 'unknown';
    }
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): HeadersInit {
    return {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    };
}
