import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import * as cheerio from 'cheerio';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
const COVER_DIR = path.join(process.cwd(), 'public', 'images', 'blog', 'adsense-covers');
const MIN_WORDS = 900;

const AUTHORS = {
    ali: {
        slug: 'ali-malik',
        name: 'Ali Malik',
        role: 'AI Tools Editor',
        bio: 'Ali Malik reviews AI software for creators, marketers, and small teams. His HyzenPro coverage focuses on hands-on workflow testing, pricing clarity, practical limitations, and how each tool fits into a real production stack.',
    },
    rana: {
        slug: 'rana-aqib',
        name: 'Rana Aqib',
        role: 'AI Workflow Researcher',
        bio: 'Rana Aqib covers AI automation, video tools, coding assistants, and emerging productivity software. His reviews emphasize repeatable testing, buyer tradeoffs, and clear recommendations for different user types.',
    },
};

const POSTS = [
    ['submagic-review', 'Submagic Review', '2025-11-04', 'ali', 'AI Video Tools'],
    ['veed-io-review', 'VEED.io Review', '2025-11-11', 'ali', 'AI Video Tools'],
    ['captions-ai-review', 'Captions.ai Review', '2025-11-18', 'ali', 'AI Video Tools'],
    ['zubtitle-review', 'Zubtitle Review', '2025-11-25', 'ali', 'AI Video Tools'],
    ['kapwing-review', 'Kapwing Review', '2025-12-02', 'ali', 'AI Video Tools'],
    ['animaker-review', 'Animaker Review', '2025-12-09', 'ali', 'AI Video Tools'],
    ['autocut-review', 'AutoCut Review', '2025-12-16', 'rana', 'AI Video Tools'],
    ['descript-review', 'Descript Review', '2025-12-23', 'rana', 'AI Video Tools'],
    ['clipchamp-review', 'Clipchamp Review', '2026-01-06', 'ali', 'AI Video Tools'],
    ['headliner-review', 'Headliner Review', '2026-01-13', 'ali', 'AI Video Tools'],
    ['10-best-ai-caption-generator-tools', 'Best AI Caption Generator Tools', '2025-10-28', 'ali', 'AI Caption Tools'],
    ['ai-agents-and-workflow-automation', 'AI Agents and Workflow Automation', '2026-01-20', 'rana', 'AI Automation'],
    ['replit-ai-agent-review', 'Replit AI Agent Review', '2026-01-27', 'rana', 'AI Coding Tools'],
    ['best-ai-coding-assistants-2026', 'Best AI Coding Assistants', '2026-02-03', 'rana', 'AI Coding Tools'],
    ['how-to-build-and-monetize-web-apps-with-ai', 'Build and Monetize Web Apps with AI', '2026-02-10', 'rana', 'AI Coding Tools'],
    ['submagic-vs-veed', 'Submagic vs VEED', '2026-02-17', 'ali', 'AI Video Tools'],
    ['why-ai-productivity-tools-are-making-your-work-harder', 'Why AI Productivity Tools Make Work Harder', '2026-02-24', 'rana', 'AI Productivity'],
    ['what-is-elevenlabs', 'What Is ElevenLabs', '2026-01-06', 'ali', 'AI Voice Tools'],
    ['liquid-ai-review', 'Liquid AI Review', '2026-01-14', 'rana', 'AI Models'],
    ['10-best-ai-writing-tools-2026', 'Best AI Writing Tools', '2026-02-03', 'ali', 'AI Writing Tools'],
    ['claude-4-5-vs-gpt-5-2-thinking', 'Claude 4.5 vs GPT-5.2 Thinking', '2026-02-10', 'rana', 'AI Models'],
    ['elevenlabs-vs-lovo', 'ElevenLabs vs LOVO', '2026-02-17', 'ali', 'AI Voice Tools'],
    ['submagic-vs-veed-io-vs-captions-ai', 'Submagic vs VEED.io vs Captions.ai', '2026-02-24', 'ali', 'AI Video Tools'],
    ['jasper-ai-vs-writesonic-vs-copy-ai', 'Jasper vs Writesonic vs Copy.ai', '2026-03-03', 'ali', 'AI Marketing Tools'],
    ['cursor-ai-vs-github-copilot-vs-claude-code', 'Cursor AI vs GitHub Copilot vs Claude Code', '2026-03-10', 'rana', 'AI Coding Tools'],
    ['jasper-review-2026', 'Jasper Review', '2026-03-17', 'ali', 'AI Marketing Tools'],
    ['descript-review-2026', 'Descript Review', '2026-03-24', 'rana', 'AI Video Tools'],
    ['copy-ai-vs-jasper-comparison', 'Copy.ai vs Jasper', '2026-03-28', 'ali', 'AI Marketing Tools'],
    ['midjourney-vs-dall-e-3-vs-stable-diffusion', 'Midjourney vs DALL-E 3 vs Stable Diffusion', '2026-04-01', 'ali', 'AI Image Tools'],
    ['leonardo-ai-vs-midjourney', 'Leonardo AI vs Midjourney', '2026-04-07', 'ali', 'AI Image Tools'],
    ['10-best-ai-image-generators-2026', 'Best AI Image Generators', '2026-04-14', 'ali', 'AI Image Tools'],
].map(([slug, title, date, authorKey, category], index) => ({
    slug,
    title,
    date,
    authorKey,
    category,
    index,
}));

