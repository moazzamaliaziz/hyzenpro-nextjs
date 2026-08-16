import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
    ADS_SECTION_ID,
    getEnabledPublicSlots,
    isAdSlotId,
    normalizeAdSettings,
} from '@/lib/ads';

const PUBLIC_AD_CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
    const slotId = request.nextUrl.searchParams.get('slot');
    const summaryOnly = request.nextUrl.searchParams.get('summary') === '1';

    try {
        const record = await prisma.siteContent.findUnique({
            where: { sectionId: ADS_SECTION_ID },
            select: { content: true },
        });

        const enabledSlots = getEnabledPublicSlots(normalizeAdSettings(record?.content));

        if (summaryOnly) {
            return NextResponse.json(
                {
                    hasEnabledSlots: enabledSlots.length > 0,
                    enabledSlotCount: enabledSlots.length,
                    version: normalizeAdSettings(record?.content).version,
                },
                { headers: PUBLIC_AD_CACHE_HEADERS }
            );
        }

        if (slotId) {
            if (!isAdSlotId(slotId)) {
                return NextResponse.json({ error: 'Unknown ad slot.' }, { status: 404 });
            }

            const slot = enabledSlots.find((item) => item.id === slotId);
            return NextResponse.json(
                { slot: slot || null, hasEnabledSlots: enabledSlots.length > 0 },
                { headers: PUBLIC_AD_CACHE_HEADERS }
            );
        }

        return NextResponse.json(
            { slots: enabledSlots, hasEnabledSlots: enabledSlots.length > 0 },
            { headers: PUBLIC_AD_CACHE_HEADERS }
        );
    } catch (error) {
        console.error('[ADS_GET]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
