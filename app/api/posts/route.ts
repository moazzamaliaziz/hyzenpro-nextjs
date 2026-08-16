import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isAdminSession } from '@/lib/admin';
import { normalizeCategories } from '@/lib/normalize-category';
import { calculateReadingTime } from '@/lib/utils';
import { pingNewPost } from '@/lib/seo-ping';
import { parsePagination, paginatedResponse } from '@/lib/pagination';
import { revalidateContent } from '@/lib/revalidation';
import { Prisma } from '@prisma/client';
import { VALID_POST_STATUSES, PostCreateSchema } from '@/lib/schemas/post.schema';

// GET /api/posts — List all posts (admin only, supports ?page=1&pageSize=20)
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const postType = searchParams.get('postType');
        const hasPageParam = searchParams.has('page');

        const where: Prisma.PostWhereInput = {};

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

        // If page param is present, return paginated results
        if (hasPageParam) {
            const pagination = parsePagination(searchParams);
            const [posts, total] = await prisma.$transaction([
                prisma.post.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.pageSize,
                    include: {
                        authorModel: { select: { name: true, image: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.post.count({ where }),
            ]);
            return NextResponse.json(paginatedResponse(posts, total, pagination));
        }

        // Legacy: return all posts (no pagination)
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

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = PostCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const {
            title, slug, excerpt, content, featuredImage,
            categories, tags, author, authorId, status, postType, seo,
            scheduledAt,
        } = parsed.data;

        const data: Prisma.PostUncheckedCreateInput = {
            title,
            slug,
            excerpt: excerpt || '',
            content: content || '',
            featuredImage,
            categories: normalizeCategories(categories),
            tags: tags || [],
            author: author || 'HyzenPro Team',
            authorId: authorId || undefined,
            status,
            postType: postType || 'post',
            seo: seo || undefined,
            readingTime: calculateReadingTime(content || ''),
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
            // Ping search engines about new content
            pingNewPost(slug).catch(() => {});
        }

        // Invalidate cached posts data for admin and listing
        revalidateContent('posts', slug).catch(() => {});

        // Save initial revision snapshot
        try {
            await prisma.postRevision.create({
                data: {
                    postId: post.id,
                    title: post.title,
                    content: post.content,
                    excerpt: post.excerpt || null,
                    author: session.user?.email || 'HyzenPro Team',
                    wordCount: post.readingTime ? post.readingTime * 200 : null,
                },
            });
        } catch {
            // Non-critical
        }

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
