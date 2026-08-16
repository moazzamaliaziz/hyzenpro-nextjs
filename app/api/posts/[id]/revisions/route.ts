import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { RevisionCreateSchema } from '@/lib/schemas/post.schema';

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
        const revisions = await prisma.postRevision.findMany({
            where: { postId: id },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(revisions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
    }
}

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
        const parsed = RevisionCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const revision = await prisma.postRevision.create({
            data: {
                postId: id,
                title: parsed.data.title || post.title,
                content: parsed.data.content || post.content,
                excerpt: parsed.data.excerpt || post.excerpt || null,
                author: session.user.email || 'HyzenPro Team',
                reason: parsed.data.reason || null,
                wordCount: parsed.data.wordCount || null,
            },
        });

        return NextResponse.json(revision, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save revision' }, { status: 500 });
    }
}