import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/tools — List all tools (optional ?status=published)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const tools = await prisma.tool.findMany({
            where: status ? { status } : undefined,
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
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name, slug, shortDescription, longDescription, websiteUrl,
            pricingType, status, logo, featured, features, pros, cons,
            primaryCategory, categoryIds, rating, meta, seo,
        } = body;

        const tool = await prisma.tool.create({
            data: {
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
                meta: meta || null,
                seo: seo || undefined,
            },
        });

        // Update category toolCounts
        if (categoryIds?.length) {
            for (const catId of categoryIds) {
                const tools = await prisma.tool.findMany({
                    where: { categoryIds: { has: catId } },
                    select: { id: true },
                });
                await prisma.category.update({
                    where: { id: catId },
                    data: { toolCount: tools.length, toolIds: tools.map((t: any) => t.id) },
                });
            }
        }

        return NextResponse.json(tool, { status: 201 });
    } catch (error: any) {
        console.error('Error creating tool:', error);
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A tool with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
    }
}
