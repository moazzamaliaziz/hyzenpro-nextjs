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
import Gpt56SolBenchmarkChart from './Gpt56SolBenchmarkChart';

const SLUG = 'gpt-5-6-sol-preview';
const CURRENT_URL = `${getBaseUrl()}/blog/${SLUG}/`;

export const metadata: Metadata = {
    title: 'GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude',
    description:
        'OpenAI previewed GPT-5.6 Sol, Terra, and Luna on June 26, 2026 \u2014 a restricted, government-coordinated preview with new agentic coding and cybersecurity capabilities. Full breakdown of benchmarks, pricing, safeguards, and access.',
    keywords: [
        'gpt-5.6 sol',
        'gpt-5.6 sol review',
        'gpt-5.6 benchmarks',
        'gpt-5.6 pricing',
        'openai gpt-5.6',
        'gpt-5.6 sol terra luna',
        'terminal-bench gpt-5.6',
        'ai model preview 2026',
        'gpt-5.6 vs claude',
        'agentic coding ai',
    ],
    alternates: { canonical: CURRENT_URL },
    openGraph: {
        type: 'article',
        title: 'GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude',
        description: 'OpenAI previewed GPT-5.6 Sol, Terra, and Luna on June 26, 2026 \u2014 a restricted, government-coordinated preview with new agentic coding and cybersecurity capabilities.',
        url: CURRENT_URL,
        publishedTime: '2026-07-01T09:00:00.000Z',
        authors: ['Rana Aqib'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & Claude Comparison',
        description: 'OpenAI previewed GPT-5.6 Sol, Terra, and Luna on June 26, 2026 \u2014 restricted preview, agentic coding, cybersecurity. Full breakdown.',
    },
};

const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude',
    description: 'OpenAI previewed GPT-5.6 Sol, Terra, and Luna on June 26, 2026 \u2014 a restricted, government-coordinated preview with new agentic coding and cybersecurity capabilities.',
    datePublished: '2026-07-01T09:00:00+00:00',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: 'Rana Aqib', url: 'https://hyzenpro.com/author/rana-aqib/' },
    publisher: { '@type': 'Organization', name: 'HyzenPro', url: 'https://hyzenpro.com' },
};

const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: getBaseUrl() },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${getBaseUrl()}/blog/` },
        { '@type': 'ListItem', position: 3, name: 'GPT-5.6 Sol Preview', item: CURRENT_URL },
    ],
};

const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is GPT-5.6 Sol?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "GPT-5.6 Sol is OpenAI's newest flagship model, previewed on June 26, 2026 alongside two smaller tiers, Terra and Luna. It focuses on agentic coding, biology workflows, and cybersecurity, and launched with OpenAI's most robust safety stack to date.",
            },
        },
        {
            '@type': 'Question',
            name: 'Can I use GPT-5.6 Sol right now?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "Not broadly. GPT-5.6 launched as a limited preview available only through the API and Codex to a small group of trusted partners whose participation was shared with the U.S. government. OpenAI says general availability in ChatGPT, Codex, and the API is planned within weeks, but no firm date has been announced.",
            },
        },
        {
            '@type': 'Question',
            name: 'How much does GPT-5.6 cost?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: "Per OpenAI's announcement, pricing is per million tokens: Sol is $5 input / $30 output, Terra is $2.50 input / $15 output, and Luna is $1 input / $6 output. GPT-5.6 also introduces prompt caching with explicit cache breakpoints and a 30-minute minimum cache life.",
            },
        },
        {
            '@type': 'Question',
            name: "Why is GPT-5.6 Sol's release restricted?",
            acceptedAnswer: {
                '@type': 'Answer',
                text: "OpenAI says it previewed GPT-5.6 Sol's capabilities to the U.S. government ahead of launch and, at the government's request, is starting with a limited preview for trusted partners before wider release, tied to an ongoing cyber Executive Order framework.",
            },
        },
    ],
};

const POST_HTML_PART1 = `
<p>On June 26, 2026, OpenAI began a limited preview of the <strong>GPT-5.6</strong> series: <strong>Sol</strong>, its new flagship model, <strong>Terra</strong>, a balanced everyday model, and <strong>Luna</strong>, a fast and inexpensive tier. The headline framing is agentic coding and cybersecurity \u2014 Sol is positioned as OpenAI&apos;s strongest model yet for long-horizon terminal work and defensive security tasks. The catch is availability: this is not a normal launch. Access is currently limited to a small, government-coordinated group of trusted partners, and OpenAI has not announced a firm date for general availability.</p>

