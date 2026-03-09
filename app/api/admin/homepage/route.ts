import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET all homepage sections
export async function GET() {
    try {
        const sections = await prisma.siteContent.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch homepage content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT — upsert a homepage section
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { sectionId, title, subtitle, content, enabled, sortOrder } = body;

        if (!sectionId) {
            return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
        }

        const section = await prisma.siteContent.upsert({
            where: { sectionId },
            update: {
                ...(title !== undefined && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(content !== undefined && { content }),
                ...(enabled !== undefined && { enabled }),
                ...(sortOrder !== undefined && { sortOrder }),
            },
            create: {
                sectionId,
                title: title || '',
                subtitle: subtitle || '',
                content: content || {},
                enabled: enabled ?? true,
                sortOrder: sortOrder ?? 0,
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error('Failed to update homepage content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
