import { NextRequest, NextResponse } from 'next/server';
import {
  buildMatcherEventDocument,
  insertMatcherEvent,
  isAllowedMatcherEvent,
} from '@/lib/matcher-analytics';
import { consumeRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';

const RATE_LIMIT = { limit: 30, windowMs: 60_000 }; // 30 requests per minute

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateKey = `matcher-events:${ip}`;
  const result = consumeRateLimit({ key: rateKey, ...RATE_LIMIT });

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders({ allowed: false, remaining: 0, resetAt: Date.now() + result.retryAfterMs }, RATE_LIMIT.limit) },
    );
  }

  try {
    const body = await req.json();
    const event = typeof body.event === 'string' ? body.event.trim() : '';
    const payload =
      body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
        ? body.payload
        : {};

    if (!event || !isAllowedMatcherEvent(event)) {
      return NextResponse.json({ error: 'Invalid matcher event.' }, { status: 400 });
    }

    await insertMatcherEvent(buildMatcherEventDocument(event, payload));
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to store matcher event', error);
    return NextResponse.json({ error: 'Unable to store matcher event.' }, { status: 500 });
  }
}
