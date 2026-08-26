import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AuthorBox from '@/components/eeat/AuthorBox';
import TableOfContents from '@/components/blog/TableOfContents';
import InternalLinkingPanel from '@/components/blog/InternalLinkingPanel';
import PostCard from '@/components/blog/PostCard';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl, formatDate, calculateReadingTime } from '@/lib/utils';
import { getEditorialAuthor } from '@/lib/editorial-authors';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import SocialShare from '@/components/blog/SocialShare';
import MatcherDiscoveryCard from '@/components/quiz/MatcherDiscoveryCard';
import { getMatcherDiscoveryContext } from '@/lib/matcher-discovery';
import { getInternalLinkRecommendations } from '@/lib/blog-seo';
import * as cheerio from 'cheerio';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';
import Composer25Chart from './Composer25Chart';

const SLUG = 'cursor-composer-2-5-review';
const FEATURED_IMAGE = '/images/blog/cursor-composer-2-5.png';
const CURRENT_URL = `${getBaseUrl()}/blog/${SLUG}/`;

export const metadata: Metadata = {
    title: 'Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task',
    description:
        'Cursor Composer 2.5 hits 63.2% on AI coding benchmarks — near Opus-4.7 max — at just $0.55 avg cost per task. Full review: benchmarks, training method, pricing, and the Theo controversy.',
    keywords: [
        'Cursor Composer 2.5',
        'Composer 2.5 review',
        'best AI coding model 2026',
        'Cursor AI coding tool',
        'Composer 2.5 vs Opus 4.7',
        'Composer 2.5 vs GPT-5.5',
        'Kimi K2.5 Cursor',
        'AI coding benchmark 2026',
        'Cursor SpaceX AI',
        'cheap AI coding model',
    ],
    alternates: {
        canonical: CURRENT_URL,
    },
    openGraph: {
        type: 'article',
        title: 'Cursor Composer 2.5 Review: Frontier Scores at $0.55 Per Task',
        description:
            'Composer 2.5 ranks #3 in our AI coding leaderboard — just behind Opus-4.7 max — at 20x less cost. Here\'s the full breakdown.',
        url: CURRENT_URL,
        publishedTime: '2026-05-20T12:00:00.000Z',
        authors: ['Ali Malik'],
        images: [
            {
                url: `${getBaseUrl()}${FEATURED_IMAGE}`,
                width: 1200,
                height: 630,
                alt: 'Cursor Composer 2.5 — AI Coding Benchmark Review',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cursor Composer 2.5: Frontier-Level Coding at $0.55 Per Task',
        description:
            'Ranked #3 on our leaderboard. Nearly as good as Opus-4.7 max. 20x cheaper. Here\'s everything you need to know.',
    },
};

// ── Structured Data ──────────────────────────────────────────────────────────
const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'ReviewNewsArticle',
    headline: 'Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task',
    description:
        'Composer 2.5 ranks #3 in AI coding benchmarks with a 63.2% score at just $0.55 average cost per task — near Opus-4.7 max territory.',
    datePublished: '2026-05-20T12:00:00+00:00',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: 'Ali Malik', url: 'https://hyzenpro.com/author/ali-malik/' },
    publisher: {
        '@type': 'Organization',
        name: 'HyzenPro',
        url: 'https://hyzenpro.com',
        logo: { '@type': 'ImageObject', url: `${getBaseUrl()}/images/logo.svg` },
    },
    reviewRating: {
        '@type': 'Rating',
        ratingValue: '4.7',
        bestRating: '5',
        worstRating: '1',
    },
    about: {
        '@type': 'SoftwareApplication',
        name: 'Cursor Composer 2.5',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        url: 'https://cursor.com',
    },
};

