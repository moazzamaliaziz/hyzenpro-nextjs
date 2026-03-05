import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// PUT /api/posts/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const {
            title, slug, excerpt, content, featuredImage,
            categories, tags, author, status, postType, seo, publishedAt,
        } = body;

        const existingPost = await prisma.post.findUnique({ where: { id } });

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                slug,
                excerpt,
                content,
                featuredImage,
                categories: categories || [],
                tags: tags || [],
                author,
                status,
                postType,
                seo: seo || undefined,
                publishedAt: status === 'published' && !existingPost?.publishedAt
                    ? new Date()
                    : publishedAt ? new Date(publishedAt) : existingPost?.publishedAt,
            },
        });

        return NextResponse.json(post);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// DELETE /api/posts/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.post.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
