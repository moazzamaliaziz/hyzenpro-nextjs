import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { ReviewUpdateSchema } from '@/lib/schemas/review.schema';

// GET /api/reviews/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }
        return NextResponse.json(review);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }
}

// PUT /api/reviews/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = ReviewUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const {
            toolSlug, toolName, title, slug, content, rating,
            pros, cons, verdict, author, status, seo, publishedAt,
        } = parsed.data;

        const existingReview = await prisma.review.findUnique({ where: { id } });

        const review = await prisma.review.update({
            where: { id },
            data: {
                toolSlug,
                toolName,
                title,
                slug,
                content,
                rating: rating ?? 0,
                pros: pros || [],
                cons: cons || [],
                verdict,
                author,
                status,
                seo: seo || undefined,
                publishedAt: status === 'published' && !existingReview?.publishedAt
                    ? new Date()
                    : publishedAt ? new Date(publishedAt) : existingReview?.publishedAt,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A review with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// DELETE /api/reviews/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.review.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
