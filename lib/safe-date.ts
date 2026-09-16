const EPOCH_ISO = new Date(0).toISOString();

function parseDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = new Date(trimmed);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
}

export function toIsoOrFallback(value: unknown, fallback: string = EPOCH_ISO): string {
    const parsed = parseDate(value);
    return parsed ? parsed.toISOString() : fallback;
}

export function toIsoOrNull(value: unknown): string | null {
    const parsed = parseDate(value);
    return parsed ? parsed.toISOString() : null;
}