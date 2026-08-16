import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-auth';

export const GET = withAdminAuth(async () => {
    const [
        toolCount,
        publishedToolCount,
        postCount,
        categoryCount,
        reviewCount,
        mediaCount,
        totalViews,
        topTools,
        recentPosts,
        recentTools,
    ] = await prisma.$transaction([
        prisma.tool.count(),
        prisma.tool.count({ where: { status: 'published' } }),
        prisma.post.count(),
        prisma.category.count(),
        prisma.review.count(),
        prisma.mediaAsset.count(),
        prisma.tool.aggregate({ _sum: { views: true } }),
        prisma.tool.findMany({
            take: 5,
            orderBy: { views: 'desc' },
            select: { id: true, name: true, slug: true, views: true, status: true },
        }),
        prisma.post.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true, status: true, updatedAt: true },
        }),
        prisma.tool.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            select: { id: true, name: true, status: true, updatedAt: true },
        }),
    ]);

    return NextResponse.json({
        stats: {
            tools: toolCount,
            publishedTools: publishedToolCount,
            posts: postCount,
            categories: categoryCount,
            reviews: reviewCount,
            media: mediaCount,
            totalViews: totalViews._sum.views ?? 0,
        },
        topTools,
        recentPosts,
        recentTools,
    });
});