<p>This review sticks closely to what OpenAI stated in its <a href="https://openai.com/index/previewing-gpt-5-6-sol/" target="_blank" rel="noopener noreferrer nofollow">official preview post</a>. Where specific benchmark percentages are cited, they come from outlets that reviewed OpenAI&apos;s published launch-day chart, since OpenAI&apos;s own post text describes results qualitatively (&quot;sets a new state of the art&quot;) without printing every figure inline \u2014 that distinction is flagged throughout.</p>

<h2 id="what-is-it">What Is GPT-5.6 Sol, Terra, and Luna?</h2>
<p>GPT-5.6 introduces a naming split OpenAI hasn&apos;t used before: the number identifies the model generation, while Sol, Terra, and Luna are durable capability tiers that can each advance on their own schedule going forward.</p>
<ul>
    <li><strong>Sol</strong> \u2014 the flagship. Positioned for agentic coding, long-horizon reasoning, biology workflows, and cybersecurity.</li>
    <li><strong>Terra</strong> \u2014 a balanced everyday model. OpenAI says it&apos;s competitive with GPT-5.5 while costing about half as much.</li>
    <li><strong>Luna</strong> \u2014 the fastest, cheapest tier, aimed at high-volume, latency-sensitive workloads like classification and chat.</li>
</ul>
<p>GPT-5.6 also introduces two new reasoning settings: a <code>max</code> effort level that gives Sol more time to reason on hard problems, and an <code>ultra</code> mode that dispatches subagents to parallelize complex, long-running work \u2014 similar in spirit to the multi-agent orchestration approaches showing up across the frontier lineup this year, including <a href="/blog/claude-opus-4-8-review/">Claude Opus 4.8&apos;s Dynamic Workflows</a>.</p>

<h2 id="benchmarks">Benchmarks: What OpenAI Actually Published</h2>
<p>OpenAI&apos;s preview post leads with three capability areas: agentic coding, biology, and cybersecurity, with fuller safety and preparedness evaluations reserved for the system card. The one benchmark chart in the launch post itself is <strong>Terminal-Bench 2.1</strong>, an agentic coding benchmark that tests command-line workflows requiring planning, iteration, and tool coordination \u2014 the same benchmark category that drove the biggest single gain in <a href="/blog/claude-sonnet-5-review/">Claude Sonnet 5&apos;s launch</a>.</p>
`;

const POST_HTML_PART2 = `
<p>OpenAI states plainly that Sol &quot;sets a new state of the art&quot; on Terminal-Bench 2.1. The specific percentages most widely reported by outlets that reviewed the chart put base Sol at <strong>88.8%</strong> and the higher-compute <strong>Sol Ultra</strong> mode at <strong>91.9%</strong> \u2014 ahead of GPT-5.5 and the current Claude Mythos 5 and Fable 5 figures on the same benchmark. Treat the exact decimal gaps between adjacent models with some skepticism: agentic benchmarks like this one are sensitive to harness configuration, retry policy, and random seed, so a gap under one point is closer to a statistical tie than a clear ranking.</p>
<p>Beyond the terminal benchmark, OpenAI reports two other capability claims worth noting:</p>
<ul>
    <li><strong>Biology (GeneBench v1):</strong> OpenAI says Sol achieves stronger results than GPT-5.5 on long-horizon genomics and quantitative-biology analysis, while using fewer tokens to get there.</li>
    <li><strong>Cybersecurity (ExploitBench):</strong> OpenAI says Sol is competitive with Claude Mythos Preview on ExploitBench while using roughly a third of the output tokens \u2014 a token-efficiency claim rather than a pure accuracy win. On the independently built ExploitGym benchmark (created by UC Berkeley researchers with OpenAI and other labs), OpenAI reports that Sol, Terra, and Luna all show strong gains in cyber capability as reasoning effort increases.</li>
</ul>
<p>Importantly, OpenAI states that GPT-5.6 Sol does <strong>not</strong> cross the Cyber Critical threshold under its Preparedness Framework. In evaluations against Chromium and Firefox, the model identified bugs and exploitation building blocks but did not autonomously produce a full working exploit chain under the tested conditions.</p>

