import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const PLACEHOLDER_PATH = '/images/logo.svg';

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

    const contentType = asset.contentType || 'application/octet-stream';
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