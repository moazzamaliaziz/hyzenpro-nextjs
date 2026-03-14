import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all authors
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const authors = await prisma.author.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(authors);
    } catch (error) {
        console.error("[AUTHORS_GET]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

// CREATE new author
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { name, slug, role, bio, image, socialLinks } = body;

        if (!name || !slug) {
            return new NextResponse("Name and slug are required", { status: 400 });
        }

        // Check if slug exists
        const existing = await prisma.author.findUnique({
            where: { slug }
        });

        if (existing) {
            return new NextResponse("Author with this slug already exists", { status: 400 });
        }

        const author = await prisma.author.create({
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
        console.error("[AUTHORS_POST]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
