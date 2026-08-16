import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('[CATEGORIES_GET]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
