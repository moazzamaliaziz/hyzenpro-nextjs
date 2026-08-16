import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { consumeRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 10, windowMs: 60_000 }; // 10 requests per minute per IP

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing tool ID' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rateKey = `track:${id}:${ip}`;
    const result = consumeRateLimit({ key: rateKey, ...RATE_LIMIT });

    if (!result.allowed) {
        return NextResponse.json(
            { error: 'Too many requests.' },
            { status: 429, headers: rateLimitHeaders({ allowed: false, remaining: 0, resetAt: Date.now() + result.retryAfterMs }, RATE_LIMIT.limit) },
        );
    }

    try {
        await prisma.tool.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to track view:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
