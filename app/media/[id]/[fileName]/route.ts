import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const PLACEHOLDER_PATH = '/images/logo.svg';

function toBuffer(data: unknown): Buffer | null {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof Uint8Array) return Buffer.from(data);
    if (typeof data === 'string') return Buffer.from(data, 'binary');
    if (data && typeof data === 'object' && 'buffer' in data) {
        const inner = (data as { buffer?: unknown }).buffer;
        if (inner instanceof Uint8Array) return Buffer.from(inner);
        if (inner instanceof ArrayBuffer) return Buffer.from(inner);
    }
    return null;
}

// Bytes are the source of truth: a file stored with the wrong (or missing)
// content type is served correctly without forcing a re-upload.
function sniffContentType(data: unknown): string | undefined {
    const buffer = toBuffer(data);
    if (!buffer || buffer.length === 0) return undefined;

    if (
        buffer.length >= 4 &&
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
    ) {
        return 'image/png';
    }
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    if (buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return 'image/gif';
    }
    if (
        buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
        return 'image/webp';
    }

    const head = buffer.subarray(0, 512).toString('utf8').trim().toLowerCase();
    if (head.startsWith('<svg') || head.startsWith('<?xml')) {
        return 'image/svg+xml';
    }

    return undefined;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fileName: string }> }
) {
    const { id, fileName } = await params;

    const asset = await prisma.mediaAsset.findUnique({
        where: { id },
        select: {
            data: true,
            contentType: true,
            size: true,
            fileName: true,
            r2Url: true,
        },
    });

    if (!asset) {
        return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.url), 302);
    }

    if (asset.r2Url) {
        return NextResponse.redirect(asset.r2Url, 301);
    }

    if (!asset.data) {
        return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.url), 302);
    }

    const contentType =
        sniffContentType(asset.data) || asset.contentType || 'application/octet-stream';
    const safeFileName = (fileName || asset.fileName || '').replace(/["\\\r\n]/g, '').trim();

    const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': safeFileName ? `inline; filename="${safeFileName}"` : 'inline',
    };

    if (typeof asset.size === 'number') {
        headers['Content-Length'] = String(asset.size);
    }

    return new NextResponse(asset.data, {
        status: 200,
        headers,
    });
}