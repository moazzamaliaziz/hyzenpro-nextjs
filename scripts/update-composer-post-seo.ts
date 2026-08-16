import prisma from '@/lib/prisma';

async function updateComposerPost() {
  try {
    // Delete existing post if it exists
    await prisma.post.deleteMany({
      where: { slug: 'cursor-composer-2-5-review' },
    });
    console.log('✓ Deleted existing post');

    // Create the post with SEO data
    const post = await prisma.post.create({
      data: {
        title: 'Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task',
        slug: 'cursor-composer-2-5-review',
        excerpt: 'Cursor Composer 2.5 hits 63.2% on AI coding benchmarks — near Opus-4.7 max — at just $0.55 avg cost per task. Full review: benchmarks, training method, pricing, and the Theo controversy.',
        content: '<p>Cursor Composer 2.5 review blog post</p>',
        featuredImage: '/images/blog/cursor-composer-2-5.png',
        categories: ['AI Coding Tools', 'AI Tools'],
        tags: [
          'Cursor AI',
          'Composer 2.5',
          'AI Coding Tools',
          'LLM Benchmarks',
          'Kimi K2.5',
          'SpaceX AI',
          'Agentic Coding',
        ],
        author: 'HyzenPro Editorial',
        status: 'published',
        postType: 'review',
        readingTime: 12,
        publishedAt: new Date('2026-05-20T12:00:00Z'),
        views: 0,
        seo: {
          metaTitle: 'Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task',
          metaDescription: 'Cursor Composer 2.5 hits 63.2% on AI coding benchmarks — near Opus-4.7 max — at just $0.55 avg cost per task. Full review: benchmarks, training method, pricing, and the Theo controversy.',
          canonicalUrl: 'https://hyzenpro.com/blog/cursor-composer-2-5-review/',
          ogImage: 'https://hyzenpro.com/images/blog/cursor-composer-2-5.png',
          ogTitle: 'Cursor Composer 2.5 Review: Frontier Scores at $0.55 Per Task',
          ogDescription: 'Composer 2.5 ranks #3 in our AI coding leaderboard — just behind Opus-4.7 max — at 20x less cost. Here\'s the full breakdown.',
          twitterCard: 'summary_large_image',
          focusKeyword: 'Cursor Composer 2.5 review',
          noIndex: false,
        },
      },
    });

    console.log('✓ Blog post updated with SEO data');
    console.log(`  Title: ${post.title}`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  SEO Meta Title: ${post.seo?.metaTitle}`);
    console.log(`  SEO Focus Keyword: ${post.seo?.focusKeyword}`);
  } catch (error) {
    console.error('✗ Error updating blog post:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateComposerPost();
