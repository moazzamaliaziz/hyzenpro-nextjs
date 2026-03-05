import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

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
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name, slug, shortDescription, longDescription, websiteUrl,
            pricingType, status, logo, featured, features, pros, cons,
            primaryCategory, categoryIds, rating, meta, seo,
        } = body;

        const tool = await prisma.tool.update({
            where: { id },
            data: {
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
                meta: meta || null,
                seo: seo || undefined,
            },
        });

        return NextResponse.json(tool);
    } catch (error: any) {
        if (error?.code === 'P2002') {
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
    if (!session?.user) {
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
