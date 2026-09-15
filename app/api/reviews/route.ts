import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@/lib/prisma-error';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { ReviewCreateSchema } from '@/lib/schemas/review.schema';

// GET /api/reviews
export async function GET(request: NextRequest) {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = ReviewCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const data = parsed.data;

        const review = await prisma.review.create({
            data: {
                toolSlug: data.toolSlug,
                toolName: data.toolName,
                title: data.title,
                slug: data.slug,
                content: data.content || '',
                rating: data.rating ?? 0,
                pros: data.pros,
                cons: data.cons,
                verdict: data.verdict || '',
                author: data.author || 'HyzenPro Team',
                status: data.status,
                seo: data.seo as any || undefined,
                publishedAt: data.status === 'published' ? new Date() : null,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A review with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
