import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AuthorBox from '@/components/eeat/AuthorBox';
import TableOfContents from '@/components/blog/TableOfContents';
import InternalLinkingPanel from '@/components/blog/InternalLinkingPanel';
import PostCard from '@/components/blog/PostCard';
import AffiliateDisclosure from '@/components/blog/AffiliateDisclosure';
import Link from 'next/link';
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
import SonnetFiveBenchmarkChart from './SonnetFiveBenchmarkChart';

const SLUG = 'claude-sonnet-5-review';
const CURRENT_URL = `${getBaseUrl()}/blog/${SLUG}/`;

export const metadata: Metadata = {
    title: 'Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8',
    description:
        'Claude Sonnet 5 launched June 30, 2026 with 63.2% on SWE-bench Pro, 80.4% on Terminal-Bench, and pricing from $2/$10 per million tokens. Full benchmark breakdown, pricing, and honest comparison to Opus 4.8.',
    keywords: [
        'claude sonnet 5 review',
        'claude sonnet 5 benchmarks',
        'claude sonnet 5 pricing',
        'claude sonnet 5 vs opus 4.8',
        'anthropic sonnet 5',
        'swe-bench pro sonnet 5',
        'terminal-bench sonnet 5',
        'ai model review 2026',
        'best mid-tier ai model 2026',
        'claude sonnet 5 cost per token',
    ],
    alternates: { canonical: CURRENT_URL },
    openGraph: {
        type: 'article',
        title: 'Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8',
        description: '63.2% SWE-bench Pro. 80.4% Terminal-Bench. $2/$10 intro pricing. Full benchmark breakdown and honest comparison to Opus 4.8.',
        url: CURRENT_URL,
        publishedTime: '2026-07-01T09:00:00.000Z',
        authors: ['Ali Malik'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Claude Sonnet 5 Review: Benchmarks, Pricing & Opus 4.8 Comparison',
        description: '63.2% SWE-bench Pro. 80.4% Terminal-Bench. $2/$10 intro pricing. Full breakdown.',
    },
};

const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8',
    description: 'Claude Sonnet 5 launched June 30, 2026 with 63.2% on SWE-bench Pro, 80.4% on Terminal-Bench, and pricing from $2/$10 per million tokens.',
    datePublished: '2026-07-01T09:00:00+00:00',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: 'Ali Malik', url: 'https://hyzenpro.com/author/ali-malik/' },
    publisher: { '@type': 'Organization', name: 'HyzenPro', url: 'https://hyzenpro.com' },
};

const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: getBaseUrl() },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${getBaseUrl()}/blog/` },
        { '@type': 'ListItem', position: 3, name: 'Claude Sonnet 5 Review', item: CURRENT_URL },
    ],
};

const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: "What is Claude Sonnet 5's model ID and context window?",
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Claude API model ID is claude-sonnet-5 (anthropic.claude-sonnet-5 on AWS Bedrock). It ships with a 1M-token context window and 128K max output tokens, raisable to 300K via a batch-API beta header.',
            },
        },
        {
            '@type': 'Question',
            name: 'How much does Claude Sonnet 5 cost?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Introductory pricing is $2 per million input tokens and $10 per million output tokens through August 31, 2026. From September 1, 2026, it moves to standard pricing of $3 per million input tokens and $15 per million output tokens, the same list price as Sonnet 4.6.',
            },
        },
        {
            '@type': 'Question',
            name: 'Is Claude Sonnet 5 better than Opus 4.8?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "Not across the board. Sonnet 5 edges past Opus 4.8 only on GDPval-AA v2 knowledge work (1618 vs 1615) and nearly matches it on Humanity's Last Exam with tools. Opus 4.8 still leads on SWE-bench Pro, Terminal-Bench 2.1, OSWorld-Verified, and HLE without tools. Sonnet 5 wins on price and speed.",
            },
        },
        {
            '@type': 'Question',
            name: 'Where can I use Claude Sonnet 5?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "Sonnet 5 is the default model for Free and Pro users on claude.ai and is available to Max, Team, and Enterprise plans. It's also live in Claude Code, the Claude API, Amazon Bedrock, Google Cloud Vertex AI, and Microsoft Foundry.",
            },
        },
    ],
};

const POST_HTML_PART1 = `
<p>On June 30, 2026, Anthropic released <strong>Claude Sonnet 5</strong>, the newest model in its mid-tier Sonnet line. Anthropic calls it the "most agentic Sonnet model yet" — a model that plans multi-step work, drives browsers and terminals, and follows a task through to completion instead of stopping halfway. That last part is the real story. Benchmarks aside, the most common thing early users mentioned is that Sonnet 5 finishes jobs that older Sonnet models would abandon or report as "done" when they weren't.</p>