<h2 id="safety">Why Is Access So Restricted?</h2>
<p>This is the part of the GPT-5.6 story that&apos;s arguably bigger news than the benchmarks. OpenAI says it previewed Sol&apos;s capabilities to the U.S. government ahead of launch, and, at the government&apos;s request, is starting with a limited preview for a small group of trusted partners \u2014 whose participation has reportedly been shared with the government \u2014 before wider release. OpenAI frames this as a short-term step tied to an ongoing cyber Executive Order framework, and says it does not believe this kind of government access process should become the long-term default for model releases.</p>
<p>The pattern is notably similar to what&apos;s currently happening on the Anthropic side of the market. Our <a href="/blog/claude-fable-5-mythos-5/">Claude Fable 5 and Mythos 5 breakdown</a> covers a related export-control suspension affecting Anthropic&apos;s top-tier models. Between the two labs, cyber-capable frontier models are increasingly shipping with government-coordinated gating rather than a normal public rollout \u2014 worth knowing if you&apos;re planning around either lab&apos;s top tier for the second half of 2026.</p>
<p>Practically, OpenAI describes a layered safeguard stack for the GPT-5.6 family: refusal training built into the model, real-time classifiers that can pause generation for review on higher-risk cyber and biology requests, account-level review across conversations for flagged activity, and differentiated access by risk level. OpenAI also says it dedicated over 700,000 A100-equivalent GPU hours to automated red-teaming aimed at finding universal jailbreaks \u2014 attacks that generalize across many prompts rather than one narrow case \u2014 ahead of this launch.</p>

<h2 id="pricing">Pricing and Access</h2>
<div className="overflow-x-auto">
<table>
    <thead>
        <tr>
            <th>Model</th>
            <th>Input / 1M tokens</th>
            <th>Output / 1M tokens</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Sol</td>
            <td>$5</td>
            <td>$30</td>
        </tr>
        <tr>
            <td>Terra</td>
            <td>$2.50</td>
            <td>$15</td>
        </tr>
        <tr>
            <td>Luna</td>
            <td>$1</td>
            <td>$6</td>
        </tr>
    </tbody>
</table>
</div>
<p>GPT-5.6 also introduces more predictable prompt caching: explicit cache breakpoints and a 30-minute minimum cache life. Cache writes are billed at 1.25x the model&apos;s uncached input rate, while cache reads keep the usual 90% cached-input discount. OpenAI also confirmed plans to run Sol on Cerebras hardware at up to 750 tokens per second starting in July, though that access will initially be limited to select customers as well.</p>
<p>As of publication, GPT-5.6 models are available only through the API and Codex, and only to the trusted-partner cohort. There is no ChatGPT access yet, and no confirmed general-availability date \u2014 OpenAI&apos;s own language is &quot;in the coming weeks.&quot;</p>

<h2 id="who-should-care">Who Should Actually Pay Attention Right Now?</h2>
<p><strong>Most founders and agencies:</strong> there&apos;s nothing to act on yet beyond awareness. You can&apos;t buy access, and OpenAI hasn&apos;t confirmed pricing tiers or rate limits for the general release. If your roadmap depends on a specific model choice this quarter, it&apos;s safer to plan around models you can actually use today \u2014 our <a href="/blog/top-5-frontier-ai-models-2026/">top 5 frontier AI models of 2026</a> roundup only covers models with real public availability.</p>
<p><strong>Security teams and defenders:</strong> the ExploitBench and ExploitGym claims are the most relevant signal here. OpenAI is explicitly framing Sol as a defensive tool first \u2014 vulnerability research, patch development, and security education \u2014 while trying to make offensive misuse harder and more detectable. If you already have Codex or API access as part of the preview cohort, this is the area worth testing first.</p>
<p><strong>Developers evaluating coding agents:</strong> Terminal-Bench 2.1 is becoming the benchmark to watch across every lab this year \u2014 it&apos;s the same category where <a href="/blog/claude-sonnet-5-review/">Claude Sonnet 5</a> posted its biggest single-generation jump, and where <a href="/blog/claude-opus-4-8-vs-gpt-5-5-coding-benchmark/">our Opus 4.8 vs GPT-5.5 coding benchmark comparison</a> already tracks a GPT-5.5-era result. Once Sol reaches general availability, it&apos;s worth re-running that comparison with actual hands-on numbers rather than vendor charts \u2014 and worth checking how it fits alongside IDE-native tools, which our <a href="/blog/cursor-composer-2-5-review/">Cursor Composer 2.5 review</a> covers from the tooling side.</p>

<h2 id="verdict">Editorial Take</h2>

<h2 id="faq">Frequently Asked Questions</h2>
<h3>What is GPT-5.6 Sol?</h3>
<p>GPT-5.6 Sol is OpenAI&apos;s newest flagship model, previewed on June 26, 2026 alongside two smaller tiers, Terra and Luna. It focuses on agentic coding, biology workflows, and cybersecurity, and launched with OpenAI&apos;s most robust safety stack to date.</p>
<h3>Can I use GPT-5.6 Sol right now?</h3>
<p>Not broadly. It&apos;s in a limited preview available only through the API and Codex to a small group of trusted partners whose participation was shared with the U.S. government. OpenAI says general availability in ChatGPT, Codex, and the API is planned within weeks, with no firm date announced yet.</p>
<h3>How much does GPT-5.6 cost?</h3>
<p>Per million tokens: Sol is $5 input / $30 output, Terra is $2.50 input / $15 output, and Luna is $1 input / $6 output. GPT-5.6 also introduces prompt caching with explicit cache breakpoints and a 30-minute minimum cache life.</p>
<h3>Why is GPT-5.6 Sol&apos;s release restricted?</h3>
<p>OpenAI says it previewed the model&apos;s capabilities to the U.S. government ahead of launch and, at the government&apos;s request, is starting with a limited trusted-partner preview before wider release, tied to an ongoing cyber Executive Order framework.</p>

