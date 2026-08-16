import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { prepareToolForSave, revalidateToolPaths, syncToolCategoryRelations } from '@/lib/tool-publish';
import { parsePagination, paginatedResponse } from '@/lib/pagination';

// GET /api/tools — List published tools (optional ?status=published, ?page=1&pageSize=20)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const hasPageParam = searchParams.has('page');

        const where: Prisma.ToolWhereInput = status ? { status } : { status: 'published' };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        // If page param is present, return paginated results
        if (hasPageParam) {
            const pagination = parsePagination(searchParams);
            const [tools, total] = await prisma.$transaction([
                prisma.tool.findMany({
                    where,
                    skip: pagination.skip,
                    take: pagination.pageSize,
                    include: { categories: true },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.tool.count({ where }),
            ]);
            return NextResponse.json(paginatedResponse(tools, total, pagination));
        }

        // Legacy: return all tools (no pagination)
        const tools = await prisma.tool.findMany({
            where,
            include: { categories: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Error fetching tools:', error);
        return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }
}

// POST /api/tools — Create a new tool
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name, slug, shortDescription, longDescription, websiteUrl,
            pricingType, status, logo, featured, features, pros, cons,
            primaryCategory, categoryIds, rating, meta, seo,
        } = body;

        // Basic validation
        if (!name || typeof name !== 'string' || name.length > 200) {
            return NextResponse.json({ error: 'Name is required and must be under 200 characters.' }, { status: 400 });
        }
        if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json({ error: 'Slug is required and must be lowercase alphanumeric with hyphens.' }, { status: 400 });
        }
        if (!shortDescription || typeof shortDescription !== 'string' || shortDescription.length > 500) {
            return NextResponse.json({ error: 'Short description is required and must be under 500 characters.' }, { status: 400 });
        }

        const prepared = await prepareToolForSave({
            name,
            slug,
            shortDescription,
            longDescription,
            websiteUrl,
            pricingType: pricingType || 'freemium',
            status: status || 'draft',
            logo,
            featured: featured || false,
            features: features || [],
            pros: pros || [],
            cons: cons || [],
            primaryCategory,
            categoryIds: categoryIds || [],
            rating: rating ? parseFloat(rating) : null,
            meta,
            seo,
        });

        const tool = await prisma.tool.create({
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
            },
        });

        await syncToolCategoryRelations(tool.id, prepared.primaryCategory!, prepared.categoryIds || []);

        if (tool.status === 'published') {
            revalidateToolPaths(tool.primaryCategory, tool.slug);
        }

        return NextResponse.json(tool, { status: 201 });
    } catch (error) {
        console.error('Error creating tool:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A tool with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
    }
}
