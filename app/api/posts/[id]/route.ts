import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isAdminSession } from '@/lib/admin';
import { normalizeCategories } from '@/lib/normalize-category';
import { calculateReadingTime } from '@/lib/utils';
import { pingNewPost } from '@/lib/seo-ping';
import { revalidateContent } from '@/lib/revalidation';
import type { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@/lib/prisma';
import { VALID_POST_STATUSES, PostUpdateSchema } from '@/lib/schemas/post.schema';

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
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = PostUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const {
            title, slug, excerpt, content, featuredImage,
            categories, tags, author, authorId, status, postType, seo,
            publishedAt, scheduledAt, allowSlugChange,
        } = parsed.data;

        const existingPost = await prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const nextSlug = allowSlugChange === true && slug ? slug : existingPost.slug;

        const data: Prisma.PostUncheckedUpdateInput = {
            title,
            slug: nextSlug,
            excerpt,
            content,
            featuredImage,
            categories: normalizeCategories(categories),
            tags: tags || [],
            author,
            authorId: authorId || null,
            status: status || existingPost.status,
            postType,
            seo: seo || undefined,
            readingTime: calculateReadingTime(content || ''),
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
            revalidatePath(`/blog/${nextSlug}`);
            // Also revalidate old slug if changed
            if (existingPost.slug !== nextSlug) {
                revalidatePath(`/blog/${existingPost.slug}`);
            }
            // Ping search engines on new publish
            if (status === 'published' && existingPost.status !== 'published') {
                pingNewPost(nextSlug).catch(() => {});
            }
        }

        // Invalidate cached posts data for admin and listing
        revalidateContent('posts', nextSlug).catch(() => {});

        // Auto-save revision snapshot
        try {
            await prisma.postRevision.create({
                data: {
                    postId: id,
                    title: title || post.title,
                    content: content || post.content,
                    excerpt: excerpt || post.excerpt || null,
                    author: session.user?.email || 'HyzenPro Team',
                    wordCount: (data.readingTime as number) ? (data.readingTime as number) * 200 : null,
                },
            });
        } catch {
            // Revision save is non-critical
        }

        return NextResponse.json(post);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
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
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const post = await prisma.post.findUnique({ where: { id } });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        await prisma.post.delete({ where: { id } });

        revalidateContent('posts', post.slug).catch(() => {});

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
