import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET /api/posts — List all posts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const postType = searchParams.get('postType');

        const where: any = {};

        // Status filter — "all" excludes trash, specific status filters directly
        if (status && status !== 'all') {
            where.status = status;
        } else if (!status || status === 'all') {
            where.status = { not: 'trash' };
        }

        // Search by title
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        // Post type filter
        if (postType) {
            where.postType = postType;
        }

        const posts = await prisma.post.findMany({
            where,
            include: {
                authorModel: { select: { name: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// Helper: calculate reading time from HTML content
function calcReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            title, slug, excerpt, content, featuredImage,
            categories, tags, author, authorId, status, postType, seo,
            scheduledAt,
        } = body;

        const data: any = {
            title,
            slug,
            excerpt: excerpt || '',
            content: content || '',
            featuredImage,
            categories: categories || [],
            tags: tags || [],
            author: author || 'HyzenPro Team',
            authorId: authorId || undefined,
            status: status || 'draft',
            postType: postType || 'post',
            seo: seo || undefined,
            readingTime: calcReadingTime(content || ''),
        };

        // Set timestamps based on status
        if (status === 'published') {
            data.publishedAt = new Date();
        }
        if (status === 'scheduled' && scheduledAt) {
            data.scheduledAt = new Date(scheduledAt);
        }

        const post = await prisma.post.create({ data });

        // Revalidate blog pages on publish
        if (status === 'published') {
            revalidatePath('/blog');
            revalidatePath(`/blog/${slug}`);
        }

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
