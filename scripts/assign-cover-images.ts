import prisma from '@/lib/prisma';

/**
 * Assigns unique cover images from public/images/blog/adsense-covers/ to legacy posts.
 * Run with: npx tsx scripts/assign-cover-images.ts
 */

const COVER_MAP: Record<string, string> = {
    'submagic-review': '/images/blog/adsense-covers/submagic-review.png',
    'veed-io-review': '/images/blog/adsense-covers/veed-io-review.png',
    'captions-ai-review': '/images/blog/adsense-covers/captions-ai-review.png',
    'zubtitle-review': '/images/blog/adsense-covers/zubtitle-review.png',
    'kapwing-review': '/images/blog/adsense-covers/kapwing-review.png',
    'animaker-review': '/images/blog/adsense-covers/animaker-review.png',
    'autocut-review': '/images/blog/adsense-covers/autocut-review.png',
    'descript-review': '/images/blog/adsense-covers/descript-review.png',
    'clipchamp-review': '/images/blog/adsense-covers/clipchamp-review.png',
    'headliner-review': '/images/blog/adsense-covers/headliner-review.png',
    '10-best-ai-caption-generator-tools': '/images/blog/adsense-covers/10-best-ai-caption-generator-tools.png',
    'ai-agents-and-workflow-automation': '/images/blog/adsense-covers/ai-agents-and-workflow-automation.png',
    'replit-ai-agent-review': '/images/blog/adsense-covers/replit-ai-agent-review.png',
    'best-ai-coding-assistants-in-2025': '/images/blog/adsense-covers/best-ai-coding-assistants-in-2025.png',
    'how-to-build-and-monetize-web-apps-with-ai': '/images/blog/adsense-covers/how-to-build-and-monetize-web-apps-with-ai.png',
    'submagic-vs-veed': '/images/blog/adsense-covers/submagic-vs-veed.png',
    'why-ai-productivity-tools-are-making-your-work-harder': '/images/blog/adsense-covers/why-ai-productivity-tools-are-making-your-work-harder.png',
    'what-is-elevenlabs': '/images/blog/adsense-covers/what-is-elevenlabs.png',
    'liquid-ai-review': '/images/blog/adsense-covers/liquid-ai-review.png',
    '10-best-ai-writing-tools-2026': '/images/blog/adsense-covers/10-best-ai-writing-tools-2026.png',
    'claude-4-5-vs-gpt-5-2-thinking': '/images/blog/adsense-covers/claude-4-5-vs-gpt-5-2-thinking.png',
    'elevenlabs-vs-lovo': '/images/blog/adsense-covers/elevenlabs-vs-lovo.png',
    'submagic-vs-veed-io-vs-captions-ai': '/images/blog/adsense-covers/submagic-vs-veed-io-vs-captions-ai.png',
    'jasper-ai-vs-writesonic-vs-copy-ai': '/images/blog/adsense-covers/jasper-ai-vs-writesonic-vs-copy-ai.png',
    'cursor-ai-vs-github-copilot-vs-claude-code': '/images/blog/adsense-covers/cursor-ai-vs-github-copilot-vs-claude-code.png',
    'jasper-review-2026': '/images/blog/adsense-covers/jasper-review-2026.png',
    'descript-review-2026': '/images/blog/adsense-covers/descript-review-2026.png',
    'copy-ai-vs-jasper-comparison': '/images/blog/adsense-covers/copy-ai-vs-jasper-comparison.png',
    'midjourney-vs-dall-e-3-vs-stable-diffusion': '/images/blog/adsense-covers/midjourney-vs-dall-e-3-vs-stable-diffusion.png',
    'leonardo-ai-vs-midjourney': '/images/blog/adsense-covers/leonardo-ai-vs-midjourney.png',
    '10-best-ai-image-generators-2026': '/images/blog/adsense-covers/10-best-ai-image-generators-2026.png',
};

async function assignCoverImages() {
    console.log('Assigning unique cover images to legacy blog posts...\n');

    let updated = 0;
    let skipped = 0;

    for (const [slug, imagePath] of Object.entries(COVER_MAP)) {
        try {
            const result = await prisma.post.updateMany({
                where: { slug },
                data: { featuredImage: imagePath },
            });

            if (result.count > 0) {
                console.log(`  ✓ ${slug} → ${imagePath}`);
                updated++;
            } else {
                console.log(`  ⏭ ${slug} — not found, skipping`);
                skipped++;
            }
        } catch (error) {
            console.error(`  œ— ${slug} — error:`, error);
        }
    }

    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

assignCoverImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
