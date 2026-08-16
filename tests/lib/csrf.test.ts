import { describe, it, expect } from 'vitest';
import { validateOrigin } from '@/lib/csrf';

function mockRequest(headers: Record<string, string>) {
    return {
        headers: new Headers(headers),
    } as unknown as import('next/server').NextRequest;
}

describe('validateOrigin', () => {
    it('returns true when origin matches host', () => {
        const req = mockRequest({
            origin: 'https://hyzenpro.com',
            host: 'hyzenpro.com',
        });
        expect(validateOrigin(req)).toBe(true);
    });

    it('returns false when origin does not match host', () => {
        const req = mockRequest({
            origin: 'https://evil.com',
            host: 'hyzenpro.com',
        });
        expect(validateOrigin(req)).toBe(false);
    });

    it('returns false when origin is missing', () => {
        const req = mockRequest({ host: 'hyzenpro.com' });
        expect(validateOrigin(req)).toBe(false);
    });

    it('returns false when host is missing', () => {
        const req = mockRequest({ origin: 'https://hyzenpro.com' });
        expect(validateOrigin(req)).toBe(false);
    });

    it('returns false for malformed origin', () => {
        const req = mockRequest({ origin: 'not-a-url', host: 'hyzenpro.com' });
        expect(validateOrigin(req)).toBe(false);
    });

    it('matches host exactly (not subdomain bypass)', () => {
        const req = mockRequest({
            origin: 'https://attacker-hyzenpro.com',
            host: 'hyzenpro.com',
        });
        expect(validateOrigin(req)).toBe(false);
    });
});