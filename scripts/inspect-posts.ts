import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.post.findMany({
        select: {
            slug: true,
            title: true,
            status: true
        }
    });
    console.log("Posts in DB:", posts);
}

main().finally(() => prisma.$disconnect());
