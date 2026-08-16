import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { PersonaPageCreateSchema } from '@/lib/schemas/persona-page.schema';

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const pages = await prisma.personaPage.findMany({
            include: {
                tools: {
                    select: { id: true },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        const result = pages.map(page => ({
            id: page.id,
            name: page.name,
            slug: page.slug,
            status: page.status,
            toolsCount: page.tools.length,
            publishedAt: page.publishedAt,
            sortOrder: page.sortOrder,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch persona pages:', error);
        return NextResponse.json({ error: 'Failed to fetch persona pages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = PersonaPageCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const { toolSlugs, ...data } = parsed.data;

        // Look up tool IDs from slugs
        let toolIds: string[] = [];
        if (toolSlugs && toolSlugs.length > 0) {
            const tools = await prisma.tool.findMany({
                where: { slug: { in: toolSlugs }, status: 'published' },
                select: { id: true, slug: true },
            });
            toolIds = tools.map(t => t.id);
        }

        const page = await prisma.personaPage.create({
            data: {
                ...data,
                toolIds,
            },
        });

        // Sync Tool.personaPageIds
        if (toolIds.length > 0) {
            await prisma.tool.updateMany({
                where: { id: { in: toolIds } },
                data: {
                    personaPageIds: {
                        push: page.id,
                    },
                },
            });
        }

        return NextResponse.json(page, { status: 201 });
    } catch (error) {
        console.error('Failed to create persona page:', error);
        return NextResponse.json({ error: 'Failed to create persona page' }, { status: 500 });
    }
}