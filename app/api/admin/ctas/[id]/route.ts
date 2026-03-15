import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PUT /api/admin/ctas/[id] — Update a CTA
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { name, slug, headline, description, buttonText, buttonUrl, style, isActive } = body;

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
    } catch (error: any) {
        if (error?.code === 'P2002') {
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
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
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
