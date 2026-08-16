import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/HeroSection/HeroSection';
import ToolCard from '@/components/tools/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
import MatcherSpotlight from '@/components/quiz/MatcherSpotlight';
import PlatformLogos from '@/components/site/PlatformLogos';
import ToolLogo from '@/components/ui/ToolLogo';
import {
    ArrowRight, Zap, Shield, Eye,
    BarChart3, Flame, Clock,
    Star, Users, TrendingUp, Globe,
    Search, CheckCircle, Target, Sparkles,
    Video, PenLine, Code2, Workflow, ImageIcon,
    BookOpen, Check, ChevronDown,
    MessageSquare, Lightbulb, Lock, LifeBuoy,
    Camera, Megaphone, Rocket, GraduationCap, Building2
} from 'lucide-react';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const HomeCompare = dynamic(() => import('@/components/home/HomeCompare'));
const HomeFaq = dynamic(() => import('@/components/home/HomeFaq'));
const XEmbedRail = dynamic(() => import('@/components/social/XEmbedRail'));

function CompareSkeleton() {
    return (
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div className="space-y-4">
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="h-12 w-64 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-80 animate-pulse rounded bg-white/10" />
            </div>
            <div className="space-y-4">
                <div className="h-10 w-full animate-pulse rounded bg-white/10" />
                <div className="h-10 w-full animate-pulse rounded bg-white/10" />
                <div className="h-48 w-full animate-pulse rounded-xl bg-white/10" />
            </div>
        </div>
    );
}

function FaqSkeleton() {
    return (
        <div className="divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/5" />
                </div>
            ))}
        </div>
    );
}

/* ── SEO Metadata ─────────────────────────────────────── */
const siteUrl = 'https://hyzenpro.com';