<hr />
<p className="text-sm text-neutral-500">Source: OpenAI, <a href="https://openai.com/index/previewing-gpt-5-6-sol/" target="_blank" rel="noopener noreferrer nofollow">&quot;Previewing GPT-5.6 Sol: a next-generation model&quot;</a> (June 26, 2026). Benchmark percentages not printed directly in OpenAI&apos;s post text are attributed to third-party chart readings and flagged as such throughout this article.</p>
`;

const POST_TAGS = [
    'GPT-5.6',
    'OpenAI',
    'Sol',
    'Terra',
    'Luna',
    'AI Benchmarks',
    'Terminal-Bench',
    'Cybersecurity',
    'Agentic Coding',
    'AI Model Preview',
];
const POST_CATEGORIES = ['AI Tools', 'AI Chatbots'];
const editorialAuthor = getEditorialAuthor('rana-aqib');
const POST_AUTHOR = {
    name: editorialAuthor.name,
    role: editorialAuthor.role,
    bio: editorialAuthor.bio,
    avatar: editorialAuthor.avatar,
    slug: editorialAuthor.slug,
    socialLinks: editorialAuthor.socialLinks,
};

export default async function Gpt56SolPreviewPage() {
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
                    <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: 'GPT-5.6 Sol Preview' }]} className="mb-8" />

                    <header className="max-w-4xl mx-auto mb-12">
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {POST_CATEGORIES.map((cat) => (
                                <Link key={cat} href={`/blog/?category=${encodeURIComponent(cat)}`} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition-colors">{cat}</Link>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                            <span className="px-3 py-1 bg-[#edfaf5] border border-[#b3e8d9] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#10a37f]">OpenAI</span>
                            <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700">July 2026</span>
                            <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700">Preview</span>
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6">
                            GPT-5.6 Sol Preview: Benchmarks, Pricing, Access, and How It Compares to <span className="text-[#10a37f]">Claude</span>
                        </h1>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            OpenAI&apos;s newest flagship is here &mdash; but you probably can&apos;t use it yet. Here&apos;s what&apos;s actually confirmed about GPT-5.6 Sol, Terra, and Luna.
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
                            { value: 'Preview', label: 'Access status' },
                            { value: '3', label: 'Model tiers: Sol / Terra / Luna' },
                            { value: '$5/$30', label: 'Sol price per MTok' },
                            { value: '~20', label: 'Reported partner orgs' },
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
                                <SocialShare url={CURRENT_URL} title="GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude" />
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
                                    <Gpt56SolBenchmarkChart />
                                </div>

                                <div className="overflow-x-auto">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Benchmark</th>
                                                <th>Sol Ultra</th>
                                                <th>Sol</th>
                                                <th>GPT-5.5</th>
                                                <th>Claude Mythos 5</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Terminal-Bench 2.1 (agentic coding)</td>
                                                <td>91.9%</td>
                                                <td>88.8%</td>
                                                <td>88.0%</td>
                                                <td>84.3%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-gray-700">
                                    Note: benchmark percentages are third-party readings of OpenAI&apos;s launch-day chart, not figures OpenAI printed in its post text.
                                </p>

                                <div dangerouslySetInnerHTML={{ __html: parsedPart2 }} />

                                <div className="not-prose rounded-2xl border border-gray-200 p-5 my-6">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">Preview &mdash; not yet rated</div>
                                    <p className="text-gray-700 text-sm">
                                        We don&apos;t assign a star rating to models we can&apos;t independently test, and GPT-5.6 Sol isn&apos;t available to us or to the vast majority of readers yet. What&apos;s confirmed is real: OpenAI is claiming a genuine step up in agentic coding and cyber capability, backed by a materially heavier safety investment than prior releases. What&apos;s not confirmed is everything that depends on hands-on use &mdash; real-world reliability, how often the new safeguards interrupt legitimate work, and whether the benchmark gains hold up outside OpenAI&apos;s own harness. We&apos;ll publish a full review with our own testing once GPT-5.6 reaches general availability.
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
                                <SocialShare url={CURRENT_URL} title="GPT-5.6 Sol Preview: Benchmarks, Pricing, Access & How It Compares to Claude" />
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
