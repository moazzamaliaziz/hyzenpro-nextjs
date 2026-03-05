import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

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
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            toolSlug, toolName, title, slug, content, rating,
            pros, cons, verdict, author, status, seo,
        } = body;

        const review = await prisma.review.create({
            data: {
                toolSlug,
                toolName,
                title,
                slug,
                content: content || '',
                rating: parseFloat(rating) || 0,
                pros: pros || [],
                cons: cons || [],
                verdict: verdict || '',
                author: author || 'HyzenPro Team',
                status: status || 'draft',
                seo: seo || undefined,
                publishedAt: status === 'published' ? new Date() : null,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A review with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
