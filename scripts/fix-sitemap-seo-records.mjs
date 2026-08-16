const TOOL_FIXES = [
    'claude-4-7-opus',
    'claude-4-5-haiku',
    'gemini-flash',
    'gpt-3',
    'gpt-3-5-turbo',
    'gpt-4',
];

if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL is not set. SEO record fixes skipped.');
    process.exit(0);
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
    const chatbotCategory = await prisma.category.findUnique({
        where: { slug: 'ai-chatbots' },
        select: { id: true },
    });

    if (!chatbotCategory) {
        throw new Error('Missing ai-chatbots category');
    }

    let updatedTools = 0;
    for (const slug of TOOL_FIXES) {
        const tool = await prisma.tool.findUnique({ where: { slug }, select: { categoryIds: true } });
        if (!tool) continue;

        await prisma.tool.update({
            where: { slug },
            data: {
                primaryCategory: 'ai-chatbots',
                categoryIds: Array.from(new Set([...(tool.categoryIds || []), chatbotCategory.id])),
            },
        });
        updatedTools += 1;
    }

    const post = await prisma.post.findUnique({
        where: { slug: 'best-ai-coding-assistants-in-2025' },
        select: { id: true, seo: true },
    });

    if (post) {
        const seo = post.seo && typeof post.seo === 'object' ? post.seo : {};
        await prisma.post.update({
            where: { id: post.id },
            data: {
                slug: 'best-ai-coding-assistants-2026',
                seo: {
                    ...seo,
                    canonicalUrl: 'https://hyzenpro.com/blog/best-ai-coding-assistants-2026/',
                },
            },
        });
    }

    console.log(`Updated ${updatedTools} tool category records.`);
    console.log(post ? 'Renamed best-ai-coding-assistants-in-2025 to best-ai-coding-assistants-2026.' : 'No stale coding assistants post slug found.');
} finally {
    await prisma.$disconnect();
}
