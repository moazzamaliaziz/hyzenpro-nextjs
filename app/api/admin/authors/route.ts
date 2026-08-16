import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from '@/lib/api-auth';
import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client';
import { AuthorCreateSchema } from '@/lib/schemas/author.schema';

// GET all authors
export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const authors = await prisma.author.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(authors);
    } catch (error) {
        console.error("[AUTHORS_GET]", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// CREATE new author
export async function POST(req: NextRequest) {
    const token = await requireAdminToken(req);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await req.json();
        const parsed = AuthorCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, slug, role, bio, image, socialLinks } = parsed.data;

        // Check if slug exists
        const existing = await prisma.author.findUnique({
            where: { slug }
        });

        if (existing) {
            return NextResponse.json({ error: 'Author with this slug already exists' }, { status: 400 });
        }

        const author = await prisma.author.create({
            data: {
                name,
                slug,
                role,
                bio,
                image,
                socialLinks: socialLinks as unknown as Prisma.InputJsonValue
            }
        });

        return NextResponse.json(author);
    } catch (error) {
        console.error("[AUTHORS_POST]", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
