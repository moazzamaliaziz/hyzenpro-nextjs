import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { PersonaPageCreateSchema } from '@/lib/schemas/persona-page.schema';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await params;

        const page = await prisma.personaPage.findUnique({
            where: { id },
            include: {
                tools: {
                    where: { status: 'published' },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        shortDescription: true,
                        logo: true,
                        pricingType: true,
                        rating: true,
                        primaryCategory: true,
                        views: true,
                        featured: true,
                    },
                },
            },
        });

        if (!page) {
            return NextResponse.json({ error: 'Persona page not found' }, { status: 404 });
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error('Failed to fetch persona page:', error);
        return NextResponse.json({ error: 'Failed to fetch persona page' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = PersonaPageCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const { toolSlugs, ...data } = parsed.data;

        const existingPage = await prisma.personaPage.findUnique({
            where: { id },
            select: { toolIds: true },
        });

        if (!existingPage) {
            return NextResponse.json({ error: 'Persona page not found' }, { status: 404 });
        }

        // Look up tool IDs from slugs
        let toolIds: string[] = [];
        if (toolSlugs && toolSlugs.length > 0) {
            const tools = await prisma.tool.findMany({
                where: { slug: { in: toolSlugs }, status: 'published' },
                select: { id: true, slug: true },
            });
            toolIds = tools.map(t => t.id);
        }

        // Update page
        const page = await prisma.personaPage.update({
            where: { id },
            data: {
                ...data,
                toolIds,
            },
        });

        // Sync Tool.personaPageIds: remove from old, add to new
        const oldToolIds = existingPage.toolIds || [];
        const newToolIds = toolIds;

        const removedToolIds = oldToolIds.filter(tid => !newToolIds.includes(tid));
        const addedToolIds = newToolIds.filter(tid => !oldToolIds.includes(tid));

        if (removedToolIds.length > 0) {
            await prisma.tool.updateMany({
                where: { id: { in: removedToolIds } },
                data: {
                    personaPageIds: {
                        set: [],
                    },
                },
            });
            // Re-add all other personaPageIds for those tools
            for (const toolId of removedToolIds) {
                const tool = await prisma.tool.findUnique({
                    where: { id: toolId },
                    select: { personaPageIds: true },
                });
                if (tool) {
                    await prisma.tool.update({
                        where: { id: toolId },
                        data: {
                            personaPageIds: tool.personaPageIds.filter(tid => tid !== id),
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
                        push: id,
                    },
                },
            });
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error('Failed to update persona page:', error);
        return NextResponse.json({ error: 'Failed to update persona page' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await params;

        const existingPage = await prisma.personaPage.findUnique({
            where: { id },
            select: { toolIds: true },
        });

        if (!existingPage) {
            return NextResponse.json({ error: 'Persona page not found' }, { status: 404 });
        }

        // Remove page reference from all assigned tools
        if (existingPage.toolIds && existingPage.toolIds.length > 0) {
            for (const toolId of existingPage.toolIds) {
                const tool = await prisma.tool.findUnique({
                    where: { id: toolId },
                    select: { personaPageIds: true },
                });
                if (tool) {
                    await prisma.tool.update({
                        where: { id: toolId },
                        data: {
                            personaPageIds: tool.personaPageIds.filter(tid => tid !== id),
                        },
                    });
                }
            }
        }

        await prisma.personaPage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete persona page:', error);
        return NextResponse.json({ error: 'Failed to delete persona page' }, { status: 500 });
    }
}