<p>This review sticks to numbers Anthropic actually published in its <a href="https://www.anthropic.com/news/claude-sonnet-5" target="_blank" rel="noopener noreferrer nofollow">official launch post</a> and <a href="https://www.anthropic.com/claude-sonnet-5-system-card" target="_blank" rel="noopener noreferrer nofollow">system card</a>. Where a figure comes from a third party instead, it's labeled as such.</p>

<h2 id="what-is-it">What Is Claude Sonnet 5?</h2>
<p>Sonnet 5 sits in the middle of Anthropic's current lineup — above Haiku 4.5, below the flagship <a href="/blog/claude-opus-4-8-review/">Claude Opus 4.8</a>, and well below the export-restricted top tier covered in our <a href="/blog/claude-fable-5-mythos-5/">Claude Fable 5 and Mythos 5 breakdown</a>. Anthropic's pitch is that Sonnet 5 delivers agentic performance that used to require a larger, pricier model, at Sonnet-class pricing.</p>
<ul>
    <li><strong>Model ID:</strong> <code>claude-sonnet-5</code> on the Claude API, <code>anthropic.claude-sonnet-5</code> on AWS Bedrock</li>
    <li><strong>Context window:</strong> 1 million tokens</li>
    <li><strong>Max output:</strong> 128K tokens (raisable to 300K via a batch-API beta header)</li>
    <li><strong>Thinking:</strong> Adaptive reasoning, on by default, with effort set to High out of the box on the API and in Claude Code</li>
    <li><strong>Knowledge cutoff:</strong> January 2026</li>
    <li><strong>Availability:</strong> Default model for Free and Pro plans on claude.ai; also available on Max, Team, Enterprise, Claude Code, the Claude API, AWS Bedrock, Google Cloud Vertex AI, and Microsoft Foundry</li>
</ul>

<h2 id="benchmarks">Benchmark Breakdown: Sonnet 5 vs Sonnet 4.6 vs Opus 4.8</h2>
<p>The chart below plots every headline benchmark Anthropic published at launch. Opus 4.8 is included as the reference ceiling, and Sonnet 4.6 as the model most teams are upgrading from.</p>
`;

const POST_HTML_PART2 = `
<p>Two patterns stand out. First, Sonnet 5 improves on Sonnet 4.6 in every single category — this isn't a mixed upgrade. Second, Opus 4.8 still leads on raw accuracy everywhere except one metric: GDPval-AA v2 knowledge work, where Sonnet 5's 1618 edges past Opus 4.8's 1615. For the kind of drafting, research, and analysis work that agencies and founders lean on daily, Sonnet 5 is essentially matching the flagship model, for a fraction of the price.</p>
<p>Terminal-Bench 2.1 is the biggest single jump — a 13.4 point gain over Sonnet 4.6. That's the benchmark most relevant to agents that live inside a shell: running commands, reading output, recovering from errors. If your workflow involves Claude Code or any CLI-driven agent, this is the number that will actually show up in day-to-day reliability.</p>

<h2 id="vs-opus">Sonnet 5 vs Opus 4.8: Which One Should You Use?</h2>
<p>This is the real decision most teams face, since the two models now overlap heavily and Opus costs close to double at standard rates. Our full <a href="/blog/claude-opus-4-8-review/">Claude Opus 4.8 review</a> and the <a href="/blog/claude-opus-4-8-vs-gpt-5-5-coding-benchmark/">Opus 4.8 vs GPT-5.5 coding benchmark comparison</a> go deeper on Opus specifically, but here's the short version for Sonnet 5:</p>
<ul>
    <li><strong>Pick Opus 4.8</strong> for the hardest, accuracy-critical jobs — frontier-difficulty coding tasks, computer-use automation where a few extra points of accuracy matter, or any cybersecurity work that needs reduced guardrails. Anthropic specifically recommends Opus for that last case, since Sonnet 5 was not deliberately trained on cybersecurity tasks and ships with cyber safeguards on by default.</li>
    <li><strong>Pick Sonnet 5</strong> for the bulk of agentic coding, tool use, and knowledge work — day-to-day automation, content production pipelines, client reporting, and coding agents that don't need to squeeze out the last few points of accuracy. It's also the faster model of the two.</li>
