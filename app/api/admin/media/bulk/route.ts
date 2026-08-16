import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { isR2Configured, deleteFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let ids: string[] = [];
    try {
        const body = await request.json();
        ids = Array.isArray(body?.ids) ? body.ids : [];
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!ids.length) {
        return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    try {
        const assets = await prisma.mediaAsset.findMany({
            where: { id: { in: ids } },
            select: { id: true, r2Key: true },
        });

        if (isR2Configured()) {
            await Promise.allSettled(
                assets
                    .filter((a) => a.r2Key)
                    .map((a) => deleteFromR2(a.r2Key!))
            );
        }

        await prisma.mediaAsset.deleteMany({ where: { id: { in: ids } } });

        return NextResponse.json({ deleted: assets.length });
    } catch (error) {
        console.error('[MEDIA_BULK_DELETE]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}