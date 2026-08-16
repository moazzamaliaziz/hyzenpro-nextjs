import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { prepareToolForSave, revalidateToolPaths, syncToolCategoryRelations } from '@/lib/tool-publish';

// GET /api/tools/[id] — Get single tool
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tool = await prisma.tool.findUnique({
            where: { id },
            include: { categories: true },
        });
        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        return NextResponse.json(tool);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
    }
}

// PUT /api/tools/[id] — Update tool
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
        const {
            name, slug, shortDescription, longDescription, websiteUrl,
            pricingType, status, logo, featured, features, pros, cons,
            primaryCategory, categoryIds, rating, meta, seo, personaPageIds,
        } = body;

        // Basic validation
        if (name !== undefined && (typeof name !== 'string' || name.length > 200)) {
            return NextResponse.json({ error: 'Name must be under 200 characters.' }, { status: 400 });
        }
        if (slug !== undefined && (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) {
            return NextResponse.json({ error: 'Slug must be lowercase alphanumeric with hyphens.' }, { status: 400 });
        }
        if (shortDescription !== undefined && (typeof shortDescription !== 'string' || shortDescription.length > 500)) {
            return NextResponse.json({ error: 'Short description must be under 500 characters.' }, { status: 400 });
        }

        const existing = await prisma.tool.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        const prepared = await prepareToolForSave({
            name,
            slug,
            shortDescription,
            longDescription,
            websiteUrl,
            pricingType,
            status,
            logo,
            featured,
            features: features || [],
            pros: pros || [],
            cons: cons || [],
            primaryCategory,
            categoryIds: categoryIds || [],
            rating: rating ? parseFloat(rating) : null,
            meta,
            seo,
        });

        const tool = await prisma.tool.update({
            where: { id },
            data: {
                name: prepared.name,
                slug: prepared.slug,
                shortDescription: prepared.shortDescription,
                longDescription: prepared.longDescription,
                websiteUrl: prepared.websiteUrl,
                pricingType: prepared.pricingType,
                status: prepared.status,
                logo: prepared.logo,
                featured: prepared.featured || false,
                features: prepared.features || [],
                pros: prepared.pros || [],
                cons: prepared.cons || [],
                primaryCategory: prepared.primaryCategory!,
                categoryIds: prepared.categoryIds || [],
                rating: prepared.rating ?? null,
                meta: prepared.meta as unknown as Prisma.InputJsonValue,
                seo: prepared.seo as any,
                personaPageIds: personaPageIds || existing.personaPageIds || [],
            },
        });

        await syncToolCategoryRelations(tool.id, prepared.primaryCategory!, prepared.categoryIds || []);

        if (tool.status === 'published' || existing.status === 'published') {
            revalidateToolPaths(tool.primaryCategory, tool.slug);
            if (existing.slug !== tool.slug || existing.primaryCategory !== tool.primaryCategory) {
                revalidateToolPaths(existing.primaryCategory, existing.slug);
            }
        }

        return NextResponse.json(tool);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A tool with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
    }
}

// DELETE /api/tools/[id] — Delete tool
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
        await prisma.tool.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }
}
