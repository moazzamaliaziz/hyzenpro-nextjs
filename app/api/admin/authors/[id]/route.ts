import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const { name, slug, role, bio, image, socialLinks } = body;

        // Check if updating slug to one that exists on another author
        if (slug) {
            const existing = await prisma.author.findFirst({
                where: {
                    slug,
                    id: { not: id }
                }
            });

            if (existing) {
                return new NextResponse("Author with this slug already exists", { status: 400 });
            }
        }

        const author = await prisma.author.update({
            where: { id },
            data: {
                name,
                slug,
                role,
                bio,
                image,
                socialLinks
            }
        });

        return NextResponse.json(author);
    } catch (error) {
        console.error("[AUTHOR_PUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await context.params;

        // Check if author has posts
        const author = await prisma.author.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        if (!author) {
            return new NextResponse("Author not found", { status: 404 });
        }

        if (author._count.posts > 0) {
            return new NextResponse("Cannot delete author with existing posts. Reassign posts first.", { status: 400 });
        }

        await prisma.author.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[AUTHOR_DELETE]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
