import { describe, expect, it } from 'vitest';
import { toIsoOrFallback, toIsoOrNull } from '@/lib/safe-date';

const EPOCH_ISO = new Date(0).toISOString();

describe('safe-date', () => {
    it('falls back for undefined, null and empty values instead of throwing', () => {
        expect(toIsoOrFallback(undefined)).toBe(EPOCH_ISO);
        expect(toIsoOrFallback(null)).toBe(EPOCH_ISO);
        expect(toIsoOrFallback('')).toBe(EPOCH_ISO);
        expect(toIsoOrFallback('   ')).toBe(EPOCH_ISO);
    });

    it('falls back for invalid and non-date values', () => {
        expect(toIsoOrFallback('not-a-date')).toBe(EPOCH_ISO);
        expect(toIsoOrFallback({})).toBe(EPOCH_ISO);
        expect(toIsoOrFallback([])).toBe(EPOCH_ISO);
        expect(toIsoOrFallback(true)).toBe(EPOCH_ISO);
        expect(toIsoOrFallback(NaN)).toBe(EPOCH_ISO);
        expect(toIsoOrFallback(Infinity)).toBe(EPOCH_ISO);
        expect(toIsoOrFallback(new Date('nope'))).toBe(EPOCH_ISO);
    });

    it('accepts valid Date, number and ISO string inputs', () => {
        const date = new Date('2026-06-09T00:00:00.000Z');
        expect(toIsoOrFallback(date)).toBe('2026-06-09T00:00:00.000Z');
        expect(toIsoOrFallback(date.getTime())).toBe('2026-06-09T00:00:00.000Z');
        expect(toIsoOrFallback('2026-06-09')).toBe('2026-06-09T00:00:00.000Z');
        expect(toIsoOrFallback(' 2026-06-09T00:00:00.000Z ')).toBe('2026-06-09T00:00:00.000Z');
    });

    it('honours a custom fallback', () => {
        expect(toIsoOrFallback(undefined, '1970-01-01T00:00:00.000Z')).toBe('1970-01-01T00:00:00.000Z');
        expect(toIsoOrFallback('garbage', 'fallback')).toBe('fallback');
    });

    it('returns null from toIsoOrNull for invalid input and ISO for valid input', () => {
        expect(toIsoOrNull(undefined)).toBeNull();
        expect(toIsoOrNull(null)).toBeNull();
        expect(toIsoOrNull('')).toBeNull();
        expect(toIsoOrNull('not-a-date')).toBeNull();
        expect(toIsoOrNull({})).toBeNull();
        expect(toIsoOrNull(NaN)).toBeNull();
        expect(toIsoOrNull(new Date('nope'))).toBeNull();
        expect(toIsoOrNull(new Date('2026-06-09T00:00:00.000Z'))).toBe('2026-06-09T00:00:00.000Z');
        expect(toIsoOrNull(0)).toBe('1970-01-01T00:00:00.000Z');
    });
});