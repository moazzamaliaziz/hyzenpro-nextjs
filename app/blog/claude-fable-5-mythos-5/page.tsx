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
import Fable5Chart from './Fable5Chart';

const SLUG = 'claude-fable-5-mythos-5';
const CURRENT_URL = `${getBaseUrl()}/blog/${SLUG}/`;

export const metadata: Metadata = {
    title: "Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model Goes Public",
    description:
        'Claude Fable 5 is the first Mythos-class AI ever made generally available — 80.3% SWE-Bench Pro, 29.3% FrontierCode Diamond, $10/M tokens. Full breakdown.',
    keywords: [
        'claude fable 5',
        'claude mythos 5',
        'anthropic fable 5',
        'fable 5 benchmark',
        'fable 5 vs opus 4.8',
        'fable 5 swe-bench pro',
        'mythos-class ai model',
        'claude fable 5 pricing',
        'fable 5 coding benchmark 2026',
    ],
    alternates: { canonical: CURRENT_URL },
    openGraph: {
        type: 'article',
        title: "Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model Goes Public",
        description: '80.3% SWE-Bench Pro. 29.3% FrontierCode Diamond. The first Mythos-class model available to the public.',
        url: CURRENT_URL,
        publishedTime: '2026-06-09T10:00:00.000Z',
        authors: ['Rana Aqib'],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model",
        description: '80.3% SWE-Bench Pro. 29.3% FrontierCode Diamond. The first Mythos-class model available to the public.',
    },
};

const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: "Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model Goes Public",
    description: 'Claude Fable 5 is the first Mythos-class AI ever made generally available — setting new state-of-the-art records across agentic coding, scientific research, vision, cybersecurity, and autonomous knowledge work.',
    datePublished: '2026-06-09T10:00:00+00:00',
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
        { '@type': 'ListItem', position: 3, name: 'Claude Fable 5 & Mythos 5', item: CURRENT_URL },
    ],
};

const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is Claude Fable 5?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Claude Fable 5 is Anthropic\'s first Mythos-class model made generally available. It scores 80.3% on SWE-Bench Pro and 29.3% on FrontierCode Diamond. It auto-routes sensitive cybersecurity and biology queries to Opus 4.8 via a classifier-based fallback system.',
            },
        },
        {
            '@type': 'Question',
            name: 'What is the difference between Fable 5 and Mythos 5?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Fable 5 and Mythos 5 share the same underlying model weights. The difference is the guardrail layer: Fable 5 auto-routes sensitive queries to Opus 4.8, while Mythos 5 lifts those restrictions for vetted Project Glasswing partners.',
            },
        },
        {
            '@type': 'Question',
            name: 'How much does Claude Fable 5 cost?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Fable 5 costs $10/M input tokens and $50/M output tokens — less than half the price of Mythos Preview. Prompt caching applies a 90% discount on cached tokens. It is free for Pro, Max, Team, and Enterprise subscribers until June 22, 2026.',
            },
        },
        {
            '@type': 'Question',
            name: 'What benchmarks does Fable 5 lead?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Fable 5 leads on SWE-Bench Pro (80.3%), FrontierCode Diamond (29.3%), Terminal-Bench 2.1 (88.0%), GDPval-AA knowledge work (1932), OSWorld computer use (85.0%), Legal Agent Benchmark (13.3%), HLE no tools (59.0%), ExploitBench cybersecurity (78.0%), HealthBench (66.0%), and BioMysteryBench (83.9%).',
            },
        },
    ],
};

const POST_HTML_PART1 = `
<p>On <strong>June 9, 2026</strong>, Anthropic simultaneously announced <strong>Claude Fable 5</strong> — a Mythos-class model made safe for general use — and <strong>Claude Mythos 5</strong>, its full-capability twin reserved for trusted cyberdefenders in Project Glasswing. This is the first time a Mythos-class model has been publicly available to anyone.</p>
<p>The backdrop: Anthropic unveiled Claude Mythos Preview in April 2026 and immediately declined to release it publicly, citing the model's ability to autonomously chain zero-day exploits across every major OS and browser. Two months later, Anthropic says it has built robust safeguards that route high-risk queries to Claude Opus 4.8 — and the resulting Fable 5 now ships to all Pro, Max, Team, and Enterprise subscribers.</p>

<div class="wp-block-callout" style="background:#eef2ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>🔑 Key Distinction:</strong> Fable 5 and Mythos 5 share <em>the same underlying model weights</em>. The difference is purely at the guardrail layer: Fable 5 auto-routes sensitive cybersecurity, biology, chemistry, and model-distillation queries to Opus 4.8, while Mythos 5 lifts those restrictions for vetted partners.</p>
</div>

<h2 id="benchmarks">Benchmark Breakdown</h2>
<p>The numbers below are from Anthropic's official evaluation table. Every figure is verified against the published announcement.</p>
`;

