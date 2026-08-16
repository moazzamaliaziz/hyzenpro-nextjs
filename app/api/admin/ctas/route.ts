import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CtaUpdateSchema } from '@/lib/schemas/cta.schema';
import { z } from 'zod';

// GET /api/admin/ctas — List all CTAs
export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const CtaCreateSchema = CtaUpdateSchema.extend({
            name: z.string().min(1).max(200),
            slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
            buttonText: z.string().min(1).max(100),
            buttonUrl: z.string().url(),
        });
        const parsed = CtaCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, slug, headline, description, buttonText, buttonUrl, style } = parsed.data;

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
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A CTA with this name or slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create CTA' }, { status: 500 });
    }
}
