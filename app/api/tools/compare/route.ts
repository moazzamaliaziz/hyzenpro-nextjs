import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
        return NextResponse.json({ error: 'Missing tool IDs' }, { status: 400 });
    }

    const idArray = ids.split(',').filter(Boolean);

    try {
        const tools = await prisma.tool.findMany({
            where: {
                id: {
                    in: idArray,
                },
                status: 'published'
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                shortDescription: true,
                websiteUrl: true,
                pricingType: true,
                features: true,
                pros: true,
                cons: true,
                rating: true,
                views: true,
                primaryCategory: true,
            }
        });

        // Prisma doesn't guarantee the order of `in`, so we map the array back to match the requested ID order
        const sortedTools = idArray.map((id) => tools.find((t) => t.id === id)).filter(Boolean);

        return NextResponse.json(sortedTools);
    } catch (error) {
        console.error("Failed to fetch compare tools", error);
        return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }
}
