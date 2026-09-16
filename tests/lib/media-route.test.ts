import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
    default: {
        mediaAsset: { findUnique },
    },
    prisma: {
        mediaAsset: { findUnique },
    },
}));

import { GET } from '@/app/media/[id]/[fileName]/route';

function mediaRequest(url = 'http://localhost:3100/media/asset-1/logo.png') {
    return { url } as unknown as import('next/server').NextRequest;
}

function params(id = 'asset-1', fileName = 'logo.png') {
    return { params: Promise.resolve({ id, fileName }) };
}

describe('GET /media/[id]/[fileName]', () => {
    beforeEach(() => {
        findUnique.mockReset();
    });

    it('redirects to the placeholder instead of returning 404 text when the asset is missing', async () => {
        findUnique.mockResolvedValue(null);

        const response = await GET(mediaRequest(), params());

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe('http://localhost:3100/images/logo.svg');
        expect(response.headers.get('location')).not.toContain('/404');
    });

    it('redirects to the placeholder when the asset row exists but has no data and no r2 url', async () => {
        findUnique.mockResolvedValue({ data: null, contentType: 'image/png', size: 10, fileName: 'logo.png', r2Url: null });

        const response = await GET(mediaRequest(), params());

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe('http://localhost:3100/images/logo.svg');
    });

    it('returns 200 with the stored content type and does not throw when size is undefined', async () => {
        findUnique.mockResolvedValue({
            data: new Uint8Array([1, 2, 3]),
            contentType: 'image/png',
            size: undefined,
            fileName: 'logo.png',
            r2Url: null,
        });

        const response = await GET(mediaRequest(), params());

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        expect(response.headers.get('Content-Length')).toBeNull();
        expect(response.headers.get('Cache-Control')).toContain('immutable');
        expect(response.headers.get('Content-Disposition')).toContain('logo.png');
    });

    it('falls back to octet-stream when the stored content type is missing', async () => {
        findUnique.mockResolvedValue({
            data: new Uint8Array([1]),
            contentType: null,
            size: 1,
            fileName: 'blob.bin',
            r2Url: null,
        });

        const response = await GET(mediaRequest(), params());

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
        expect(response.headers.get('Content-Length')).toBe('1');
    });

    it('301-redirects to the r2 url when one is stored', async () => {
        findUnique.mockResolvedValue({
            data: null,
            contentType: null,
            size: undefined,
            fileName: 'logo.png',
            r2Url: 'https://media.hyzenpro.com/tools/logo.png',
        });

        const response = await GET(mediaRequest(), params());

        expect(response.status).toBe(301);
        expect(response.headers.get('location')).toBe('https://media.hyzenpro.com/tools/logo.png');
    });
});