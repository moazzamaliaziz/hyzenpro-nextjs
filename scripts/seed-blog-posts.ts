import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSTS = [
    {
        title: 'Claude Opus 4.8 vs GPT-5.5: The Complete Coding Benchmark Comparison',
        slug: 'claude-opus-4-8-vs-gpt-5-5-coding-benchmark',
        excerpt: 'Claude Opus 4.8 and GPT-5.5 are the two most capable coding models available in June 2026. We break down every major benchmark—SWE-Bench Pro, Terminal-Bench, HumanEval, LiveCodeBench, and more—to explain which model actually writes better code.',
        content: '<h2 id="overview">Model Overview</h2><p>Claude Opus 4.8 launched on May 22, 2026. GPT-5.5 shipped on May 16, 2026. Both claim the title of most capable coding model. This guide compares their real-world performance across every available benchmark.</p><h2 id="benchmarks">Coding Benchmarks</h2><p>Opus 4.8 scores 72.5% on SWE-Bench Pro, compared to GPT-5.5 at 68.2%. On Terminal-Bench, Opus 4.8 reaches 64.8% versus GPT-5.5 at 58.3%. HumanEval shows a smaller gap: Opus 4.8 at 96.4% and GPT-5.5 at 94.1%.</p><h2 id="pricing">Pricing</h2><p>Opus 4.8 costs $15 per million input tokens and $75 per million output tokens. GPT-5.5 costs $5.00 per million input tokens and $20 per million output tokens.</p><h2 id="verdict">Verdict</h2><p>Opus 4.8 wins on raw capability. GPT-5.5 wins on cost-efficiency. Choose based on whether you need maximum coding performance or the best price-to-performance ratio.</p>',
        categories: ['AI Coding Tools', 'Comparisons'],
        tags: ['claude opus', 'gpt-5.5', 'coding benchmarks', 'ai coding', 'comparison'],
        author: 'HyzenPro Team',
        status: 'published',
        postType: 'comparison',
        readingTime: 8,
        publishedAt: new Date('2026-06-10T10:00:00Z'),
    },
    {
        title: 'Claude Fable 5 and Mythos 5: Everything We Know About Anthropic\'s Most Capable Models',
        slug: 'claude-fable-5-mythos-5',
        excerpt: 'Claude Fable 5 and Mythos 5 launched on June 9, 2026. They are Anthropic\'s most capable models ever. Fable 5 routes between three sub-models. Mythos 5 operates without safety fallback. This guide covers every benchmark, feature, and pricing detail.',
        content: '<h2 id="overview">Model Overview</h2><p>Anthropic announced Claude Fable 5 and Mythos 5 on June 9, 2026. Fable 5 is the successor to Opus 4.8. It uses a router architecture that dynamically delegates queries to one of three specialized sub-models: Opus 5, Sonnet 5, and Haiku 5.</p><h2 id="benchmarks">Benchmark Results</h2><p>Fable 5 achieves 80.3% on SWE-Bench Pro, 88.0% on Terminal-Bench 2.1, and 85.0% on OSWorld-Verified. Mythos 5 scores 85.4% on OSWorld-Verified and 84.6% on SWE-Bench Pro.</p><h2 id="pricing">Pricing</h2><p>Fable 5 costs $10 per million input tokens and $50 per million output tokens. Mythos 5 costs $20 per million input tokens and $100 per million output tokens.</p><h2 id="verdict">Verdict</h2><p>Fable 5 is Anthropic\'s new default model. It delivers better performance than Opus 4.8 at the same price. Mythos 5 is the premium option for maximum capability without safety restrictions.</p>',
        categories: ['AI Model Releases', 'Comparisons'],
        tags: ['claude fable 5', 'claude mythos 5', 'anthropic', 'ai models', 'comparison'],
        author: 'HyzenPro Team',
        status: 'published',
        postType: 'comparison',
        readingTime: 10,
        publishedAt: new Date('2026-06-12T10:00:00Z'),
    },
];

async function main() {
    console.log('Seeding blog posts...');

    for (const postData of POSTS) {
        const existing = await prisma.post.findUnique({
            where: { slug: postData.slug },
        });

        if (existing) {
            console.log(`Post "${postData.slug}" already exists, skipping.`);
            continue;
        }

        const post = await prisma.post.create({
            data: postData,
        });

        console.log(`Created post: ${post.title} (${post.slug})`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
