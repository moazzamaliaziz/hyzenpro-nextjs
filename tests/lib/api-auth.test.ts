import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { requireAdminToken, withAdminAuth } from '@/lib/api-auth';

vi.mock('next-auth/jwt', () => ({
    getToken: vi.fn(),
}));

import { getToken } from 'next-auth/jwt';

const mockGetToken = vi.mocked(getToken);

function mockNextRequest(headers: Record<string, string> = {}, url = 'https://hyzenpro.com/api/admin/media') {
    return {
        headers: new Headers(headers),
        nextUrl: new URL(url),
    } as unknown as import('next/server').NextRequest;
}

describe('requireAdminToken', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AUTH_SECRET = 'test-secret';
    });

    it('returns token when valid admin', async () => {
        mockGetToken.mockResolvedValue({ role: 'admin', id: '1', email: 'admin@test.com', isTwoFactorEnabled: false, mustChangePassword: false });
        const result = await requireAdminToken(mockNextRequest({ cookie: 'authjs.session-token=xxx' }));
        expect(result).not.toBeNull();
        expect((result as any).role).toBe('admin');
    });

    it('returns null when token has wrong role', async () => {
        mockGetToken.mockResolvedValue({ role: 'editor', id: '2', isTwoFactorEnabled: false, mustChangePassword: false } as any);
        const result = await requireAdminToken(mockNextRequest({ cookie: 'authjs.session-token=xxx' }));
        expect(result).toBeNull();
    });

    it('returns null when no token found', async () => {
        mockGetToken.mockResolvedValue(null);
        const result = await requireAdminToken(mockNextRequest());
        expect(result).toBeNull();
    });

    it('returns null when token has no role', async () => {
        mockGetToken.mockResolvedValue({ id: '3', isTwoFactorEnabled: false, mustChangePassword: false } as any);
        const result = await requireAdminToken(mockNextRequest({ cookie: 'authjs.session-token=xxx' }));
        expect(result).toBeNull();
    });
});

describe('withAdminAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AUTH_SECRET = 'test-secret';
    });

    it('calls handler when admin authenticated', async () => {
        mockGetToken.mockResolvedValue({ role: 'admin', id: '1', isTwoFactorEnabled: false, mustChangePassword: false });
        const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
        const wrapped = withAdminAuth(handler);
        const req = mockNextRequest({ cookie: 'authjs.session-token=xxx' });
        const response = await wrapped(req, { params: { id: '123' } });
        const body = await response.json();
        expect(body).toEqual({ ok: true });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('returns 401 when not authenticated', async () => {
        mockGetToken.mockResolvedValue(null);
        const handler = vi.fn();
        const wrapped = withAdminAuth(handler);
        const response = await wrapped(mockNextRequest(), { params: {} });
        expect(response.status).toBe(401);
        expect(handler).not.toHaveBeenCalled();
        const body = await response.json();
        expect(body.error).toBe('Unauthorized');
    });

it('returns 401 when role is not admin', async () => {
        mockGetToken.mockResolvedValue({ role: 'viewer', id: '1', isTwoFactorEnabled: false, mustChangePassword: false } as any);
        const handler = vi.fn();
        const wrapped = withAdminAuth(handler, 'editor');
        const response = await wrapped(mockNextRequest({ cookie: 'authjs.session-token=xxx' }), { params: {} });
        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toBe('Unauthorized');
    });
});
