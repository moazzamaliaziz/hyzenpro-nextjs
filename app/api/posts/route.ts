import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts — List all posts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const posts = await prisma.post.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
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
        } = body;

        const post = await prisma.post.create({
            data: {
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
                publishedAt: status === 'published' ? new Date() : null,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
