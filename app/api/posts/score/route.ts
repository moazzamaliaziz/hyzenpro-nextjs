import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { analyzeContent } from '@/lib/content-scoring';
import { z } from 'zod';

const ScoreSchema = z.object({
    title: z.string().default(''),
    excerpt: z.string().default(''),
    content: z.string().min(1, 'Content is required'),
    tags: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = ScoreSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const { title, excerpt, content, tags } = parsed.data;

        const scores = analyzeContent(title, excerpt, content, tags);

        return NextResponse.json(scores);
    } catch (error) {
        console.error('[Scoring] Failed to analyze content:', error);
        return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 });
    }
}