</ul>

<h2 id="whats-new">What Changed Since Sonnet 4.6</h2>
<p>If you're already running Sonnet 4.6 in production, here's the version-over-version delta on every headline metric:</p>
<ul>
    <li>Terminal-Bench 2.1: +13.4 points (67.0% → 80.4%)</li>
    <li>Humanity's Last Exam, with tools: +10.6 points (46.8% → 57.4%)</li>
    <li>Humanity's Last Exam, no tools: +8.6 points (34.6% → 43.2%)</li>
    <li>SWE-bench Pro: +5.1 points (58.1% → 63.2%)</li>
    <li>OSWorld-Verified: +2.7 points (78.5% → 81.2%)</li>
    <li>GDPval-AA v2: +223 points (1395 → 1618)</li>
</ul>
<p>Anthropic's own safety assessment also reports that Sonnet 5 shows a lower overall rate of undesirable behaviors than Sonnet 4.6 — including better resistance to prompt-injection hijack attempts and lower rates of hallucination and sycophancy. It's not the safety leader across the whole lineup: Anthropic notes Sonnet 5 still shows somewhat higher rates of misaligned behavior on its internal audit than Opus 4.8 and the currently export-restricted Claude Mythos Preview. If you're weighing the full range of frontier options rather than just Anthropic's lineup, our <a href="/blog/top-5-frontier-ai-models-2026/">top 5 frontier AI models of 2026</a> roundup puts Sonnet 5 in that broader context.</p>

<h2 id="pricing">Pricing: What Sonnet 5 Actually Costs</h2>

<p>There's a catch worth budgeting for. Sonnet 5 uses an updated tokenizer that maps the same text to roughly <strong>1.0–1.35× more tokens</strong> than Sonnet 4.6 did. Anthropic set the introductory pricing to be roughly cost-neutral during the transition, which means the real question isn't the rate card — it's what happens on September 1, when standard pricing kicks in at the same $3/$15 list price as Sonnet 4.6, but against a token count that may be meaningfully higher for the same prompts and outputs. Agencies billing clients on a per-project basis should run a sample of real workloads through both models before assuming a flat swap.</p>

<h2 id="who-should-use">Who Should Actually Use Claude Sonnet 5?</h2>
<p><strong>Founders and solo builders:</strong> Sonnet 5 is a sensible default. Near-Opus quality on coding and knowledge work at a third of the price is the kind of margin that matters when you're watching a token bill closely. Save Opus 4.8 for the handful of tasks that genuinely need the extra accuracy.</p>
<p><strong>Agencies:</strong> the GDPval-AA v2 result — Sonnet 5 slightly ahead of Opus 4.8 on professional knowledge work — is the number to pay attention to if your work is heavier on client reporting, content production, and research synthesis than on frontier-difficulty coding. Route routine deliverables to Sonnet 5 and reserve Opus for the jobs where a six-point accuracy gap on coding benchmarks would actually change the outcome.</p>
<p><strong>Developers building coding agents:</strong> the Terminal-Bench 2.1 jump (67.0% → 80.4%) is the most tangible upgrade if your agents operate inside a shell. It's also worth comparing how Sonnet 5 behaves inside an IDE agent versus a dedicated coding tool — our <a href="/blog/cursor-composer-2-5-review/">Cursor Composer 2.5 review</a> covers that angle from the tooling side rather than the raw model side.</p>

<h2 id="verdict">Editorial Verdict</h2>

<h2 id="faq">Frequently Asked Questions</h2>
<h3>What is Claude Sonnet 5's model ID and context window?</h3>
<p>The Claude API model ID is <code>claude-sonnet-5</code> (<code>anthropic.claude-sonnet-5</code> on AWS Bedrock). The context window is 1 million tokens, with 128K max output tokens, raisable to 300K via a batch-API beta header.</p>
<h3>How much does Claude Sonnet 5 cost?</h3>
<p>Introductory pricing is $2 per million input tokens and $10 per million output tokens through August 31, 2026, then $3/$15 from September 1 — the same list price as Sonnet 4.6, though the new tokenizer counts roughly 1.0–1.35× more tokens for the same text.</p>
<h3>Is Claude Sonnet 5 better than Opus 4.8?</h3>
<p>Not across the board. Sonnet 5 edges past Opus 4.8 only on GDPval-AA v2 knowledge work and nearly matches it on Humanity's Last Exam with tools. Opus 4.8 still leads on SWE-bench Pro, Terminal-Bench 2.1, OSWorld-Verified, and HLE without tools. Sonnet 5 wins on price and speed.</p>
<h3>Where can I use Claude Sonnet 5?</h3>
<p>It's the default model for Free and Pro users on claude.ai and available on Max, Team, and Enterprise plans, plus Claude Code, the Claude API, AWS Bedrock, Google Cloud Vertex AI, and Microsoft Foundry.</p>

