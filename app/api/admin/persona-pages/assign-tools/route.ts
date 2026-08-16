import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { pageId, toolSlugs } = body;

        if (!pageId || !toolSlugs || !Array.isArray(toolSlugs)) {
            return NextResponse.json({ error: 'pageId and toolSlugs[] required' }, { status: 400 });
        }

        const page = await prisma.personaPage.findUnique({
            where: { id: pageId },
            select: { toolIds: true },
        });

        if (!page) {
            return NextResponse.json({ error: 'Persona page not found' }, { status: 404 });
        }

        const tools = await prisma.tool.findMany({
            where: { slug: { in: toolSlugs }, status: 'published' },
            select: { id: true, slug: true },
        });

        const newToolIds = tools.map(t => t.id);
        const oldToolIds = page.toolIds || [];

        const removedToolIds = oldToolIds.filter(tid => !newToolIds.includes(tid));
        const addedToolIds = newToolIds.filter(tid => !oldToolIds.includes(tid));

        await prisma.personaPage.update({
            where: { id: pageId },
            data: { toolIds: newToolIds },
        });

        // Sync Tool.personaPageIds
        if (removedToolIds.length > 0) {
            for (const toolId of removedToolIds) {
                const tool = await prisma.tool.findUnique({
                    where: { id: toolId },
                    select: { personaPageIds: true },
                });
                if (tool) {
                    await prisma.tool.update({
                        where: { id: toolId },
                        data: {
                            personaPageIds: tool.personaPageIds.filter(tid => tid !== pageId),
                        },
                    });
                }
            }
        }

        if (addedToolIds.length > 0) {
            await prisma.tool.updateMany({
                where: { id: { in: addedToolIds } },
                data: {
                    personaPageIds: {
                        push: pageId,
                    },
                },
            });
        }

        return NextResponse.json({ success: true, pageId, toolIds: newToolIds });
    } catch (error) {
        console.error('Failed to assign tools:', error);
        return NextResponse.json({ error: 'Failed to assign tools' }, { status: 500 });
    }
}