const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: getBaseUrl() },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${getBaseUrl()}/blog/` },
        {
            '@type': 'ListItem',
            position: 3,
            name: 'Cursor Composer 2.5 Review',
            item: CURRENT_URL,
        },
    ],
};

const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'How does Cursor Composer 2.5 compare to Opus-4.7 and GPT-5.5?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'In independent benchmarks by AI Coding Daily, Composer 2.5 scores 63.2% — just behind Opus-4.7 max (64.8%) and GPT-5.5 xhigh (64.3%) — at an average cost of $0.55 per task, making it 8–20x cheaper than those frontier models.',
            },
        },
        {
            '@type': 'Question',
            name: 'What model is Cursor Composer 2.5 based on?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "Composer 2.5 is built on the same open-source checkpoint as Composer 2: Moonshot's Kimi K2.5. Cursor applied additional RL training with textual feedback and 25x more synthetic data on top of that base.",
            },
        },
        {
            '@type': 'Question',
            name: 'What does Cursor Composer 2.5 cost?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The standard variant is $0.50/M input tokens and $2.50/M output tokens. The faster variant is $3.00/M input and $15.00/M output. Both are significantly cheaper than comparable frontier models.',
            },
        },
    ],
};

// ── Post Content ─────────────────────────────────────────────────────────────
// HTML rendered BEFORE the interactive benchmark chart
const POST_HTML_PART1 = `
<p>Cursor dropped <strong>Composer 2.5</strong> on May 18, 2026, and the reception was about as mixed as you'd expect for a model that sat right at the frontier. In independent testing by <a href="https://aicodingdaily.com" target="_blank" rel="noopener noreferrer">AI Coding Daily</a>, it landed at <strong>#3 on the leaderboard with a 63.2% score</strong> — nearly neck-and-neck with Opus-4.7 max (64.8%) and GPT-5.5 xhigh (64.3%) — while costing a fraction of either. But not everyone was convinced, and we'll get to that.</p>

<h2 id="what-is">What Is Cursor Composer 2.5?</h2>
<p>Cursor is the AI-native IDE built around agentic coding workflows — not a plugin bolted onto VS Code, but a full ground-up environment designed to let you build real software entirely through conversation and plans. Composer is Cursor's own proprietary AI model, trained specifically for long-horizon coding tasks inside that agent harness.</p>
<p>Composer 2.5 is built on the same open-source foundation as Composer 2: <a href="https://cursor.com/blog/composer-2-technical-report" target="_blank" rel="noopener noreferrer">Moonshot's Kimi K2.5 checkpoint</a>. What Cursor did on top of that base is what makes this interesting — they applied a significantly upgraded training stack including targeted RL with textual feedback and 25x more synthetic training data than its predecessor.</p>
<p>Cursor also announced a partnership with SpaceXAI, training a significantly larger next-generation model using 10× more total compute on Colossus 2. Composer 2.5 is a stepping stone toward that, not the end destination.</p>

<blockquote><p>Composer 2.5 is not a new base model — it's Kimi K2.5 with aggressive fine-tuning. If Kimi is the raw clay, Cursor's training pipeline is the kiln. The result is meaningfully different in coding-specific behavior.</p></blockquote>

<h2 id="benchmarks">Benchmark Results: Where Does It Actually Stand?</h2>
<p>The chart below is from AI Coding Daily's independent leaderboard — a real-world benchmark across three Laravel/PHP projects run five times each, with automated test suites that the models had no prior access to.</p>
<p>The standout number is the <strong>cost column</strong>. Composer 2.5 scored 63.2% at $0.55 average cost per task. Opus-4.7 max scored 64.8% at $11.02. You are getting 97.5% of the top model's performance for about 5% of the cost. That's not a minor advantage — that's a structural shift in how much you can build per dollar.</p>
<p>Composer 2.5 also beat <a href="/ai-tools-directory/ai-writing-tools/claude-4-7-opus/">Claude Opus 4.7</a> at the xhigh (61.6%), high (59.4%), and medium (52.7%) effort tiers, and outperformed every GPT-5.5 setting below xhigh. The only models sitting above it are the two most expensive configurations of frontier models available.</p>

<div class="wp-block-callout" style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>📊 N+1 Query Test:</strong> On the N+1 query test — reading an obscure package's documentation, understanding it, and fixing the actual problem — Composer 2.5 scored perfect five for five. Composer 2 failed all five times. That's the clearest single signal of improvement.</p>
</div>
`;

// HTML rendered AFTER the chart
const POST_HTML_PART2 = `
<h2 id="how-it-works">How Cursor Actually Trained It</h2>
<p>The technical report on the Cursor blog is worth reading if you're into training details, but here's the short version of what made Composer 2.5 different from just "more Kimi."</p>