export function generateMetadata(): Metadata {
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${siteUrl}/` : `${siteUrl}/${loc}/`;
    }
    languages['x-default'] = `${siteUrl}/`;

    return {
        title: 'Simplifying AI for Everyone | HyzenPro',
        description: 'Looking for the best AI tools? Browse HyzenPro AI directory with real reviews, comparisons, and guides built for creators and marketers.',
        alternates: { canonical: siteUrl, languages },
        openGraph: {
            url: siteUrl,
            title: 'Simplifying AI for Everyone | HyzenPro',
            description: 'Independent reviews and side-by-side comparisons of the best AI tools for creators, marketers, developers and small teams. Reader-funded — never pay-to-play.',
        },
    };
}

export const revalidate = 86400;

interface SocialTweet {
    tweetId?: string;
    tweetUrl: string;
    embedHtml?: string;
    sourceInput?: string;
    name?: string;
    handle?: string;
    text?: string;
    date?: string;
}

type RenderableTweet = SocialTweet & { tweetId: string; tweetUrl: string; embedHtml: string };

function isRenderableTweet(tweet: SocialTweet): tweet is RenderableTweet {
    return Boolean((tweet.tweetId || '').trim() && (tweet.tweetUrl || '').trim() && (tweet.embedHtml || '').trim());
}

const DEFAULT_TWEETS: RenderableTweet[] = [
    {
        tweetId: '2044849992196927496',
        name: 'Sabtain Ali',
        handle: 'sabtainali375',
        text: 'Independent community feedback about HyzenPro.',
        date: 'Verified on X',
        tweetUrl: 'https://x.com/sabtainali375/status/2044849992196927496',
        embedHtml: '<blockquote class="twitter-tweet"><a href="https://x.com/sabtainali375/status/2044849992196927496"></a></blockquote>',
    },
    {
        tweetId: '2044850464408428561',
        name: 'Moazzam Ali Aziz',
        handle: 'MoazzamAliaziz',
        text: 'Real user review shared on X.',
        date: 'Verified on X',
        tweetUrl: 'https://x.com/MoazzamAliaziz/status/2044850464408428561?s=20',
        embedHtml: '<blockquote class="twitter-tweet"><a href="https://x.com/MoazzamAliaziz/status/2044850464408428561"></a></blockquote>',
    },
];

const homeCategories = [
    { label: 'AI Video Tools', icon: Video, href: '/ai-tools-directory/ai-video-tools/' },
    { label: 'AI Writing Tools', icon: PenLine, href: '/ai-tools-directory/ai-writing-tools/' },
    { label: 'AI Coding Tools', icon: Code2, href: '/ai-tools-directory/ai-coding-tools/' },
    { label: 'AI Automation', icon: Workflow, href: '/ai-tools-directory/ai-automation-tools/' },
    { label: 'AI Image Tools', icon: ImageIcon, href: '/ai-tools-directory/ai-image-tools/' },
    { label: 'All Tools', icon: Sparkles, href: '/ai-tools-directory/' },
];

const reviewSteps = [
    { n: '01', t: 'Test', d: 'We use every tool on a real project for at least a week.' },
    { n: '02', t: 'Score', d: 'Pricing, UX, output quality, support — scored against peers.' },
    { n: '03', t: 'Publish', d: 'Honest verdict with pros, cons, and who it\'s actually for.' },
];

const scoreRubric = [
    { pct: 40, label: 'Output quality', desc: 'Accuracy, usefulness, consistency, and amount of cleanup required.', icon: Lightbulb },
    { pct: 20, label: 'Ease of use', desc: 'Setup time, interface clarity, workflow speed, and learning curve.', icon: BarChart3 },
    { pct: 20, label: 'Pricing value', desc: 'Free tier, paid-plan limits, upgrade pressure, and value versus alternatives.', icon: Workflow },
    { pct: 10, label: 'Feature depth', desc: 'Breadth of useful features, integrations, exports, and collaboration controls.', icon: LifeBuoy },
    { pct: 10, label: 'Support quality', desc: 'Documentation, help resources, onboarding, and response quality where available.', icon: Lock },
];

const useCaseData = [
    { role: 'Creators', title: 'Creators & YouTubers', desc: 'Captioning, editing, thumbnails and voiceovers — the stack that actually ships videos.', icon: Camera, color: 'bg-rose-50 text-rose-600' },
    { role: 'Marketing', title: 'Marketers & Growth', desc: 'From SEO writing to ad creative, find tools vetted on real campaigns, not demos.', icon: Megaphone, color: 'bg-amber-50 text-amber-600' },
    { role: 'Developers', title: 'Developers & Indie Hackers', desc: 'Coding copilots, agents, and dev tooling ranked on what they really cost at scale.', icon: Code2, color: 'bg-blue-50 text-blue-600' },
    { role: 'Founders', title: 'Founders & Small Teams', desc: 'Replace 3 SaaS subscriptions with 1 AI workflow — without lock-in surprises.', icon: Rocket, color: 'bg-emerald-50 text-emerald-600' },
    { role: 'Education', title: 'Students & Educators', desc: 'Free tiers, study companions, and writing aids that won\'t get you in trouble.', icon: GraduationCap, color: 'bg-violet-50 text-violet-600' },
    { role: 'Agencies', title: 'Agencies & Consultancies', desc: 'Client-safe tools with team plans, data controls, and proper export options.', icon: Building2, color: 'bg-orange-100 text-orange-800' },
];

const headToHeadData = [
    { a: { name: 'Claude Opus 4.8', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'Codex 5.5 Pro', abbr: 'OX', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/obkwbf7h_codex.webp' }, verdict: 'Agentic coding vs terminal-first workflows', slug: 'opus-4-8-vs-codex-5-5-pro' },
    { a: { name: 'Claude Sonnet 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'GLM-5.2', abbr: 'GL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/ww66jess_zai.webp' }, verdict: 'Near-flagship quality vs open-weight cost', slug: 'sonnet-5-vs-glm-5-2' },
    { a: { name: 'Claude Fable 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'Claude Mythos 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, verdict: 'Same weights, different access tiers', slug: 'claude-fable-5-vs-claude-mythos-5' },
];

const faqData = [
    { q: 'Is HyzenPro free to use?', a: 'Yes. Browsing reviews, comparisons, categories and guides is completely free. We\'re supported by tasteful advertising and an optional newsletter — never by paid rankings.' },
    { q: 'How do you decide which AI tools to review?', a: 'We track usage data, community signals, and vendor announcements. If a tool gains meaningful traction with creators or teams, it gets reviewed.' },
    { q: 'Do you accept paid placements or sponsorships?', a: 'No. Rankings cannot be bought. We accept clearly labeled display advertising to keep the site free, but no tool ever pays for a better ranking or review score. Editorial decisions are always independent.' },
    { q: 'How often are reviews updated?', a: 'Every tool is re-tested at least every 30 days. Price changes, feature updates, and regressions trigger immediate re-reviews.' },
    { q: 'Can I compare more than two tools at once?', a: 'Our side-by-side comparison supports two tools at a time. For broader comparisons, check our category roundups and buyer guides.' },
    { q: 'Who is behind HyzenPro?', a: 'An independent editorial team focused on AI tooling for creators, marketers, and small teams. We\'re reader-funded and ad-supported — never pay-to-play.' },
];

export default async function HomePage() {
    const [featuredTools, compareTools, latestPosts, toolCount, postCount, categoryCount, siteContent] = await Promise.all([
        prisma.tool.findMany({
            where: { status: 'published' },
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: { id: true, name: true, slug: true, shortDescription: true, logo: true, pricingType: true, rating: true, primaryCategory: true, featured: true },
        }),
        prisma.tool.findMany({
            where: { status: 'published' },
            orderBy: { rating: 'desc' },
            take: 30,
            select: { id: true, name: true, slug: true, shortDescription: true, logo: true, pricingType: true, rating: true, primaryCategory: true },
        }),
        prisma.post.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
            take: 4,
            select: { id: true, slug: true, title: true, excerpt: true, categories: true, featuredImage: true, publishedAt: true, createdAt: true },
        }),
        prisma.tool.count({ where: { status: 'published' } }),
        prisma.post.count({ where: { status: 'published' } }),
        prisma.category.count(),
        prisma.siteContent.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    const getSection = (id: string) => siteContent.find(s => s.sectionId === id);
    const socialSection = getSection('social-proof');

    const dbTweets = ((socialSection?.content as any)?.tweets as SocialTweet[] | undefined) || [];
    const tweets: RenderableTweet[] = dbTweets.filter(isRenderableTweet);
    const socialTweets: RenderableTweet[] = tweets.length > 0 ? tweets : DEFAULT_TWEETS;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'HyzenPro',
                url: 'https://hyzenpro.com',
                description: 'HyzenPro helps creators and teams compare AI tools with focused reviews, matchers, and practical buying guidance.',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://hyzenpro.com/ai-tools-directory/?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'Organization',
                name: 'HyzenPro',
                url: 'https://hyzenpro.com',
                logo: 'https://hyzenpro.com/images/logo.svg',
                sameAs: ['https://x.com/hyzenpro'],
            },
            {
                '@type': 'ItemList',
                name: 'Trending AI Tools',
                numberOfItems: 8,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Claude Sonnet 5', url: 'https://www.anthropic.com/claude' },
                    { '@type': 'ListItem', position: 2, name: 'Claude Opus 4.8', url: 'https://www.anthropic.com/claude' },
                    { '@type': 'ListItem', position: 3, name: 'Claude Fable 5 & Mythos 5', url: 'https://www.anthropic.com/claude' },
                    { '@type': 'ListItem', position: 4, name: 'GPT-5.6 Sol', url: 'https://openai.com/index/previewing-gpt-5-6-sol/' },
                    { '@type': 'ListItem', position: 5, name: 'Submagic', url: 'https://submagic.co/?via=techwavehub' },
                    { '@type': 'ListItem', position: 6, name: 'Sakana', url: 'https://sakana.ai/' },
                    { '@type': 'ListItem', position: 7, name: 'Kimi 2.6', url: 'https://www.kimi.com/en' },
                    { '@type': 'ListItem', position: 8, name: 'DeepSeek-V4', url: 'https://www.deepseek.com/en/' },
                ],
            },
        ],
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero + Trending on gradient background */}
            <div className="bg-noise relative bg-hero-gradient">
                <main id="main-content" tabIndex={-1}>
                    <HeroSection toolCount={toolCount} postCount={postCount} categoryCount={categoryCount} />

                    {/* ═══ TRENDING STRIP ═══════════════════════════════ */}
                    <section className="relative pb-24" aria-labelledby="trending-heading">
                        <div className="mx-auto mb-6 flex max-w-6xl items-end justify-between gap-4 px-6">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-foreground/50">Picks</p>
                                <h2 id="trending-heading" className="mt-1 font-serif text-3xl md:text-4xl">The AI tools getting real traction right now</h2>
                            </div>
                            <Link href="/ai-tools-directory/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">
                                All tools <ArrowRight className="inline h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="scroll-x-snap relative flex gap-3 overflow-x-auto px-6 pb-4 snap-x snap-mandatory md:gap-4 md:px-[calc((100vw-72rem)/2+1.5rem)]">
                            {[
                                { name: 'Claude Sonnet 5', category: 'AI Chatbot', href: 'https://www.anthropic.com/claude', logo: 'https://hyzenpro.com/images/tool-logos/claude.png', rating: '4.6' },
                                { name: 'Claude Opus 4.8', category: 'AI Chatbot', href: 'https://www.anthropic.com/claude', logo: 'https://hyzenpro.com/images/tool-logos/claude.png', rating: '4.9' },
                                { name: 'Claude Fable 5 & Mythos 5', category: 'Frontier AI', href: 'https://www.anthropic.com/claude', logo: 'https://hyzenpro.com/images/tool-logos/claude.png', rating: '4.8' },
                                { name: 'GPT-5.6 Sol', category: 'AI Chatbot', href: 'https://openai.com/index/previewing-gpt-5-6-sol/', logo: 'https://hyzenpro.com/images/tool-logos/chatgpt.png', rating: '4.7' },
                                { name: 'Submagic', category: 'Video Editing', href: 'https://submagic.co/?via=techwavehub', logo: 'https://hyzenpro.com/images/tool-logos/submagic.jpeg', rating: '4.5' },
                                { name: 'Sakana', category: 'Agentic AI', href: 'https://sakana.ai/', logo: 'https://sakana.ai/sakana-logo.png', rating: '4.4' },
                                { name: 'Kimi 2.6', category: 'AI Chatbot', href: 'https://www.kimi.com/en', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/01/pnkf8jxu_kimi.webp', rating: '4.5' },
                                { name: 'DeepSeek-V4', category: 'AI Coding', href: 'https://www.deepseek.com/en/', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/01/j5r4f44g_uk1znoj4-normal.jpg', rating: '4.6' },
                            ].map((tool) => (
                                <a
                                    key={tool.name}
                                    href={tool.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-foreground/10 bg-card p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:w-40 md:p-4"
                                >
                                    <div className="flex h-14 items-center justify-center md:h-16">
                                        <ToolLogo logo={tool.logo} name={tool.name} size="md" />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-1">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold md:text-sm">{tool.name}</p>
                                            <p className="truncate text-[10px] text-foreground/50 md:text-[11px]">{tool.category}</p>
                                        </div>
                                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium md:text-[11px]">
                                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500 md:h-3 md:w-3" /> {tool.rating}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* ═══ FEATURED PLATFORMS ═══════════════════════════════ */}
                    <PlatformLogos className="pb-24" />
                </main>
            </div>

            <AdSlot slot="homepage-top" format="horizontal" className="max-w-7xl mx-auto my-8" />

            {/* ═══ HOW WE REVIEW ═══════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="howwe-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">How we review</p>
                <h2 id="howwe-heading" className="mt-2 font-serif text-4xl md:text-5xl">No affiliate fluff. <span className="italic text-foreground/60">Just the truth.</span></h2>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {reviewSteps.map((s) => (
                        <div key={s.n} className="rounded-2xl border border-foreground/10 bg-card p-6">
                            <p className="font-serif text-3xl text-foreground/30">{s.n}</p>
                            <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                            <p className="mt-1 text-sm text-foreground/60">{s.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ SCORE RUBRIC ═══════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="rubric-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">The HyzenPro score</p>
                <h2 id="rubric-heading" className="mt-2 font-serif text-4xl md:text-5xl">Every tool is graded on the same <span className="italic text-foreground/60">five things.</span></h2>
                <p className="mt-4 max-w-2xl text-foreground/60">A weighted rubric, not vibes. Each AI tool earns a single 1–5 score made up of these five components, refreshed monthly so a stale review never gets a free pass.</p>
                <div className="mt-10 grid gap-4 md:grid-cols-5">
                    {scoreRubric.map((r) => (
                        <div key={r.label} className="rounded-2xl border border-foreground/10 bg-card p-5">
                            <div className="flex items-center gap-2">
                                <span className="font-serif text-3xl font-bold text-foreground/20">{r.pct}%</span>
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">{r.label}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-foreground/55">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ CATEGORIES ══════════════════════════════════════ */}
            <section id="categories" className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="categories-heading">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">Browse</p>
                        <h2 id="categories-heading" className="mt-2 font-serif text-4xl md:text-5xl">Pick your category.</h2>
                    </div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {homeCategories.map(({ label, icon: Icon, href }) => (
                        <Link
                            key={label}
                            href={href}
                            className="group flex flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-card p-5 text-left transition hover:border-foreground/30 hover:shadow-md"
                        >
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground/5 group-hover:bg-foreground/10">
                                <Icon className="h-5 w-5" />
                            </span>
                            <span className="font-medium">{label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ USE CASES ══════════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="usecases-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">Built for the way you work</p>
                <h2 id="usecases-heading" className="mt-2 font-serif text-4xl md:text-5xl">Whatever you ship — <span className="italic text-foreground/60">we&apos;ve tested the stack.</span></h2>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {useCaseData.map((uc) => (
                        <div key={uc.role} className="group rounded-2xl border border-foreground/10 bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${uc.color}`}>
                                <uc.icon className="h-3 w-3" /> {uc.role}
                            </span>
                            <h3 className="mt-4 font-serif text-2xl">{uc.title}</h3>
                            <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{uc.desc}</p>
                            <Link href="/ai-tools-directory/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:underline">
                                See picks <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ POPULAR HEAD-TO-HEADS ══════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="h2h-heading">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">Popular head-to-heads</p>
                        <h2 id="h2h-heading" className="mt-2 font-serif text-4xl md:text-5xl">Comparisons readers open <span className="italic text-foreground/60">every week.</span></h2>
                    </div>
                    <Link href="/compare/tools/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">Build your own <ArrowRight className="inline h-3.5 w-3.5" /></Link>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {headToHeadData.map((h, i) => (
                        <Link key={i} href={`/compare/${h.slug}/`} className="group rounded-2xl border border-foreground/10 bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center gap-3">
                                {h.a.logo ? (
                                    <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                                        <img src={h.a.logo} alt={h.a.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" loading="lazy" />
                                    </span>
                                ) : (
                                    <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-foreground/5 text-sm font-bold shrink-0">{h.a.abbr}</span>
                                )}
                                <span className="text-xs text-foreground/40">vs</span>
                                {h.b.logo ? (
                                    <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                                        <img src={h.b.logo} alt={h.b.name} className="w-8 h-8 sm:w-9 sm:h-9 object-contain" loading="lazy" />
                                    </span>
                                ) : (
                                    <span className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-xl bg-foreground/5 text-sm font-bold shrink-0">{h.b.abbr}</span>
                                )}
                            </div>
                            <p className="mt-3 text-sm font-semibold">{h.a.name} vs {h.b.name}</p>
                            <p className="mt-1 text-xs text-foreground/55">{h.verdict}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:underline">
                                Open side-by-side <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    ))}
                    <Link href="/compare/tools/" className="group rounded-2xl border border-dashed border-foreground/15 bg-card/50 p-5 transition hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[180px]">
                        <span className="text-2xl mb-2 text-foreground/30">+</span>
                        <p className="text-sm font-semibold text-foreground/70">Build your own comparison</p>
                        <p className="mt-1 text-xs text-foreground/45">Pick any two tools from our directory</p>
                    </Link>
                </div>
            </section>

            {/* ═══ COMPARE (Dark Section) ══════════════════════════ */}
            <section id="compare" className="relative overflow-hidden bg-foreground text-primary-foreground" aria-labelledby="compare-heading">
                <Suspense fallback={<CompareSkeleton />}>
                    <HomeCompare tools={compareTools} />
                </Suspense>
                <div className="px-6 pb-12 text-center">
                    <Link href="/compare/tools/" className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-6 py-3 text-sm font-medium text-foreground hover:opacity-90">
                        Try Comparison Engine <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ═══ EDITOR'S PICK ══════════════════════════════════ */}
            {featuredTools.length > 0 && (
                <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="editors-pick-heading">
                    <p className="text-xs uppercase tracking-widest text-foreground/50">Editor&apos;s pick</p>
                    <h2 id="editors-pick-heading" className="sr-only">Featured Tool</h2>
                    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.5fr]">
                        <div className="rounded-3xl border border-foreground/10 bg-card p-8">
                            <div className="flex h-32 items-center justify-center">
                                <ToolLogo logo={featuredTools[0].logo} name={featuredTools[0].name} size="xl" />
                            </div>
                            <h3 className="mt-6 font-serif text-3xl">{featuredTools[0].name}</h3>
                            <p className="mt-1 text-sm text-foreground/55">{featuredTools[0].primaryCategory?.replace(/-/g, ' ').replace('ai ', '')} · Rated {featuredTools[0].rating?.toFixed(1) || '—'} / 5</p>
                            <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{featuredTools[0].shortDescription || 'Independent review and side-by-side comparison available.'}</p>
                            <div className="mt-6 flex gap-3">
                                <Link href={`/ai-tools-directory/${featuredTools[0].primaryCategory || 'ai-general-tools'}/${featuredTools[0].slug}/`} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                                    Try {featuredTools[0].name} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/compare/tools/" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium hover:bg-foreground/5">
                                    Compare it
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-foreground/10 bg-card p-8">
                            <p className="text-xs uppercase tracking-widest text-foreground/50">From the editor&apos;s desk</p>
                            <blockquote className="mt-4 font-serif text-2xl leading-snug md:text-3xl">
                                &ldquo;Most AI tool roundups are affiliate landing pages in disguise. We built HyzenPro because creators kept asking us the same question privately — which tool is actually worth paying for this month? That&apos;s the only question we try to answer.&rdquo;
                            </blockquote>
                            <div className="mt-6 flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground/10 text-xs font-bold">AM</span>
                                <div>
                                    <p className="text-sm font-medium">Ali Malik — Founder & Lead Strategist</p>
                                    <p className="text-xs text-foreground/50">Turns fast-changing AI product categories into clearer buyer guidance.</p>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-foreground/10 pt-6">
                                {[
                                    { n: '120+', l: 'Hours of testing logged each month' },
                                    { n: '0', l: 'Paid placements accepted to date' },
                                    { n: '30d', l: 'Maximum age of any live review' },
                                    { n: '1:1', l: 'Independent editors per category' },
                                ].map((s) => (
                                    <div key={s.l}>
                                        <p className="font-serif text-2xl font-bold">{s.n}</p>
                                        <p className="text-xs text-foreground/50">{s.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ GUIDES (Blog Posts) ═════════════════════════════ */}
            <section id="guides" className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="guides-heading">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">Latest guides</p>
                        <h2 id="guides-heading" className="mt-2 font-serif text-4xl md:text-5xl">Long reads, no fluff.</h2>
                    </div>
                    <Link href="/blog/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">All guides <ArrowRight className="inline h-3.5 w-3.5" /></Link>
                </div>
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {latestPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}/`} className="group flex h-full flex-col rounded-2xl border border-foreground/10 bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
                            {post.featuredImage && (
                                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                                    <Image src={post.featuredImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground/5 px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                                <BookOpen className="h-3 w-3" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                            </span>
                            <h3 className="mt-4 font-serif text-2xl leading-tight">{post.title}</h3>
                            <span className="mt-auto pt-5 text-sm font-medium text-foreground/80 group-hover:underline">Read <ArrowRight className="inline h-3.5 w-3.5" /></span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ EDITORIAL CHANGELOG ════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="changelog-heading">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">Editorial changelog</p>
                        <h2 id="changelog-heading" className="mt-2 font-serif text-4xl md:text-5xl">What changed in the <span className="italic text-foreground/60">last 30 days.</span></h2>
                    </div>
                    <Link href="/blog/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">Get it weekly <ArrowRight className="inline h-3.5 w-3.5" /></Link>
                </div>
                <div className="mt-10 space-y-0 divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card">
                    {latestPosts.map((post, i) => {
                        const dateStr = post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '';
                        const category = post.categories?.[0]?.replace(/-/g, ' ').replace('ai ', '') || 'Guide';
                        return (
                            <Link key={post.id} href={`/blog/${post.slug}/`} className="flex gap-6 px-6 py-5 transition hover:bg-foreground/[0.02]">
                                <div className="shrink-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground/50">{dateStr}</p>
                                    <span className="mt-1 inline-flex rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/60">{category}</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-serif text-xl leading-snug">{post.title}</h3>
                                    <p className="mt-1 text-sm text-foreground/55 line-clamp-1">{post.excerpt || post.title}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ═══ QUIZ CTA ════════════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="quiz-heading">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-hero-gradient bg-noise p-10 text-center md:p-16">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-3 py-1 text-xs backdrop-blur">
                        <Zap className="h-3.5 w-3.5" /> 2-minute matcher
                    </div>
                    <h2 id="quiz-heading" className="mx-auto mt-6 max-w-2xl font-serif text-4xl md:text-6xl">
                        Not sure where to start?<br /><span className="italic text-foreground/70">Take the quiz.</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-foreground/60">
                        Answer 6 questions about your workflow. We&apos;ll shortlist 3 tools worth your time.
                    </p>
                    <Link href="/find-tools/" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                        Start the quiz <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ═══ STATS ═══════════════════════════════════════════ */}
            <section className="border-y border-foreground/10 bg-card" aria-labelledby="stats-heading">
                <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-foreground/10 px-6">
                    {[
                        { n: `${toolCount}+`, l: 'AI tools indexed' },
                        { n: `${postCount}+`, l: 'Guides published' },
                        { n: `${categoryCount}+`, l: 'Categories covered' },
                    ].map((s) => (
                        <div key={s.l} className="px-4 py-12 text-center md:py-16">
                            <p className="font-serif text-5xl md:text-7xl">{s.n}</p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-foreground/50">{s.l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ FAQ ══════════════════════════════════════════════ */}
            <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="faq-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">FAQ</p>
                <h2 id="faq-heading" className="mt-2 font-serif text-4xl md:text-5xl">Questions, <span className="italic text-foreground/60">answered honestly.</span></h2>
                <div className="mt-8">
                    <Suspense fallback={<FaqSkeleton />}>
                        <HomeFaq items={faqData} />
                    </Suspense>
                </div>
            </section>

            {/* ═══ NEWSLETTER ══════════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="newsletter-heading">
                <div className="grid items-center gap-8 rounded-3xl border border-foreground/10 bg-card p-8 md:grid-cols-2 md:p-12">
                    <div>
                        <h2 id="newsletter-heading" className="font-serif text-3xl md:text-4xl">One email. <span className="italic text-foreground/60">When it matters.</span></h2>
                        <p className="mt-3 text-sm text-foreground/60">A single weekly note with the one AI tool worth your attention. No spam, ever.</p>
                    </div>
                    <form className="flex gap-2">
                        <label htmlFor="homepage-newsletter" className="sr-only">Email address</label>
                        <input
                            id="homepage-newsletter"
                            type="email"
                            required
                            placeholder="you@email.com"
                            className="flex-1 rounded-full border border-foreground/15 bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                        >
                            Subscribe <Check className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </section>

            <AdSlot slot="homepage-bottom" format="horizontal" className="max-w-7xl mx-auto mt-12 mb-8" />

            <Footer />
        </div>

    );
}
