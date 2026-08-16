import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fileName: string }> }
) {
    const { id } = await params;

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
        return new NextResponse('Not found', { status: 404 });
    }

    if (asset.r2Url) {
        return NextResponse.redirect(asset.r2Url, 301);
    }

    if (!asset.data) {
        return new NextResponse('No image data', { status: 404 });
    }

    return new NextResponse(asset.data, {
        status: 200,
        headers: {
            'Content-Type': asset.contentType,
            'Content-Length': asset.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="${asset.fileName}"`,
        },
    });
}
