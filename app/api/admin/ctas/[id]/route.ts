import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@/lib/prisma';
import { CtaUpdateSchema } from '@/lib/schemas/cta.schema';

// PUT /api/admin/ctas/[id] — Update a CTA
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = CtaUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, slug, headline, description, buttonText, buttonUrl, style, isActive } = parsed.data;

        const cta = await prisma.cTA.update({
            where: { id },
            data: {
                name,
                slug,
                headline,
                description,
                buttonText,
                buttonUrl,
                style,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        return NextResponse.json(cta);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: 'A CTA with this name or slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update CTA' }, { status: 500 });
    }
}

// DELETE /api/admin/ctas/[id] — Delete a CTA
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await params;
        await prisma.cTA.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete CTA' }, { status: 500 });
    }
}