const POST_HTML_PART2 = `
<h2 id="generational-leap">What Makes This a Generational Leap</h2>
<p>The numbers are impressive, but the more important shift is qualitative: Fable 5 can <strong>sustain focus across millions of tokens in long-running tasks</strong>. Previous Claude models degraded in quality mid-task. Fable 5 doesn't — it actively uses notes and memory to improve its outputs over time.</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;">
  <div style="background:#fff;border:1px solid #e4e3de;border-radius:10px;padding:22px 24px;">
    <div style="font-size:1.5rem;margin-bottom:10px;">🏗️</div>
    <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#0D0E11;">Months Compressed Into Days</div>
    <p style="font-size:0.88rem;color:#5A5C65;line-height:1.55;margin:0;">Stripe reported Fable 5 performed a codebase-wide migration across 50 million lines of Ruby in a single day — work that would take a whole engineering team over two months by hand.</p>
  </div>
  <div style="background:#fff;border:1px solid #e4e3de;border-radius:10px;padding:22px 24px;">
    <div style="font-size:1.5rem;margin-bottom:10px;">🎮</div>
    <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#0D0E11;">Vision-Only Game Completion</div>
    <p style="font-size:0.88rem;color:#5A5C65;line-height:1.55;margin:0;">Earlier Claude models needed complex helper harnesses with maps and navigation aids to play Pokémon FireRed. Fable 5 completed the entire game using raw vision screenshots alone — no maps, no game-state extras.</p>
  </div>
  <div style="background:#fff;border:1px solid #e4e3de;border-radius:10px;padding:22px 24px;">
    <div style="font-size:1.5rem;margin-bottom:10px;">🔬</div>
    <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#0D0E11;">Drug Design Acceleration</div>
    <p style="font-size:0.88rem;color:#5A5C65;line-height:1.55;margin:0;">Anthropic's internal protein design experts found Mythos 5 accelerated aspects of drug design by ~10x. The model autonomously chose binding sites, ran protein design tools, and recovered from failures — matching skilled human researchers.</p>
  </div>
  <div style="background:#fff;border:1px solid #e4e3de;border-radius:10px;padding:22px 24px;">
    <div style="font-size:1.5rem;margin-bottom:10px;">🧬</div>
    <div style="font-weight:700;font-size:0.95rem;margin-bottom:6px;color:#0D0E11;">Novel Scientific Hypotheses</div>
    <p style="font-size:0.88rem;color:#5A5C65;line-height:1.55;margin:0;">Mythos 5 is Anthropic's first model to consistently produce compelling novel scientific hypotheses. In blinded comparisons, scientists preferred Mythos 5's molecular biology hypotheses ~80% of the time over Opus-class models.</p>
  </div>
</div>

<blockquote style="border-left:4px solid #C9462A;background:#FBF0EC;padding:28px 32px;border-radius:0 6px 6px 0;margin:36px 0;">
  <p style="font-family:'Fraunces',Georgia,serif;font-size:1.3rem;font-style:italic;font-weight:300;color:#0D0E11;margin:0 0 10px;">"Fable 5 changed how we work on the Claude Code team day to day. We used to verify that Claude did the work right. Now we verify that it's doing the right work."</p>
  <cite style="font-size:0.82rem;color:#5A5C65;font-style:normal;">— Felix Rieseberg, Claude Code & Cowork Lead, Anthropic</cite>
</blockquote>

<h2 id="safety">The Safety Architecture</h2>
<p>The most technically interesting aspect of Fable 5 isn't the benchmarks — it's the safety architecture that makes public release possible. Anthropic built a <strong>classifier-based fallback system</strong>: when a request is flagged as touching cybersecurity, biology, chemistry, or model distillation, the response silently routes to Claude Opus 4.8 instead.</p>

<div class="wp-block-callout" style="background:#FFF8EC;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>⚠️ Fallback Mechanics:</strong> The fallback triggers in <strong>less than 5% of sessions on average</strong>, per Anthropic. Anthropic acknowledges these safeguards are tuned conservatively and will sometimes catch harmless requests. Users see the fallback in the UI and are billed at Opus 4.8 prices for those responses.</p>
</div>

<p>For Mythos 5, safeguards are selectively lifted for Project Glasswing partners (US government, critical infrastructure providers, and selected biology researchers). Mythos 5 is priced identically to Fable 5 at <strong>$10/M input tokens and $50/M output tokens</strong> — less than half the price of Mythos Preview.</p>

<h2 id="fable-vs-mythos">Fable 5 vs Mythos 5 — At a Glance</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;">
  <div style="background:#FBF0EC;border:1.5px solid #E8B5A8;border-radius:10px;padding:24px;">
    <h4 style="font-size:1rem;font-weight:700;margin-bottom:12px;color:#C9462A;">Claude Fable 5</h4>
    <ul style="list-style:none;padding:0;margin:0;">
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Available to all Pro, Max, Team & Enterprise users</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Auto-fallback to Opus 4.8 on high-risk queries</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ API model string: <code>claude-fable-5</code></li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Available on Claude.ai, API, Claude Code, AWS, GCP, Azure Foundry</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Free for subscribers until June 22, 2026</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;display:flex;gap:8px;">→ $10/M input · $50/M output (90% discount with prompt caching)</li>
    </ul>
  </div>
  <div style="background:#EBF1F8;border:1.5px solid #BDD4E9;border-radius:10px;padding:24px;">
    <h4 style="font-size:1rem;font-weight:700;margin-bottom:12px;color:#1E3A5F;">Claude Mythos 5</h4>
    <ul style="list-style:none;padding:0;margin:0;">
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Restricted to Project Glasswing partners</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ No cybersecurity / bio safeguard routing</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Strongest cybersecurity model in the world</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Available via Project Glasswing upgrade from Mythos Preview</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;border-bottom:1px solid rgba(0,0,0,0.07);display:flex;gap:8px;">→ Broader trusted-access program coming soon</li>
      <li style="font-size:0.88rem;color:#2C2D32;padding:5px 0;display:flex;gap:8px;">→ Same price as Fable 5; mandatory 30-day data retention for safety</li>
    </ul>
  </div>
</div>

<h2 id="industry-response">Industry Response</h2>
<p>Early partners were given access weeks ahead of the public launch. Their assessments:</p>
<p><strong>Cursor</strong> reported that Fable 5 is now state-of-the-art on CursorBench — scoring 72.9%, eight percentage points above the previous best — and described it as opening up "a class of long-horizon problems that were out of reach for earlier models."</p>
<p><strong>GitHub</strong> said Fable 5 handled complex, long-horizon coding tasks "with a level of autonomy and reliability that exceeded previous benchmarks" and sees it pointing toward a future where developers can hand increasingly ambitious work to agents and trust the results across the software lifecycle.</p>
<p><strong>Lovable</strong> integrated Fable 5 on launch day. <strong>Replit</strong> called it "a clear step forward on agentic coding and prototyping." Legal AI firm <strong>EvenUp</strong> noted in blind review its legal redlines matched or beat their current model every time.</p>

<h2 id="developers">What This Means for Developers</h2>
<p>If you're building on the Claude API, the most important practical changes are:</p>
<p><strong>Model string:</strong> Use <code>claude-fable-5</code>. The model is available in Claude Code via the <code>/model</code> command or by setting <code>model: claude-fable-5</code> in your <code>.claude/settings.json</code>.</p>
<p><strong>Agentic workflows:</strong> Feedback loops via <code>/goal</code> in Claude Code or Outcomes in Claude Managed Agents work identically to previous models. The key difference is Fable 5's dramatically improved ability to self-correct over extended task chains.</p>
<p><strong>Multi-agent orchestration:</strong> In Claude Managed Agents, Fable 5 can be used as the orchestrator, delegating subtasks to smaller (cheaper) models, with the full Mythos-class reasoning reserved for planning and synthesis.</p>
<p><strong>Cost:</strong> At $10/M input and $50/M output, Fable 5 is double the price of Claude Opus 4.8 — but prompt caching applies a 90% discount on cached tokens, which in long-context agentic tasks can bring effective costs below Opus pricing.</p>

<div class="wp-block-callout" style="background:#eef2ff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
  <p style="margin:0;"><strong>📌 Availability Note:</strong> Fable 5 is included at no extra charge for Pro, Max, Team, and Enterprise subscribers <strong>until June 22, 2026</strong>. After June 23, usage credits may be required until capacity expands. The Anthropic API supports Fable 5 immediately with standard consumption-based billing.</p>
</div>

<h2 id="bottom-line">Bottom Line</h2>
<p>Claude Fable 5 isn't an incremental update — it's a new capability tier. The model closes the gap between AI assistants and AI agents: it can take on tasks measured in days, not seconds, and stay reliable across them. The benchmark numbers are the most concrete evidence, but the qualitative shift (Stripe compressing months of engineering, Mythos 5 beating human scientists on drug design) is where the real story lives.</p>
<p>The safety architecture — fallback routing rather than capability reduction — is arguably Anthropic's most interesting engineering decision here. It lets them ship a Mythos-class model to the general public without waiting for perfect classifiers. It introduces new failure modes (false positives on legitimate queries), but the tradeoff buys access to the most capable publicly available AI model in the world, today.</p>
`;

