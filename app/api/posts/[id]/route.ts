import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper: calculate reading time from HTML content
function calcReadingTime(html: string): number {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

// GET /api/posts/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                authorModel: { select: { name: true, image: true } },
            },
        });
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
            categories, tags, author, authorId, status, postType, seo,
            publishedAt, scheduledAt,
        } = body;

        const existingPost = await prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const data: any = {
            title,
            slug,
            excerpt,
            content,
            featuredImage,
            categories: categories || [],
            tags: tags || [],
            author,
            authorId: authorId || null,
            status,
            postType,
            seo: seo || undefined,
            readingTime: calcReadingTime(content || ''),
        };

        // Handle publish timestamp
        if (status === 'published' && !existingPost.publishedAt) {
            data.publishedAt = new Date();
        } else if (publishedAt) {
            data.publishedAt = new Date(publishedAt);
        }

        // Handle scheduled publishing
        if (status === 'scheduled' && scheduledAt) {
            data.scheduledAt = new Date(scheduledAt);
        } else if (status !== 'scheduled') {
            data.scheduledAt = null;
        }

        // Handle trash
        if (status === 'trash' && !existingPost.trashedAt) {
            data.trashedAt = new Date();
        } else if (status !== 'trash') {
            data.trashedAt = null;
        }

        const post = await prisma.post.update({
            where: { id },
            data,
        });

        // ISR Revalidation on publish or update
        if (status === 'published' || existingPost.status === 'published') {
            revalidatePath('/blog');
            revalidatePath(`/blog/${slug}`);
            // Also revalidate old slug if changed
            if (existingPost.slug !== slug) {
                revalidatePath(`/blog/${existingPost.slug}`);
            }
        }

        return NextResponse.json(post);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// DELETE /api/posts/[id] — Permanent delete
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
        const post = await prisma.post.findUnique({ where: { id } });

        await prisma.post.delete({ where: { id } });

        // Revalidate if was published
        if (post?.status === 'published') {
            revalidatePath('/blog');
            revalidatePath(`/blog/${post.slug}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
