import prisma from '@/lib/prisma';

const SLUG = 'top-5-frontier-ai-models-2026';
const LEGACY_SLUG = 'top-5-best-frontier-ai-models-in-2026-gpt-55-claude-gemini-more';
const FEATURED_IMAGE = '/images/blog/top-5-frontier-ai-models-2026.svg';

async function addFrontierModelsPost() {
  try {
    // Delete old duplicate records before creating the canonical post.
    await prisma.post.deleteMany({
      where: { slug: { in: [SLUG, LEGACY_SLUG] } },
    });

    // Create the post
    const post = await prisma.post.create({
      data: {
        title: 'Top 5 Best Frontier AI Models in 2026: GPT-5.5, Claude, Gemini & More',
        slug: SLUG,
        excerpt: 'Discover the top 5 best frontier AI models in 2026 — GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro, Grok 4 & DeepSeek V4. See which one wins for your use case.',
        content: '<p>Top 5 frontier AI models blog post with benchmark comparisons</p>',
        featuredImage: FEATURED_IMAGE,
        categories: ['AI Tools', 'AI Benchmarks', 'LLM Comparison'],
        tags: [
          'Frontier AI Models',
          'GPT-5.5',
          'Claude Opus 4.7',
          'Gemini 3.1 Pro',
          'Grok 4',
          'DeepSeek V4',
          'AI Benchmark',
          'Large Language Models',
          'AI Comparison',
        ],
        author: 'HyzenPro Editorial',
        status: 'published',
        postType: 'comparison',
        readingTime: 14,
        publishedAt: new Date('2026-05-21T00:00:00Z'),
        views: 0,
        seo: {
          metaTitle: 'Top 5 Best Frontier AI Models in 2026: GPT-5.5, Claude, Gemini & More',
          metaDescription: 'Discover the top 5 best frontier AI models in 2026 — GPT-5.5, Claude Opus 4.7, Gemini 3.1 Pro, Grok 4 & DeepSeek V4. See which one wins for your use case.',
          canonicalUrl: `https://hyzenpro.com/blog/${SLUG}/`,
          ogImage: `https://hyzenpro.com${FEATURED_IMAGE}`,
          ogTitle: 'Top 5 Frontier AI Models in 2026',
          ogDescription: 'Compare GPT-5.5, Claude, Gemini, Grok, and DeepSeek with verified benchmarks.',
          twitterCard: 'summary_large_image',
          focusKeyword: 'frontier AI models 2026',
          noIndex: false,
        },
      },
    });

    console.log('✓ Blog post created successfully');
    console.log(`  Title: ${post.title}`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Published: ${post.publishedAt}`);
  } catch (error) {
    console.error('œ— Error adding blog post:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addFrontierModelsPost();