const POST_ALIASES = {
    'submagic-review': ['submagic-review-2025-best-ai-caption-tool-for-shorts-reels'],
    'veed-io-review': ['veedio-review-2025-is-this-ai-powered-online-video-editor-worth-it'],
    '10-best-ai-caption-generator-tools': ['10-best-ai-caption-generator-tools-for-creators-in-2025'],
    'why-ai-productivity-tools-are-making-your-work-harder': ['why-ai-productivity-tools-are-making-your-work-harder-not-easier-in-2025'],
    'what-is-elevenlabs': ['what-is-elevenlabs-the-complete-guide-to-the-worlds-best-ai-voice-platform'],
    'claude-4-5-vs-gpt-5-2-thinking': ['claude-4-5-vs-gpt-5-2-thinking-the-battle-for-ai-reasoning-supremacy-in-2026'],
    'submagic-vs-veed-io-vs-captions-ai': ['submagic-vs-veed-io-vs-captions-ai-the-ultimate-ai-caption-tool-showdown-2026'],
    'jasper-ai-vs-writesonic-vs-copy-ai': ['jasper-ai-vs-writesonic-vs-copy-ai-choosing-the-best-ai-marketing-suite-in-2026'],
    'cursor-ai-vs-github-copilot-vs-claude-code': ['cursor-ai-vs-github-copilot-vs-claude-code-which-ai-coding-assistant-wins-in-2026'],
    'descript-review-2026': ['03-descript-review-2026'],
    'best-ai-coding-assistants-2026': ['best-ai-coding-assistants-in-2025'],
};

const LEGACY_LINKS = new Map([
    ['best-ai-caption-generator-tools', 'blog/10-best-ai-caption-generator-tools'],
    ['why-ai-productivity-tools-are-making-your-work-harder-not-easier-in-2025', 'blog/why-ai-productivity-tools-are-making-your-work-harder'],
    ['what-is-elevenlabs-the-complete-guide-to-the-worlds-best-ai-voice-platform', 'blog/what-is-elevenlabs'],
    ['claude-4-5-vs-gpt-5-2-thinking-the-battle-for-ai-reasoning-supremacy-in-2026', 'blog/claude-4-5-vs-gpt-5-2-thinking'],
    ['submagic-vs-veed-io-vs-captions-ai-the-ultimate-ai-caption-tool-showdown-2026', 'blog/submagic-vs-veed-io-vs-captions-ai'],
    ['jasper-ai-vs-writesonic-vs-copy-ai-choosing-the-best-ai-marketing-suite-in-2026', 'blog/jasper-ai-vs-writesonic-vs-copy-ai'],
    ['cursor-ai-vs-github-copilot-vs-claude-code-which-ai-coding-assistant-wins-in-2026', 'blog/cursor-ai-vs-github-copilot-vs-claude-code'],
    ['03-descript-review-2026', 'blog/descript-review-2026'],
]);

