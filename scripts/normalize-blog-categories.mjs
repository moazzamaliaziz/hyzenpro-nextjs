const CATEGORY_MAP = {
    'ai automation': ['AI Automation'],
    'ai benchmarks': ['AI Benchmarks'],
    'ai chatbots': ['AI Chatbots'],
    'ai coding tools': ['AI Coding Tools'],
    'ai image tools': ['AI Image Tools'],
    'ai marketing tools': ['AI Marketing Tools'],
    'ai tools': ['AI Tools'],
    'ai tools for business': ['AI Tools for Business'],
    'ai video tools': ['AI Video Tools'],
    'ai writing tools': ['AI Writing Tools'],
    'agentic ai': ['Agentic AI'],
    'llm comparison': ['LLM Comparison'],
    review: ['Reviews'],
    reviews: ['Reviews'],
    comparison: ['Comparisons'],
    comparisons: ['Comparisons'],
    tutorial: ['Tutorials'],
    tutorials: ['Tutorials'],
    'ai-agentic-tools': ['Agentic AI'],
    'ai-use-cases': ['AI Tools for Business'],
    'reviews & comparisons': ['Reviews', 'Comparisons'],
};

function toTitleCase(value) {
    const titled = String(value)
        .trim()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    return titled
        .replace(/\bAi\b/g, 'AI')
        .replace(/\bLlm\b/g, 'LLM')
        .replace(/\bFor\b/g, 'for');
}

function normalizeCategories(categories) {
    const normalized = (Array.isArray(categories) ? categories : []).flatMap((category) => {
        if (typeof category !== 'string') return [];
        const key = category.trim().toLowerCase();
        return CATEGORY_MAP[key] || [toTitleCase(category)];
    });

    return Array.from(new Set(normalized.filter(Boolean)));
}

if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL is not set. Category normalization skipped.');
    process.exit(0);
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
    const posts = await prisma.post.findMany({
        select: { id: true, slug: true, categories: true },
    });
    let changed = 0;

    for (const post of posts) {
        const nextCategories = normalizeCategories(post.categories);
        if (JSON.stringify(nextCategories) === JSON.stringify(post.categories || [])) continue;

        await prisma.post.update({
            where: { id: post.id },
            data: { categories: nextCategories },
        });
        changed += 1;
    }

    console.log(`Normalized categories for ${changed} posts.`);
} finally {
    await prisma.$disconnect();
}