const POST_TAGS = [
    'Claude Fable 5',
    'Claude Mythos 5',
    'Anthropic',
    'AI Benchmarks',
    'SWE-Bench Pro',
    'FrontierCode Diamond',
    'Agentic AI',
    'Claude Code',
    'AI Safety',
];
const POST_CATEGORIES = ['AI Chatbots', 'AI Tools'];
const editorialAuthor = getEditorialAuthor('rana-aqib');
const POST_AUTHOR = {
    name: editorialAuthor.name,
    role: editorialAuthor.role,
    bio: editorialAuthor.bio,
    avatar: editorialAuthor.avatar,
    slug: editorialAuthor.slug,
    socialLinks: editorialAuthor.socialLinks,
};

export default async function Fable5Mythos5Page() {
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

    const publishedDate = post?.publishedAt || post?.createdAt || new Date('2026-06-09');
    const readingTime = calculateReadingTime(combinedHtml);
    const internalLinks = post ? getInternalLinkRecommendations(post) : [];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }, { label: 'Claude Fable 5 & Mythos 5' }]} className="mb-8" />

                    <header className="max-w-4xl mx-auto mb-12">
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {POST_CATEGORIES.map((cat) => (
                                <Link key={cat} href={`/blog/?category=${encodeURIComponent(cat)}`} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition-colors">{cat}</Link>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                            <span className="px-3 py-1 bg-[#C9462A] rounded-full text-[10px] font-bold uppercase tracking-wider text-white">Claude Fable 5</span>
                            <span className="px-3 py-1 bg-[#1E3A5F] rounded-full text-[10px] font-bold uppercase tracking-wider text-white">Mythos 5</span>
                            <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700">June 9, 2026</span>
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6">
                            Anthropic&apos;s <em className="text-[#C9462A]">Mythos-class</em> Model — Finally Public
                        </h1>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            Claude Fable 5 is the first Mythos-class AI ever made generally available — setting new state-of-the-art records across agentic coding, scientific research, vision, cybersecurity, and autonomous knowledge work, while pairing unprecedented capability with novel safety guardrails.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 pb-6 border-b border-gray-200">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{POST_AUTHOR.name}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(publishedDate)}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readingTime} min read</span>
                        </div>
                    </header>

                    <AffiliateDisclosure />

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <SocialShare url={CURRENT_URL} title="Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model Goes Public" />
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
                                <div className="my-8 not-prose"><Fable5Chart /></div>
                                <div dangerouslySetInnerHTML={{ __html: parsedPart2 }} />
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
                                <SocialShare url={CURRENT_URL} title="Claude Fable 5 & Mythos 5 — Anthropic's Mythos-Class Model Goes Public" />
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
