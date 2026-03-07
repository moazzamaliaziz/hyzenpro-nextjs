import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
        return NextResponse.json({ tools: [], posts: [] });
    }

    try {
        const [tools, posts] = await Promise.all([
            prisma.tool.findMany({
                where: {
                    status: 'approved',
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { shortDescription: { contains: q, mode: 'insensitive' } },
                        { primaryCategory: { contains: q, mode: 'insensitive' } }
                    ]
                },
                select: { id: true, name: true, slug: true, primaryCategory: true, logo: true },
                take: 5
            }),
            prisma.post.findMany({
                where: {
                    status: 'published',
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                    ]
                },
                select: { id: true, title: true, slug: true },
                take: 3
            })
        ]);

        return NextResponse.json({ tools, posts });
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
