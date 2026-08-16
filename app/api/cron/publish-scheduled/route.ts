import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { revalidateContent } from '@/lib/revalidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        const scheduledPosts = await prisma.post.findMany({
            where: {
                status: 'scheduled',
                scheduledAt: { lte: now },
            },
            select: { id: true, title: true, slug: true, scheduledAt: true },
        });

        if (scheduledPosts.length === 0) {
            return NextResponse.json({ published: 0, message: 'No posts due for publishing.' });
        }

        await prisma.post.updateMany({
            where: {
                id: { in: scheduledPosts.map((p) => p.id) },
            },
            data: {
                status: 'published',
                publishedAt: now,
            },
        });

        for (const post of scheduledPosts) {
            revalidatePath('/blog');
            revalidatePath(`/blog/${post.slug}`);
            revalidateContent('posts', post.slug).catch(() => {});
        }
        revalidatePath('/');

        return NextResponse.json({
            published: scheduledPosts.length,
            posts: scheduledPosts.map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                scheduledAt: p.scheduledAt,
            })),
        });
    } catch (error) {
        console.error('[CRON_PUBLISH]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
