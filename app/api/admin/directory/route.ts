import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const DirectoryUpdateSchema = z.object({
    sectionId: z.enum(['directory-seo', 'directory-cta']),
    title: z.string().max(300).optional(),
    subtitle: z.string().max(500).optional(),
    content: z.record(z.string(), z.any()).optional(),
    enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
    const token = await requireAdminToken(req);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await req.json();
        const parsed = DirectoryUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { sectionId, title, subtitle, content, enabled } = parsed.data;

        const section = await prisma.siteContent.upsert({
            where: { sectionId },
            update: {
                ...(title !== undefined && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(content !== undefined && { content: content as unknown as Prisma.InputJsonValue }),
                ...(enabled !== undefined && { enabled }),
            },
            create: {
                sectionId,
                title: title || '',
                subtitle: subtitle || '',
                content: (content || {}) as unknown as Prisma.InputJsonValue,
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
