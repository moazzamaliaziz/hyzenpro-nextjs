import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
    ADS_SECTION_ID,
    isAdSlotId,
    mergeAdSettingsIntoDefinitions,
    normalizeAdSettings,
    upsertSingleAdSlot,
} from '@/lib/ads';

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const record = await prisma.siteContent.findUnique({
            where: { sectionId: ADS_SECTION_ID },
        });

        const content = normalizeAdSettings(record?.content);

        return NextResponse.json({
            version: content.version,
            slots: mergeAdSettingsIntoDefinitions(content),
        });
    } catch (error) {
        console.error('[ADMIN_ADS_GET]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const slotId = body?.slotId;
        const slot = body?.slot;

        if (typeof slotId !== 'string' || !isAdSlotId(slotId) || !slot || typeof slot !== 'object') {
            return NextResponse.json({ error: 'A valid slotId and slot payload are required.' }, { status: 400 });
        }

        const existing = await prisma.siteContent.findUnique({
            where: { sectionId: ADS_SECTION_ID },
        });

        const nextContent = upsertSingleAdSlot(normalizeAdSettings(existing?.content), slotId, slot);

        await prisma.siteContent.upsert({
            where: { sectionId: ADS_SECTION_ID },
            update: {
                content: nextContent as unknown as Prisma.InputJsonValue,
                title: 'Ad Management',
                subtitle: 'Centralized monetization controls',
            },
            create: {
                sectionId: ADS_SECTION_ID,
                title: 'Ad Management',
                subtitle: 'Centralized monetization controls',
                content: nextContent as unknown as Prisma.InputJsonValue,
                enabled: true,
                sortOrder: 120,
            },
        });

        return NextResponse.json({
            version: nextContent.version,
            slots: mergeAdSettingsIntoDefinitions(nextContent),
        });
    } catch (error) {
        console.error('[ADMIN_ADS_PUT]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
