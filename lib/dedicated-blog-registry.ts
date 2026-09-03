export interface DedicatedBlogEntry {
    slug: string;
    title: string;
    description: string;
    featuredImage: string | null;
    publishedAt: string;
    categories: string[];
    tags: string[];
    author: string;
}

export const DEDICATED_BLOG_ENTRIES: DedicatedBlogEntry[] = [
    {
        slug: 'claude-sonnet-5-review',
        title: 'Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8',
        description:
            'Claude Sonnet 5 launched June 30, 2026 with 63.2% on SWE-bench Pro, 80.4% on Terminal-Bench, and pricing from $2/$10 per million tokens. Full benchmark breakdown, pricing, and honest comparison to Opus 4.8.',
        featuredImage: null,
        publishedAt: '2026-07-01T09:00:00.000Z',
        categories: ['AI Chatbots', 'AI Tools'],
        tags: ['Claude Sonnet 5', 'Anthropic', 'AI Benchmarks', 'SWE-Bench Pro', 'Claude Opus 4.8', 'AI Coding Tools', 'Terminal-Bench', 'AI Pricing', 'AI Model Review', 'Agentic AI'],
        author: 'Ali Malik',
    },
    {
        slug: 'cursor-composer-2-5-review',
        title: 'Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task',
        description:
            'Cursor Composer 2.5 hits 63.2% on AI coding benchmarks -- near Opus-4.7 max -- at just $0.55 avg cost per task. Full review: benchmarks, training method, pricing, and the Theo controversy.',
        featuredImage: '/images/blog/cursor-composer-2-5.png',
        publishedAt: '2026-05-20T12:00:00.000Z',
        categories: ['AI Coding Tools', 'AI Tools'],
        tags: ['Cursor AI', 'Composer 2.5', 'AI Coding Tools', 'LLM Benchmarks', 'Kimi K2.5', 'SpaceX AI', 'Agentic Coding'],
        author: 'Ali Malik',
    },
    {
        slug: 'google-antigravity-2-review',
        title: 'Google Antigravity 2.0 Review: 93 Parallel Agents Built a Working OS in 12 Hours',
        description:
            "Google's new AI agent platform built a working OS in 12 hours using 93 parallel agents and Gemini 3.5 Flash -- for under $1,000. Full in-depth review of Google Antigravity 2.0.",
        featuredImage: 'https://hyzenpro.com/media/6a0cd85f260a9268d663e19e/google-antigravity.png',
        publishedAt: '2026-05-20T00:00:00.000Z',
        categories: ['Agentic AI', 'AI Tools'],
        tags: ['Google Antigravity', 'Agentic AI', 'Google I/O 2026', 'Gemini 3.5 Flash', 'Software Engineering'],
        author: 'Rana Aqib',
    },
    {
        slug: 'claude-opus-4-8-vs-gpt-5-5-coding-benchmark',
        title: 'Claude Opus 4.8 vs GPT-5.5 Coding Benchmark: Who Wins in 2026?',
        description:
            'Claude Opus 4.8 vs GPT-5.5 coding benchmark -- head-to-head on SWE-bench Pro, computer use, pricing & real workflows. Clear winner, one honest caveat.',
        featuredImage: null,
        publishedAt: '2026-05-29T10:00:00.000Z',
        categories: ['AI Coding Tools', 'AI Tools'],
        tags: ['Claude Opus 4.8', 'GPT-5.5', 'AI Coding Benchmark', 'Best AI Coding 2026', 'Agentic AI', 'SWE-Bench Pro', 'Anthropic vs OpenAI', 'DeepSeek V4', 'Claude Code'],
        author: 'Ali Malik',
    },
    {
        slug: 'claude-fable-5-mythos-5',
        title: 'Claude Fable 5.1 and Mythos 5.1: What Anthropic Actually Announced',
        description:
            'Anthropic’s Claude Fable 5.1 and Mythos 5.1 explained: availability, pricing claims, safeguards, benchmark context, and what the release means for coding and research.',
        featuredImage: '/images/blog/claude-fable-51/featured.png',
        publishedAt: '2026-09-03T08:00:00.000Z',
        categories: ['AI Chatbots', 'AI Tools'],
        tags: ['Claude Fable 5.1', 'Claude Mythos 5.1', 'Anthropic', 'AI Benchmarks', 'Frontier AI Models', 'Agentic AI', 'Claude Code', 'AI Safety'],
        author: 'Rana Aqib',
    },
    {
        slug: 'top-5-frontier-ai-models-2026',
        title: 'Top 5 Best Frontier AI Models in 2026: GPT-5.5, Claude, Gemini & More',
        description:
            'Discover the top 5 best frontier AI models in 2026: GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro, Grok 4, and DeepSeek V4-Pro, compared across real-world benchmarks and use cases.',
        featuredImage: '/images/blog/top-5-frontier-ai-models-2026.svg',
        publishedAt: '2026-05-21T00:00:00.000Z',
        categories: ['AI Tools', 'AI Benchmarks', 'LLM Comparison'],
        tags: ['Frontier AI Models', 'GPT-5.5', 'Claude Opus 4.7', 'Gemini 3.1 Pro', 'Grok 4', 'DeepSeek V4', 'AI Benchmark', 'Large Language Models', 'AI Comparison'],
        author: 'Rana Aqib',
    },
    {
        slug: 'sakana-fugu-review-japan-multi-agent-ai-2026',
        title: "Sakana Fugu Review: Japan's Multi-Agent AI Beats GPT-5.5",
        description:
            "Sakana Fugu is Japan's multi-agent AI that outperforms GPT-5.5 on coding & reasoning. One OpenAI-compatible API, plans from $20/mo. Full 2026 review + benchmarks.",
        featuredImage: '/images/blog/sakana-fugu-review-2026.png',
        publishedAt: '2026-06-22T09:00:00.000Z',
        categories: ['Reviews', 'AI Tools'],
        tags: ['AI Tools', 'Multi-Agent AI', 'AI Coding Tools', 'Japan AI', '2026'],
        author: 'Ali Malik',
    },
    {
        slug: 'gpt-5-6-sol-preview',
        title: 'GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude',
        description:
            'OpenAI previewed GPT-5.6 Sol, Terra, and Luna on June 26, 2026 \u2014 a restricted, government-coordinated preview with new agentic coding and cybersecurity capabilities. Full breakdown of benchmarks, pricing, safeguards, and access.',
        featuredImage: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/01/2m742ou2_gpt-56-preview.png',
        publishedAt: '2026-07-01T09:00:00.000Z',
        categories: ['AI Tools', 'AI Chatbots'],
        tags: ['GPT-5.6', 'OpenAI', 'Sol', 'Terra', 'Luna', 'AI Benchmarks', 'Terminal-Bench', 'Cybersecurity', 'Agentic Coding', 'AI Model Preview'],
        author: 'Rana Aqib',
    },
];

/** Merge dedicated blog entries with Prisma posts, deduplicating by slug (Prisma wins if both exist). */
export function mergeDedicatedBlogPosts(
    prismaPosts: Array<{
        id: string;
        title: string;
        slug: string;
        excerpt?: string | null;
        content?: string;
        featuredImage?: string | null;
        categories?: string[] | null;
        tags?: string[] | null;
        author: string;
        publishedAt?: string | null;
    }>
) {
    const prismaSlugs = new Set(prismaPosts.map((p) => p.slug));
    const dedicatedEntries = DEDICATED_BLOG_ENTRIES.filter((e) => !prismaSlugs.has(e.slug));

    const syntheticPosts = dedicatedEntries.map((entry) => ({
        id: `dedicated-${entry.slug}`,
        title: entry.title,
        slug: entry.slug,
        excerpt: entry.description,
        featuredImage: entry.featuredImage,
        categories: entry.categories,
        tags: entry.tags,
        author: entry.author,
        publishedAt: entry.publishedAt,
    }));

    return [...prismaPosts, ...syntheticPosts].sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
    });
}