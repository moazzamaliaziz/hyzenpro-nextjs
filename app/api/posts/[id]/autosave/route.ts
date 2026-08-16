import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { AutosaveSchema } from '@/lib/schemas/post.schema';

// POST /api/posts/[id]/autosave — Save a revision
export async function POST(
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
        const parsed = AutosaveSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { title, content, excerpt, reason } = parsed.data;

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Count words in content
        const wordCount = (content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

        // Create revision
        const revision = await prisma.postRevision.create({
            data: {
                postId: id,
                title: title || post.title,
                content: content || post.content,
                excerpt: excerpt || post.excerpt || '',
                author: session.user.name || 'Admin',
                reason: reason || null,
                wordCount,
            },
        });

        // Also update the post itself
        await prisma.post.update({
            where: { id },
            data: {
                title: title || post.title,
                content: content || post.content,
                excerpt: excerpt ?? post.excerpt,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ revision, success: true });
    } catch (error) {
        console.error('[Autosave] Failed to save revision:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

// GET /api/posts/[id]/autosave — Get revision history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const revisions = await prisma.postRevision.findMany({
            where: { postId: id },
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 100),
            select: {
                id: true,
                title: true,
                excerpt: true,
                author: true,
                reason: true,
                wordCount: true,
                createdAt: true,
            },
        });

        return NextResponse.json(revisions);
    } catch (error) {
        console.error('[Autosave] Failed to fetch revisions:', error);
        return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
    }
}