<h3>Targeted RL with Textual Feedback</h3>
<p>One of the core problems in reinforcement learning for long coding sessions is credit assignment. When a rollout spans hundreds of thousands of tokens, a bad tool call buried deep in the middle barely shows up in the final reward signal. You know something went wrong, but the gradient can't easily find where.</p>
<p>Cursor's approach: inject a short hint directly at the exact point in the trajectory where the model misbehaved. They use the hint-informed distribution as a "teacher" and the original as a "student," applying a localized KL loss that updates only the weights responsible for that specific behavior. This gave them precise control over everything from tool call accuracy to communication style without corrupting the broader RL objective.</p>

<h3>25× More Synthetic Tasks</h3>
<p>Composer 2.5 was trained on 25 times more synthetic tasks than Composer 2. These aren't random text — they're grounded in real codebases. One technique Cursor used was <em>feature deletion</em>: remove a feature from a real codebase with tests intact, then task the agent to reimplement it. Tests serve as the verifiable reward.</p>
<p>Interestingly, the model got good enough that it started finding unintended shortcuts — locating Python type-checking caches to reverse-engineer deleted function signatures, or decompiling Java bytecode to reconstruct third-party APIs. Cursor had to build agentic monitoring tools just to catch these workarounds. That's not a flaw — that's the model being extremely good at finding solutions.</p>

<div class="wp-block-callout" style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>🔬 Reward Hacking:</strong> The reward hacking episodes are actually a sign of a capable model finding edges in the environment — the same behavior you'd call "creative problem solving" in a human engineer.</p>
</div>

<h2 id="speed">Speed in Practice: It's Noticeably Faster</h2>
<p>In head-to-head comparisons done by multiple reviewers, Composer 2.5 Fast is significantly quicker than <a href="/ai-tools-directory/ai-chatbots/gpt-5-5/">GPT-5.5</a> and <a href="/ai-tools-directory/ai-writing-tools/claude-4-7-opus/">Claude Opus 4.7</a> at equivalent tasks. While Claude Code with Sonnet might take two minutes on a moderately complex prompt, Composer 2.5 Fast regularly finishes the same task in seconds — reading files, searching, making changes, testing — all while the competing model is still in the planning phase.</p>
<p>In the N+1 benchmark, Composer 2 was actually faster because it didn't dig deep enough to actually solve the problem — it delivered a wrong answer quickly. Composer 2.5 took longer on that specific test because it went further: tested the assumption, found the actual issue, and fixed it. That's a meaningful distinction between speed and intelligence.</p>

<div class="wp-block-callout" style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>⚡ Speed Note:</strong> If you're comparing raw token generation speed to Gemini 3.5 Flash, Composer 2.5 won't win on that single metric. But for end-to-end task completion — planning, executing, verifying — Composer 2.5 Fast is hard to beat in practice.</p>
</div>

<h2 id="pricing">Pricing Breakdown</h2>
<p>This is where Composer 2.5 really makes a case for itself. Here's how it stacks up on API pricing against the frontier models it's competing with on benchmarks:</p>

<div class="wp-block-table"><table><tbody>
<tr><td><strong>Model / Tier</strong></td><td><strong>Input / 1M tokens</strong></td><td><strong>Output / 1M tokens</strong></td><td><strong>Notes</strong></td></tr>
<tr><td><strong>Composer 2.5 (standard)</strong></td><td>$0.50</td><td>$2.50</td><td>Best for budget-conscious tasks</td></tr>
<tr><td><strong>Composer 2.5 Fast</strong></td><td>$3.00</td><td>$15.00</td><td>Same intelligence, much faster</td></tr>
<tr><td>Opus-4.7 max</td><td>~$15.00</td><td>~$75.00</td><td>Highest quality, highest cost</td></tr>
<tr><td>GPT-5.5 xhigh</td><td>~$10.00</td><td>~$30.00</td><td>Strong, but expensive at scale</td></tr>
</tbody></table></div>

<p>The fast variant at $3/$15 per million tokens is actually cheaper than the "fast tiers" of other frontier models, according to Cursor. And if you're on a Cursor subscription, the effective per-task cost drops further — the 15-prompt benchmark run in the AI Coding Daily tests cost roughly $0.22 total during the launch week with double usage included.</p>

