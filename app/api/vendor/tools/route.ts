import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const tools = await prisma.tool.findMany({
            where: { submittedById: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                logo: true,
                pricingType: true,
                status: true,
                views: true,
                rating: true,
                primaryCategory: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Failed to fetch vendor tools:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name, websiteUrl, shortDescription, pricingType, primaryCategory } = body;

        if (!name || !websiteUrl || !shortDescription) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Check if slug already exists
        const existing = await prisma.tool.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'A tool with this name already exists' }, { status: 409 });
        }

        const tool = await prisma.tool.create({
            data: {
                name,
                slug,
                shortDescription,
                longDescription: shortDescription,
                websiteUrl,
                pricingType: pricingType || 'freemium',
                primaryCategory: primaryCategory || null,
                status: 'draft', // Submitted tools start as draft for moderation
                submittedById: user.id,
                features: [],
                pros: [],
                cons: [],
                categoryIds: [],
                alternativeIds: [],
            },
        });

        return NextResponse.json(tool, { status: 201 });
    } catch (error) {
        console.error('Failed to submit vendor tool:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
