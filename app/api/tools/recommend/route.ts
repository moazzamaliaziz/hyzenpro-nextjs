import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const pricing = searchParams.get('pricing');
    const sort = searchParams.get('sort') || 'views';

    const where: any = {
        status: 'published',
    };

    if (category) {
        where.primaryCategory = category;
    }

    if (pricing && pricing !== 'any') {
        where.pricingType = pricing;
    }

    const orderBy: any = {};
    if (sort === 'views') {
        orderBy.views = 'desc';
    } else if (sort === 'rating') {
        orderBy.rating = 'desc';
    } else {
        orderBy.createdAt = 'desc';
    }

    try {
        const tools = await prisma.tool.findMany({
            where,
            orderBy,
            take: 9,
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                logo: true,
                pricingType: true,
                rating: true,
                primaryCategory: true,
                featured: true,
                views: true,
            },
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Failed to recommend tools:', error);
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }
}