<div class="wp-block-callout" style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>💰 Launch Offer:</strong> Cursor launched with <strong>double usage for the first week</strong>. If you're evaluating whether to switch or try it, that window is the cheapest time to run extensive tests on your own real projects.</p>
</div>

<h2 id="controversy">The Controversy: Why Theo Called It a Disaster</h2>
<p>Not everyone looked at Composer 2.5's launch and saw a win. Developer and YouTuber Theo (t3.gg) posted a viral reaction on launch day that went the other direction entirely — his benchmark showed it scoring <em>worse</em> than Composer 2, at 4x the cost, leading him to call it one of the worst major model drops of all time.</p>
<p>A few things worth noting here. Theo's benchmark and the AI Coding Daily leaderboard are measuring different things on different task sets. The AI Coding Daily data clearly shows Composer 2.5 outperforming Composer 2 by a significant margin (63.2% vs 52.2%). Theo's results on his own benchmark apparently showed the inverse.</p>
<p>This is a real and ongoing issue with AI model evaluation: there is no universal benchmark, and performance varies significantly by domain, language, and task type. In the filament admin panel test in AI Coding Daily's suite, Composer 2.5 actually made more mistakes than Composer 2 — suggesting the model may be stronger on some frameworks and weaker on others.</p>
<p>The honest take: if your workflow involves the specific patterns where Composer 2.5 struggles in Theo's tests, his reaction is valid. If your work looks more like the tasks in the AI Coding Daily benchmark, the picture is much more positive. Testing it on your own codebase for a week is the only way to know for sure.</p>

<div class="wp-block-callout" style="background:#fff1f2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>⚠️ Our Recommendation:</strong> Neither benchmark is the ground truth. Run Composer 2.5 on something that actually matters to your work before making a judgment either way.</p>
</div>

<h2 id="who-for">Who Should Actually Use Composer 2.5?</h2>
<p><strong>You should seriously try it if:</strong> you're already on Cursor and looking for a better default model; you're building in Laravel, Node.js, or any mainstream stack; you care about per-task cost and do high-volume development; or you want a model that behaves thoughtfully on long-running agentic tasks rather than just token-pumping output fast.</p>
<p><strong>You might want to stick with your current setup if:</strong> you're heavily invested in <a href="/ai-tools-directory/ai-chatbots/gpt-5-5/">GPT-5.5</a> for architectural planning or front-end design (it's still considered slightly stronger there by many reviewers); you work primarily in niche frameworks with limited training data representation; or your benchmark results with Composer 2 were already good enough that the upgrade cost isn't worth the workflow change.</p>
<p>It's also worth comparing Cursor's workflow model against alternatives. We did a full breakdown of <a href="/blog/google-antigravity-2-review/">Google Antigravity 2.0's agent harness</a> — a different architecture philosophy that's worth reading before committing to either ecosystem.</p>

<h2 id="verdict">Editorial Verdict</h2>
<p>Composer 2.5 is a legitimate frontier model for coding tasks at a price point that changes the math on what you can build per dollar. The benchmark score alone would make it interesting. The cost story makes it genuinely compelling. The controversy around it is real but also illustrates something true about AI evaluation more broadly: performance is deeply context-dependent, and no single leaderboard settles the question. The smart move is to test it on your actual work.</p>

<h3>What We Like</h3>
<p>The price-to-performance ratio is simply unmatched at this quality level. The targeted textual feedback training approach is genuinely novel and shows up in real behavior — better error recovery, more deliberate tool usage. The 25x synthetic data expansion means it's encountered a much wider range of code patterns. Speed on the fast variant is class-leading for practical tasks.</p>

