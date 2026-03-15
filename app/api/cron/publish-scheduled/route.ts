import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// POST /api/cron/publish-scheduled
// This endpoint is designed to be called by Vercel Cron or an external scheduler
// every 5 minutes to auto-publish scheduled posts
export async function POST(request: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // Find all posts that are scheduled and whose scheduledAt is in the past
        const scheduledPosts = await prisma.post.findMany({
            where: {
                status: 'scheduled',
                scheduledAt: { lte: now },
            },
        });

        if (scheduledPosts.length === 0) {
            return NextResponse.json({ published: 0, message: 'No posts to publish' });
        }

        // Publish each post
        const publishedSlugs: string[] = [];

        for (const post of scheduledPosts) {
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    status: 'published',
                    publishedAt: post.scheduledAt || now,
                    scheduledAt: null,
                },
            });
            publishedSlugs.push(post.slug);
        }

        // Revalidate blog pages
        revalidatePath('/blog');
        for (const slug of publishedSlugs) {
            revalidatePath(`/blog/${slug}`);
        }

        return NextResponse.json({
            published: publishedSlugs.length,
            slugs: publishedSlugs,
            message: `Published ${publishedSlugs.length} post(s)`,
        });
    } catch (error) {
        console.error('Cron publish error:', error);
        return NextResponse.json({ error: 'Failed to process scheduled posts' }, { status: 500 });
    }
}

// Also support GET for Vercel Cron (Vercel calls GET by default)
export async function GET(request: NextRequest) {
    return POST(request);
}