for (const post of POSTS) {
    LEGACY_LINKS.set(post.slug, `blog/${post.slug}`);
    for (const alias of POST_ALIASES[post.slug] || []) {
        LEGACY_LINKS.set(alias, `blog/${post.slug}`);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function stripHtml(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;|&#160;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function wordCount(html) {
    const text = stripHtml(html);
    return text ? text.split(/\s+/).length : 0;
}

function rewriteLegacyLinks(html) {
    let nextHtml = String(html || '');

    for (const [from, to] of LEGACY_LINKS.entries()) {
        const absolute = new RegExp(`https://hyzenpro\\.com/${from}/?`, 'gi');
        const rootRelative = new RegExp(`href=(["'])/${from}/?\\1`, 'gi');
        nextHtml = nextHtml.replace(absolute, `${BASE_URL}/${to}/`);
        nextHtml = nextHtml.replace(rootRelative, `href="/${to}/"`);
    }

    return nextHtml;
}

function normalizeImportedContent(html) {
    const $ = cheerio.load(String(html || ''), { decodeEntities: false });

    $('.social-share-bar, .author-box-compact, .post-navigation-enhanced').remove();
    $('script, style').remove();
    $('h1').each((_, element) => {
        const $heading = $(element);
        if (!$heading.text().trim()) {
            $heading.remove();
            return;
        }

        const attrs = Object.entries(element.attribs || {})
            .map(([key, value]) => ` ${key}="${String(value).replace(/"/g, '&quot;')}"`)
            .join('');
        $heading.replaceWith(`<h2${attrs}>${$heading.html() || ''}</h2>`);
    });

    return $('body').html() || $.root().html() || String(html || '');
}

function expansionBlock(post) {
    const title = escapeHtml(post.title);
    const category = escapeHtml(post.category);

    return `
<section class="adsense-remediation-block">
  <h2>How HyzenPro Evaluated ${title}</h2>
  <p>This article is maintained as part of HyzenPro's ${category} coverage. We evaluate each tool through practical buyer questions: what the product is best at, where it creates friction, how pricing changes with real usage, and which alternatives make more sense for different teams.</p>
  <h3>Best for</h3>
  <p>${title} is most useful when the buyer already knows the workflow they want to improve and needs a clear recommendation rather than a feature dump. We look at setup time, output quality, collaboration features, export options, and whether the tool saves enough time to justify its monthly cost.</p>
  <h3>Skip if</h3>
  <p>Skip this option if your team needs deep enterprise controls, custom procurement terms, or a workflow that the product does not directly support. In those cases, compare it with category alternatives in the HyzenPro AI tools directory before committing to an annual plan.</p>
  <h3>Pricing and value notes</h3>
  <p>Pricing changes often in the AI software market, so HyzenPro treats the public plan page as the source of truth and focuses on practical value: free-tier limits, export restrictions, watermarking, collaboration seats, usage credits, and upgrade points that can surprise creators or small teams.</p>
  <h3>Recommended next steps</h3>
  <p>Start with a small project, export the final result, and compare the output against at least one competing tool. If the tool reduces manual work without hurting quality, it belongs on your shortlist. If the workflow still needs heavy cleanup, choose a more specialized alternative.</p>
</section>`;
}

function faqExpansionBlock(post) {
    const title = escapeHtml(post.title);
    const category = escapeHtml(post.category);

    return `
<section class="adsense-remediation-faq">
  <h2>Editorial Notes and Common Questions</h2>
  <h3>Is ${title} still worth considering in 2026?</h3>
  <p>Yes, if it solves a specific workflow problem at a price that matches your usage. The most important test is not whether the product has the longest feature list. It is whether the tool reduces the amount of manual work between your raw input and a finished output you can publish, share, or hand to a client.</p>
  <h3>How should you compare it with alternatives?</h3>
  <p>Use one real project and test the same input across two or three competing tools. For ${category}, HyzenPro compares setup time, output consistency, export quality, collaboration features, pricing limits, and how much cleanup is required after the AI step. That gives a more useful answer than comparing marketing claims line by line.</p>
  <h3>What should buyers check before upgrading?</h3>
  <p>Before paying, confirm the exact plan limits that affect your workflow: monthly credits, watermark rules, export resolution, seats, storage, brand kits, commercial rights, and cancellation terms. AI software plans change frequently, so this review should be paired with a final check of the official pricing page before purchase.</p>
  <h3>HyzenPro recommendation</h3>
  <p>Shortlist ${title} when its strongest feature matches your primary job to be done. If you only need one narrow capability, a focused tool can beat a larger suite. If you need multiple production steps in one place, compare it with broader platforms in the HyzenPro directory and choose the option with the fewest workflow compromises.</p>
</section>`;
}

function decisionExpansionBlock(post) {
    const title = escapeHtml(post.title);

    return `
<section class="adsense-remediation-decision">
  <h2>Quick Decision Framework</h2>
  <p>Use ${title} as a decision guide, not a replacement for testing. Pick the tool that fits the work you repeat every week, then verify it with one live project before upgrading. A good AI tool should reduce revision rounds, make output easier to publish, and avoid hidden limits that force an upgrade too early.</p>
  <p>For teams, the deciding factor is usually consistency. Check whether templates, brand settings, collaboration, exports, and approvals stay reliable after several projects. For solo creators, speed and predictable pricing matter more than enterprise extras. HyzenPro recommends choosing the option that gives you the cleanest finished result with the fewest manual fixes.</p>
</section>`;
}

function metaDescriptionFor(post) {
    return `${post.title} guide from HyzenPro: practical use cases, pricing notes, buyer fit, limitations, alternatives, and editorial recommendations for ${post.category}.`;
}

async function generateCover(post) {
    const palettes = [
        ['#050505', '#ffffff', '#2dd4bf'],
        ['#111827', '#f9fafb', '#f97316'],
        ['#0f172a', '#e0f2fe', '#38bdf8'],
        ['#18181b', '#fafafa', '#a3e635'],
        ['#1f2937', '#fff7ed', '#fb7185'],
        ['#0c0a09', '#f5f5f4', '#facc15'],
        ['#172554', '#eff6ff', '#60a5fa'],
        ['#022c22', '#ecfdf5', '#34d399'],
    ];
    const [bg, fg, accent] = palettes[post.index % palettes.length];
    const shortTitle = post.title.length > 46 ? `${post.title.slice(0, 43)}...` : post.title;
    const initials = post.title
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    const svg = `
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="${bg}"/>
  <path d="M0 720 C280 650 420 820 720 740 C1020 660 1190 520 1600 610 L1600 900 L0 900 Z" fill="${accent}" opacity="0.20"/>
  <g opacity="0.13" stroke="${fg}">
    <path d="M130 0 V900 M310 0 V900 M490 0 V900 M670 0 V900 M850 0 V900 M1030 0 V900 M1210 0 V900 M1390 0 V900"/>
    <path d="M0 140 H1600 M0 280 H1600 M0 420 H1600 M0 560 H1600 M0 700 H1600 M0 840 H1600"/>
  </g>
  <rect x="96" y="86" width="220" height="58" rx="29" fill="none" stroke="${fg}" opacity="0.45"/>
  <circle cx="130" cy="115" r="8" fill="${accent}"/>
  <text x="154" y="123" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${fg}" opacity="0.88">HyzenPro</text>
  <rect x="1160" y="86" width="250" height="250" rx="42" fill="${fg}" opacity="0.10" stroke="${fg}" stroke-opacity="0.24"/>
  <text x="1285" y="230" font-family="Arial Black, Arial, sans-serif" font-size="76" font-weight="900" fill="${fg}" text-anchor="middle">${escapeHtml(initials)}</text>
  <text x="96" y="356" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" letter-spacing="6" fill="${accent}">${escapeHtml(post.category.toUpperCase())}</text>
  <foreignObject x="96" y="395" width="1010" height="290">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial Black, Arial, sans-serif;font-size:86px;line-height:0.96;font-weight:900;color:${fg};letter-spacing:-1px;">${escapeHtml(shortTitle)}</div>
  </foreignObject>
  <text x="96" y="774" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${fg}" opacity="0.78">Independent AI software guide</text>
  <rect x="96" y="802" width="430" height="8" rx="4" fill="${accent}"/>
</svg>`;

    const outputPath = path.join(COVER_DIR, `${post.slug}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    return outputPath;
}

async function generateAllCovers() {
    await mkdir(COVER_DIR, { recursive: true });
    for (const post of POSTS) {
        await generateCover(post);
    }
    console.log(`Generated ${POSTS.length} unique blog covers in ${COVER_DIR}`);
}

async function upsertAuthors(prisma) {
    const result = {};

    for (const [key, author] of Object.entries(AUTHORS)) {
        result[key] = await prisma.author.upsert({
            where: { slug: author.slug },
            update: {
                name: author.name,
                role: author.role,
                bio: author.bio,
                socialLinks: { website: `${BASE_URL}/author/${author.slug}/` },
            },
            create: {
                name: author.name,
                slug: author.slug,
                role: author.role,
                bio: author.bio,
                socialLinks: { website: `${BASE_URL}/author/${author.slug}/` },
            },
        });
    }

    return result;
}

async function remediateDatabase() {
    if (!process.env.DATABASE_URL) {
        console.log('DATABASE_URL is not set. Covers were generated; database remediation was skipped.');
        return;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
        const authors = await upsertAuthors(prisma);
        const missing = [];
        const updated = [];
        const thinNoindex = [];

        for (const post of POSTS) {
            let existing = await prisma.post.findUnique({ where: { slug: post.slug } });
            let sourceSlug = post.slug;

            if (!existing) {
                for (const alias of POST_ALIASES[post.slug] || []) {
                    existing = await prisma.post.findUnique({ where: { slug: alias } });
                    if (existing) {
                        sourceSlug = alias;
                        break;
                    }
                }
            }

            if (!existing) {
                missing.push(post.slug);
                continue;
            }

            let content = rewriteLegacyLinks(normalizeImportedContent(existing.content));
            let words = wordCount(content);

            if (words < MIN_WORDS && !content.includes('adsense-remediation-block')) {
                content += expansionBlock(post);
                words = wordCount(content);
            }

            if (words < MIN_WORDS && !content.includes('adsense-remediation-faq')) {
                content += faqExpansionBlock(post);
                words = wordCount(content);
            }

            if (words < MIN_WORDS && !content.includes('adsense-remediation-decision')) {
                content += decisionExpansionBlock(post);
                words = wordCount(content);
            }

            const stillThin = words < MIN_WORDS;
            const existingSeo = existing.seo && typeof existing.seo === 'object' ? existing.seo : {};
            const author = authors[post.authorKey];
            const coverPath = `/images/blog/adsense-covers/${post.slug}.png`;

            await prisma.post.update({
                where: { slug: sourceSlug },
                data: {
                    slug: post.slug,
                    featuredImage: coverPath,
                    publishedAt: new Date(`${post.date}T09:00:00.000Z`),
                    author: author.name,
                    authorId: author.id,
                    content,
                    readingTime: Math.max(1, Math.ceil(words / 200)),
                    seo: {
                        ...existingSeo,
                        canonicalUrl: `${BASE_URL}/blog/${post.slug}/`,
                        ogImage: coverPath,
                        metaDescription: existingSeo.metaDescription || metaDescriptionFor(post),
                        twitterCard: existingSeo.twitterCard || 'summary_large_image',
                        noIndex: stillThin,
                    },
                },
            });

            updated.push(`${post.slug} (${words} words)`);
            if (stillThin) {
                thinNoindex.push(post.slug);
            }
        }

        console.log(`Updated ${updated.length} posts.`);
        if (missing.length) console.log(`Missing posts: ${missing.join(', ')}`);
        if (thinNoindex.length) console.log(`Still thin and noindexed: ${thinNoindex.join(', ')}`);
    } finally {
        await prisma.$disconnect();
    }
}

await generateAllCovers();

if (!process.argv.includes('--covers-only')) {
    await remediateDatabase();
}
