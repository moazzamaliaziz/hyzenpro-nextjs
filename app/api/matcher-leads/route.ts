import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { consumeRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/auth-credentials';

const RATE_LIMIT = { limit: 10, windowMs: 60_000 }; // 10 requests per minute

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateKey = `matcher-leads:${ip}`;
  const result = consumeRateLimit({ key: rateKey, ...RATE_LIMIT });

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders({ allowed: false, remaining: 0, resetAt: Date.now() + result.retryAfterMs }, RATE_LIMIT.limit) },
    );
  }

  try {
    const body = await req.json();
    const email = normalizeEmail(String(body.email || ''));
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const resultId = typeof body.resultId === 'string' ? body.resultId.trim() : '';
    const resultName = typeof body.resultName === 'string' ? body.resultName.trim() : '';
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 40) : 'matcher-result';
    const answers = body.answers && typeof body.answers === 'object' ? body.answers : null;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!category || !resultId || !resultName) {
      return NextResponse.json({ error: 'Missing matcher result details.' }, { status: 400 });
    }

    await (prisma as any).$runCommandRaw({
      insert: 'MatcherLead',
      documents: [
        {
          email,
          name: name || null,
          category,
          resultId,
          resultName,
          source,
          answers,
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to store matcher lead', error);
    return NextResponse.json({ error: 'Unable to save your result right now.' }, { status: 500 });
  }
}