<hr />
<p class="text-sm text-neutral-500">Sources: Anthropic, <a href="https://www.anthropic.com/news/claude-sonnet-5" target="_blank" rel="noopener noreferrer nofollow">"Introducing Claude Sonnet 5"</a> (June 30, 2026) and the <a href="https://www.anthropic.com/claude-sonnet-5-system-card" target="_blank" rel="noopener noreferrer nofollow">Claude Sonnet 5 System Card</a>. All benchmark figures in this article are Anthropic's own published evaluation results.</p>
`;

const POST_TAGS = [
    'Claude Sonnet 5',
    'Anthropic',
    'AI Benchmarks',
    'SWE-Bench Pro',
    'Claude Opus 4.8',
    'AI Coding Tools',
    'Terminal-Bench',
    'AI Pricing',
    'AI Model Review',
    'Agentic AI',
];
const POST_CATEGORIES = ['AI Chatbots', 'AI Tools'];
const editorialAuthor = getEditorialAuthor('ali-malik');
const POST_AUTHOR = {
    name: editorialAuthor.name,
    role: editorialAuthor.role,
    bio: editorialAuthor.bio,
    avatar: editorialAuthor.avatar,
    slug: editorialAuthor.slug,
    socialLinks: editorialAuthor.socialLinks,
};

export default async function ClaudeSonnet5ReviewPage() {
    let post: any = null;
    let relatedPosts: any[] = [];

    try {
        post = await prisma.post.findUnique({ where: { slug: SLUG } });
    } catch {}

    const matcherContext = getMatcherDiscoveryContext();

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

    const $1 = cheerio.load(sanitizeBlogHtml(POST_HTML_PART1));
    const $2 = cheerio.load(sanitizeBlogHtml(POST_HTML_PART2));
    const part1Ids = new Map<string, number>();
    $1('h2, h3').each((i, el) => {
        const text = $1(el).text();
        const baseId = ($1(el).attr('id') || text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = part1Ids.get(baseId) || 0;
        part1Ids.set(baseId, count + 1);
        $1(el).attr('id', count === 0 ? baseId : `${baseId}-${count + 1}`);
    });
    const part2Ids = new Map<string, number>();
    $2('h2, h3').each((i, el) => {
        const text = $2(el).text();
        const baseId = ($2(el).attr('id') || text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = part2Ids.get(baseId) || 0;
        part2Ids.set(baseId, count + 1);
        $2(el).attr('id', count === 0 ? baseId : `${baseId}-${count + 1}`);
    });
    const parsedPart1 = $1('body').html() || POST_HTML_PART1;
    const parsedPart2 = $2('body').html() || POST_HTML_PART2;

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

    const publishedDate = post?.publishedAt || post?.createdAt || new Date('2026-07-01');
    const readingTime = calculateReadingTime(combinedHtml);
    const internalLinks = post ? getInternalLinkRecommendations(post) : [];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: 'Claude Sonnet 5 Review' }]} className="mb-8" />

                    <header className="max-w-4xl mx-auto mb-12">
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {POST_CATEGORIES.map((cat) => (
                                <Link key={cat} href={`/blog/?category=${encodeURIComponent(cat)}`} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition-colors">{cat}</Link>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                            <span className="px-3 py-1 bg-[#fef3ef] border border-[#f5c3b3] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#c94f2a]">Anthropic</span>
                            <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700">July 2026</span>
                            <span className="px-3 py-1 bg-[#edfaf5] border border-[#b3e8d9] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">4.6 / 5</span>
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6">
                            Claude Sonnet 5 Review: Benchmarks, Pricing, and How It Compares to <span className="text-[#c94f2a]">Opus 4.8</span>
                        </h1>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            Anthropic&apos;s mid-tier model just closed most of the gap with its own flagship — at less than half the price. Here&apos;s what actually changed, with the real numbers.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 pb-6 border-b border-gray-200">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{POST_AUTHOR.name}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(publishedDate)}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readingTime} min read</span>
                        </div>
                    </header>

                    <AffiliateDisclosure />

                    {/* Quick stats strip */}
                    <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                        {[
                            { value: '63.2%', label: 'SWE-bench Pro' },
                            { value: '80.4%', label: 'Terminal-Bench 2.1' },
                            { value: '1M', label: 'Token context window' },
                            { value: '$2/$10', label: 'Intro price per MTok' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-gray-200 p-3 text-center">
                                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-700 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <SocialShare url={CURRENT_URL} title="Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8" />
                            </div>
                        </div>

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

                                <div className="my-8 not-prose">
                                    <SonnetFiveBenchmarkChart />
                                </div>

                                <div className="overflow-x-auto">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Benchmark</th>
                                                <th>Sonnet 5</th>
                                                <th>Sonnet 4.6</th>
                                                <th>Opus 4.8 (ref)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>SWE-bench Pro (agentic coding)</td>
                                                <td>63.2%</td>
                                                <td>58.1%</td>
                                                <td>69.2%</td>
                                            </tr>
                                            <tr>
                                                <td>Terminal-Bench 2.1 (terminal &amp; tool use)</td>
                                                <td>80.4%</td>
                                                <td>67.0%</td>
                                                <td>82.7%</td>
                                            </tr>
                                            <tr>
                                                <td>OSWorld-Verified (computer use)</td>
                                                <td>81.2%</td>
                                                <td>78.5%</td>
                                                <td>83.4%</td>
                                            </tr>
                                            <tr>
                                                <td>Humanity&apos;s Last Exam — no tools</td>
                                                <td>43.2%</td>
                                                <td>34.6%</td>
                                                <td>49.8%</td>
                                            </tr>
                                            <tr>
                                                <td>Humanity&apos;s Last Exam — with tools</td>
                                                <td>57.4%</td>
                                                <td>46.8%</td>
                                                <td>57.9%</td>
                                            </tr>
                                            <tr>
                                                <td>GDPval-AA v2 (professional knowledge work, Elo)</td>
                                                <td>1618</td>
                                                <td>1395</td>
                                                <td>1615</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-gray-700">
                                    Note: the coding row is <strong>SWE-bench Pro</strong>, the harder variant. Don&apos;t confuse it with SWE-bench Verified, where scores for most models run noticeably higher.
                                </p>

                                <div dangerouslySetInnerHTML={{ __html: parsedPart2 }} />

                                <div className="not-prose rounded-2xl border border-gray-200 p-5 my-6">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">4.6 / 5</div>
                                    <p className="text-gray-700 text-sm">
                                        Claude Sonnet 5 is the best value in Anthropic&apos;s current lineup, not the outright best model. Every headline benchmark improves over Sonnet 4.6, safety metrics move in the right direction, and the price stays roughly flat through August at a meaningfully higher quality bar. Opus 4.8 still wins on raw accuracy for the hardest jobs, and the tokenizer change means &quot;same list price&quot; won&apos;t always mean &quot;same bill&quot; once standard pricing returns in September. For the large majority of day-to-day agentic coding and knowledge work, Sonnet 5 is now the sensible default.
                                    </p>
                                </div>
                            </article>

                            {POST_TAGS.length > 0 && (
                                <div className="mb-10 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                         <Tag className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                                        {POST_TAGS.map((tag) => (
                                            <Link key={tag} href={`/blog/?tag=${encodeURIComponent(tag)}`} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-medium text-gray-700 hover:bg-black hover:text-white hover:border-black transition-colors">{tag}</Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {internalLinks.length > 0 && <InternalLinkingPanel links={internalLinks} />}

                            <div className="mb-16"><MatcherDiscoveryCard context={matcherContext} /></div>

                            <div className="mt-16 pt-12 border-t border-gray-200">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-6">About the Author</h3>
                                <AuthorBox author={POST_AUTHOR} variant="full" />
                            </div>

                            <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-4">Share This Article</h3>
                                <SocialShare url={CURRENT_URL} title="Claude Sonnet 5 Review: Benchmarks, Pricing & How It Compares to Opus 4.8" />
                            </div>
                        </div>

                        <div className="lg:col-span-4 xl:col-span-3 order-first lg:order-last mb-10 lg:mb-0">
                            <div className="sticky top-32"><TableOfContents items={tocItems} /></div>
                        </div>
                    </div>
                </div>

                {relatedPosts.length > 0 && (
                    <section className="mt-16 py-16 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="font-heading text-3xl text-black text-center mb-10">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((rp: any) => <PostCard key={rp.id} post={rp} />)}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}
