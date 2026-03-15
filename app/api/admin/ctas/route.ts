import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/ctas — List all CTAs
export async function GET() {
    try {
        const ctas = await prisma.cTA.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(ctas);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch CTAs' }, { status: 500 });
    }
}

// POST /api/admin/ctas — Create a new CTA
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, slug, headline, description, buttonText, buttonUrl, style } = body;

        if (!name || !slug || !buttonText || !buttonUrl) {
            return NextResponse.json({ error: 'Name, slug, button text, and button URL are required' }, { status: 400 });
        }

        const cta = await prisma.cTA.create({
            data: {
                name,
                slug,
                headline: headline || null,
                description: description || null,
                buttonText,
                buttonUrl,
                style: style || 'default',
            },
        });

        return NextResponse.json(cta, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A CTA with this name or slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create CTA' }, { status: 500 });
    }
}