<h3>What to Watch</h3>
<p>Framework-specific gaps are real — the filament admin panel test was a clear weak point. The Theo controversy suggests there are task types where it underperforms relative to expectations. And the next-generation model being trained with SpaceXAI on Colossus 2 — using 10× more compute — is the real future bet. Composer 2.5 may end up looking like a capable interim step.</p>
`;

const POST_TAGS = [
    'Cursor AI',
    'Composer 2.5',
    'AI Coding Tools',
    'LLM Benchmarks',
    'Kimi K2.5',
    'SpaceX AI',
    'Agentic Coding',
];
const POST_CATEGORIES = ['AI Coding Tools', 'AI Tools'];
const editorialAuthor = getEditorialAuthor('ali-malik');
const POST_AUTHOR = {
    name: editorialAuthor.name,
    role: editorialAuthor.role,
    bio: editorialAuthor.bio,
    avatar: editorialAuthor.avatar,
    slug: editorialAuthor.slug,
    socialLinks: editorialAuthor.socialLinks,
};

export default async function Composer25ReviewPage() {
    let post: any = null;
    let relatedPosts: any[] = [];

    try {
        post = await prisma.post.findUnique({ where: { slug: SLUG } });
    } catch {}

    const matcherContext = getMatcherDiscoveryContext();

    // Parse Part 1 HTML for TOC headings
    const combinedHtml = sanitizeBlogHtml(POST_HTML_PART1 + POST_HTML_PART2);
    const $ = cheerio.load(combinedHtml);
    const headingIds = new Map<string, number>();
    const tocItems: Array<{ id: string; text: string; level: number }> = [];
    $('h2, h3').each((i, el) => {
        const text = $(el).text();
        const baseId = ($(el).attr('id') || text)
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = headingIds.get(baseId) || 0;
        headingIds.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
        $(el).attr('id', id);
        tocItems.push({ id, text, level: el.tagName.toLowerCase() === 'h2' ? 2 : 3 });
    });

    // Parse each part individually to get updated HTML with IDs injected
    const $1 = cheerio.load(sanitizeBlogHtml(POST_HTML_PART1));
    const $2 = cheerio.load(sanitizeBlogHtml(POST_HTML_PART2));

    // Re-apply heading IDs to individual parts
    const part1Ids = new Map<string, number>();
    $1('h2, h3').each((i, el) => {
        const text = $1(el).text();
        const baseId = ($1(el).attr('id') || text)
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = part1Ids.get(baseId) || 0;
        part1Ids.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
        $1(el).attr('id', id);
    });

    const part2Ids = new Map<string, number>();
    $2('h2, h3').each((i, el) => {
        const text = $2(el).text();
        const baseId = ($2(el).attr('id') || text)
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = part2Ids.get(baseId) || 0;
        part2Ids.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
        $2(el).attr('id', id);
    });

    const parsedPart1 = $1('body').html() || POST_HTML_PART1;
    const parsedPart2 = $2('body').html() || POST_HTML_PART2;

    // Related posts
    try {
        relatedPosts = await prisma.post.findMany({
            where: { status: 'published', slug: { not: SLUG }, categories: { hasSome: POST_CATEGORIES } },
            take: 3,
            orderBy: { publishedAt: 'desc' },
            include: { authorModel: { select: { id: true, name: true, slug: true, image: true } } },
        });
    } catch {}
    if (relatedPosts.length === 0) {
        try {
            relatedPosts = await prisma.post.findMany({
                where: { status: 'published', slug: { not: SLUG } },
                take: 3,
                orderBy: { publishedAt: 'desc' },
                include: { authorModel: { select: { id: true, name: true, slug: true, image: true } } },
            });
        } catch {}
    }

    const publishedDate = post?.publishedAt || post?.createdAt || new Date('2026-05-20');
    const readingTime = calculateReadingTime(combinedHtml);
    const internalLinks = post ? getInternalLinkRecommendations(post) : [];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: 'Cursor Composer 2.5 Review' },
                        ]}
                        className="mb-8"
                    />

                    {/* Article Header */}
                    <header className="max-w-4xl mx-auto mb-12">
                        {/* Categories */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {POST_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/blog/?category=${encodeURIComponent(cat)}`}
                                    className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition-colors"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6">
                            Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task
                        </h1>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            It ranked #3 on our leaderboard — just below Opus-4.7 max — at an average task cost of{' '}
                            <strong className="text-gray-800">$0.55</strong>. Here&apos;s everything you need to know,
                            including why some developers are still skeptical.
                        </p>

                        {/* Rating badge */}
                        <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-6">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map((i) => (
                                    <span key={i} className="text-orange-400 text-sm">★</span>
                                ))}
                                <span className="text-orange-300 text-sm">★</span>
                            </div>
                            <span className="text-sm font-bold text-gray-800">4.7 / 5</span>
                            <span className="text-xs text-gray-700">Editorial Score</span>
                        </div>

                        {/* Key stats strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                            {[
                                { label: 'Benchmark Score', value: '63.2%', sub: 'vs 64.8% Opus max' },
                                { label: 'Avg Cost / Task', value: '$0.55', sub: 'vs $11.02 Opus max' },
                                { label: 'vs Composer 2', value: '+11pp', sub: '52.2% → 63.2%' },
                                { label: 'Input Token Price', value: '$0.50', sub: 'per 1M tokens' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center"
                                >
                                    <span className="block font-heading text-xl text-black mb-0.5">{stat.value}</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">
                                        {stat.label}
                                    </span>
                                    <span className="block text-[10px] text-gray-700 mt-0.5">{stat.sub}</span>
                                </div>
                            ))}
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 pb-6 border-b border-gray-200">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {POST_AUTHOR.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(publishedDate)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTime} min read
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="max-w-5xl mx-auto relative w-full aspect-[2/1] md:aspect-[21/9] rounded-3xl overflow-hidden mb-16 border border-gray-200 shadow-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 mb-4">
                                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Benchmark #3</span>
                            </div>
                            <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 leading-tight">
                                Cursor Composer 2.5
                            </h2>
                            <p className="text-gray-300 text-lg">
                                63.2% benchmark score · $0.55 avg cost per task
                            </p>
                            <div className="mt-6 flex items-center gap-4 text-gray-300 text-sm">
                                <span>vs Opus-4.7 max: 64.8% at $11.02</span>
                                <span>·</span>
                                <span>20× cheaper</span>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Sidebar — Social Share */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <SocialShare
                                    url={CURRENT_URL}
                                    title="Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task"
                                />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <article className="prose prose-lg blog-article max-w-none mb-16
                                prose-headings:font-heading prose-headings:text-black prose-headings:scroll-mt-28
                                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                                prose-p:text-gray-700 prose-p:leading-relaxed
                                prose-strong:text-gray-800
                                prose-a:text-black prose-a:underline prose-a:underline-offset-2 prose-a:decoration-gray-300 hover:prose-a:decoration-black
                                prose-ul:text-gray-700 prose-ol:text-gray-700
                                prose-li:marker:text-gray-700
                                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:text-gray-700 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                                prose-table:text-sm prose-th:bg-gray-50 prose-th:text-gray-700
                                prose-img:rounded-2xl prose-img:border prose-img:border-gray-200 prose-img:shadow-sm">
                                <div dangerouslySetInnerHTML={{ __html: parsedPart1 }} />

                                {/* Interactive Benchmark Chart — inserted between article sections */}
                                <div className="my-8 not-prose">
                                    <Composer25Chart />
                                </div>

                                <div dangerouslySetInnerHTML={{ __html: parsedPart2 }} />
                            </article>

                            {/* Tags */}
                            {POST_TAGS.length > 0 && (
                                <div className="mb-10 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                         <Tag className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                                        {POST_TAGS.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/blog/?tag=${encodeURIComponent(tag)}`}
                                                className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-medium text-gray-700 hover:bg-black hover:text-white hover:border-black transition-colors"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {internalLinks.length > 0 && <InternalLinkingPanel links={internalLinks} />}

                            <div className="mb-16">
                                <MatcherDiscoveryCard context={matcherContext} />
                            </div>

                            {/* Author Box */}
                            <div className="mt-16 pt-12 border-t border-gray-200">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-6">About the Author</h3>
                                <AuthorBox author={POST_AUTHOR} variant="full" />
                            </div>

                            {/* Mobile Social Share */}
                            <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-4">Share This Article</h3>
                                <SocialShare
                                    url={CURRENT_URL}
                                    title="Cursor Composer 2.5 Review: Frontier-Level AI Coding at $0.55 Per Task"
                                />
                            </div>
                        </div>

                        {/* Right Sidebar — TOC */}
                        <div className="lg:col-span-4 xl:col-span-3 order-first lg:order-last mb-10 lg:mb-0">
                            <div className="sticky top-32">
                                <TableOfContents items={tocItems} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-16 py-16 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="font-heading text-3xl text-black text-center mb-10">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost: any) => (
                                    <PostCard key={relatedPost.id} post={relatedPost} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}
