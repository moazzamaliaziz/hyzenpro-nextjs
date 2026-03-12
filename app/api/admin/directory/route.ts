import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const sections = await prisma.siteContent.findMany({
            where: {
                sectionId: {
                    in: ['directory-seo', 'directory-cta']
                }
            }
        });
        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch directory content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { sectionId, title, subtitle, content, enabled } = body;

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
            },
            create: {
                sectionId,
                title: title || '',
                subtitle: subtitle || '',
                content: content || {},
                enabled: enabled ?? true,
                sortOrder: 10,
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error('Failed to update directory content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
