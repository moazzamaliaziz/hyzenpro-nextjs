import prisma from '@/lib/prisma';

/**
 * Staggers publish dates for legacy blog posts that all share the same date.
 * Run with: npx tsx scripts/stagger-post-dates.ts
 */

const DATE_MAP: Record<string, string> = {
    'submagic-review': '2025-11-04T09:00:00.000Z',
    'veed-io-review': '2025-11-11T09:00:00.000Z',
    'captions-ai-review': '2025-11-18T09:00:00.000Z',
    'zubtitle-review': '2025-11-25T09:00:00.000Z',
    'kapwing-review': '2025-12-02T09:00:00.000Z',
    'animaker-review': '2025-12-09T09:00:00.000Z',
    'autocut-review': '2025-12-16T09:00:00.000Z',
    'descript-review': '2025-12-23T09:00:00.000Z',
    'clipchamp-review': '2026-01-06T09:00:00.000Z',
    'headliner-review': '2026-01-13T09:00:00.000Z',
    '10-best-ai-caption-generator-tools': '2025-10-28T09:00:00.000Z',
    'ai-agents-and-workflow-automation': '2026-01-20T09:00:00.000Z',
    'replit-ai-agent-review': '2026-01-27T09:00:00.000Z',
    'best-ai-coding-assistants-in-2025': '2026-02-03T09:00:00.000Z',
    'how-to-build-and-monetize-web-apps-with-ai': '2026-02-10T09:00:00.000Z',
    'submagic-vs-veed': '2026-02-17T09:00:00.000Z',
    'why-ai-productivity-tools-are-making-your-work-harder': '2026-02-24T09:00:00.000Z',
    'what-is-elevenlabs': '2026-01-06T09:00:00.000Z',
    'liquid-ai-review': '2026-01-14T09:00:00.000Z',
    '10-best-ai-writing-tools-2026': '2026-02-03T09:00:00.000Z',
    'claude-4-5-vs-gpt-5-2-thinking': '2026-02-10T09:00:00.000Z',
    'elevenlabs-vs-lovo': '2026-02-17T09:00:00.000Z',
    'submagic-vs-veed-io-vs-captions-ai': '2026-02-24T09:00:00.000Z',
    'jasper-ai-vs-writesonic-vs-copy-ai': '2026-03-03T09:00:00.000Z',
    'cursor-ai-vs-github-copilot-vs-claude-code': '2026-03-10T09:00:00.000Z',
    'jasper-review-2026': '2026-03-17T09:00:00.000Z',
    'descript-review-2026': '2026-03-24T09:00:00.000Z',
    'copy-ai-vs-jasper-comparison': '2026-03-28T09:00:00.000Z',
    'midjourney-vs-dall-e-3-vs-stable-diffusion': '2026-04-01T09:00:00.000Z',
    'leonardo-ai-vs-midjourney': '2026-04-07T09:00:00.000Z',
    '10-best-ai-image-generators-2026': '2026-04-14T09:00:00.000Z',
};

async function staggerPostDates() {
    console.log('Staggering blog post publish dates...\n');

    let updated = 0;
    let skipped = 0;

    for (const [slug, date] of Object.entries(DATE_MAP)) {
        const publishDate = new Date(date);

        try {
            const result = await prisma.post.updateMany({
                where: { slug },
                data: {
                    publishedAt: publishDate,
                    updatedAt: publishDate,
                },
            });

            if (result.count > 0) {
                console.log(`  ✓ ${slug} → ${publishDate.toISOString().split('T')[0]}`);
                updated++;
            } else {
                console.log(`  ⏭ ${slug} — not found, skipping`);
                skipped++;
            }
        } catch (error) {
            console.error(`  ✗ ${slug} — error:`, error);
        }
    }

    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

staggerPostDates()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
