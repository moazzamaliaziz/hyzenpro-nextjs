import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Searching SiteContent...");
    const siteContent = await prisma.siteContent.findMany();
    for (const item of siteContent) {
        if (JSON.stringify(item.data).includes('/category/')) {
            console.log(`Found in SiteContent ID: ${item.id}, Type: ${item.type}`);
        }
    }

    console.log("Searching Posts...");
    const posts = await prisma.post.findMany({ select: { slug: true, content: true } });
    for (const post of posts) {
        if (post.content && post.content.includes('/category/')) {
            console.log(`Found in Post Slug: ${post.slug}`);
        }
    }

    console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
