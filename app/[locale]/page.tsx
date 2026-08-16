import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import prisma from '@/lib/prisma';
import Footer from '@/components/layout/Footer';
import ToolCard from '@/components/tools/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
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
import { getAlternateLinks } from '@/lib/locale-helpers';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export const revalidate = 86400;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/');

    return {
        alternates: { canonical, languages },
    };
}

const homeCategories = [
    { key: 'video', icon: Video, href: '/ai-tools-directory/ai-video-tools/' },
    { key: 'writing', icon: PenLine, href: '/ai-tools-directory/ai-writing-tools/' },
    { key: 'coding', icon: Code2, href: '/ai-tools-directory/ai-coding-tools/' },
    { key: 'automation', icon: Workflow, href: '/ai-tools-directory/ai-automation-tools/' },
    { key: 'image', icon: ImageIcon, href: '/ai-tools-directory/ai-image-tools/' },
    { key: 'all', icon: Sparkles, href: '/ai-tools-directory/' },
];

const reviewSteps = [
    { n: '01', key: 'test' },
    { n: '02', key: 'score' },
    { n: '03', key: 'publish' },
];

const scoreRubric = [
    { pct: 40, key: 'output', icon: Lightbulb },
    { pct: 20, key: 'ease', icon: BarChart3 },
    { pct: 20, key: 'pricing', icon: Workflow },
    { pct: 10, key: 'features', icon: LifeBuoy },
    { pct: 10, key: 'support', icon: Lock },
];

const useCaseData = [
    { key: 'creators', icon: Camera, color: 'bg-rose-50 text-rose-600' },
    { key: 'marketing', icon: Megaphone, color: 'bg-amber-50 text-amber-600' },
    { key: 'developers', icon: Code2, color: 'bg-blue-50 text-blue-600' },
    { key: 'founders', icon: Rocket, color: 'bg-emerald-50 text-emerald-600' },
    { key: 'education', icon: GraduationCap, color: 'bg-violet-50 text-violet-600' },
    { key: 'agencies', icon: Building2, color: 'bg-orange-100 text-orange-800' },
];

const headToHeadData = [
    { a: { name: 'Claude Opus 4.8', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'Codex 5.5 Pro', abbr: 'OX', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/obkwbf7h_codex.webp' }, verdict_key: 'opus_vs_codex', slug: 'opus-4-8-vs-codex-5-5-pro' },
    { a: { name: 'Claude Sonnet 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'GLM-5.2', abbr: 'GL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/ww66jess_zai.webp' }, verdict_key: 'sonnet_vs_glm', slug: 'sonnet-5-vs-glm-5-2' },
    { a: { name: 'Claude Fable 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, b: { name: 'Claude Mythos 5', abbr: 'CL', logo: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/05/5f5i07t8_claude.webp' }, verdict_key: 'fable_vs_mythos', slug: 'claude-fable-5-vs-claude-mythos-5' },
];

export default async function LocaleHomePage({
    params,
}: {
    params: Promise<{locale: string}>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [featuredTools, latestPosts, toolCount, postCount, categoryCount] = await Promise.all([
        prisma.tool.findMany({
            where: { status: 'published' },
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: { id: true, name: true, slug: true, shortDescription: true, logo: true, pricingType: true, rating: true, primaryCategory: true, featured: true },
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
    ]);

    return <TranslatedHomeContent
        locale={locale}
        featuredTools={featuredTools}
        latestPosts={latestPosts}
        toolCount={toolCount}
        postCount={postCount}
        categoryCount={categoryCount}
    />;
}

function TranslatedHomeContent({
    locale,
    featuredTools,
    latestPosts,
    toolCount,
    postCount,
    categoryCount,
}: {
    locale: string;
    featuredTools: any[];
    latestPosts: any[];
    toolCount: number;
    postCount: number;
    categoryCount: number;
}) {
    const t = useTranslations('homepage');
    const tc = useTranslations('common');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'HyzenPro',
                url: 'https://hyzenpro.com',
                description: t('hero_subtitle'),
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
        ],
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="bg-noise relative bg-hero-gradient">
                <main id="main-content" tabIndex={-1}>
                    <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
                        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl">{t('hero_title')}</h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/60">{t('hero_subtitle')}</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link href="/ai-tools-directory/" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                                {t('browse_categories')} <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/find-tools/" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-6 py-3 text-sm font-medium hover:bg-foreground/5">
                                <Zap className="h-4 w-4" /> {t('quiz_button')}
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-foreground/40">{toolCount}+ {tc('all_tools').toLowerCase()}</p>
                    </section>

                    <section className="relative pb-24" aria-labelledby="trending-heading">
                        <div className="mx-auto mb-6 flex max-w-6xl items-end justify-between gap-4 px-6">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-foreground/50">{t('trending')}</p>
                                <h2 id="trending-heading" className="mt-1 font-serif text-3xl md:text-4xl">{t('hero_title')}</h2>
                            </div>
                            <Link href="/ai-tools-directory/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">
                                {tc('all_tools')} <ArrowRight className="inline h-3.5 w-3.5" />
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
                </main>
            </div>

            <AdSlot slot="homepage-top" format="horizontal" className="max-w-7xl mx-auto my-8" />

            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="howwe-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">{t('how_we_review')}</p>
                <h2 id="howwe-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('no_fluff')}</h2>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {reviewSteps.map((s) => (
                        <div key={s.n} className="rounded-2xl border border-foreground/10 bg-card p-6">
                            <p className="font-serif text-3xl text-foreground/30">{s.n}</p>
                            <h3 className="mt-2 text-lg font-semibold">{t(`review_steps.${s.key}.title`)}</h3>
                            <p className="mt-1 text-sm text-foreground/60">{t(`review_steps.${s.key}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="categories" className="mx-auto max-w-6xl px-6 py-12" aria-labelledby="categories-heading">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">{t('categories')}</p>
                        <h2 id="categories-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('pick_category')}</h2>
                    </div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {homeCategories.map(({ key, icon: Icon, href }) => (
                        <Link
                            key={key}
                            href={href}
                            className="group flex flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-card p-5 text-left transition hover:border-foreground/30 hover:shadow-md"
                        >
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground/5 group-hover:bg-foreground/10">
                                <Icon className="h-5 w-5" />
                            </span>
                            <span className="font-medium">{t(`category_names.${key}`)}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="usecases-heading">
                <h2 id="usecases-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('use_cases_title')}</h2>
                <p className="mt-4 text-foreground/60">{t('use_cases_subtitle')}</p>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {useCaseData.map((uc) => (
                        <div key={uc.key} className="group rounded-2xl border border-foreground/10 bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${uc.color}`}>
                                <uc.icon className="h-3 w-3" /> {t(`use_cases.${uc.key}.role`)}
                            </span>
                            <h3 className="mt-4 font-serif text-2xl">{t(`use_cases.${uc.key}.title`)}</h3>
                            <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{t(`use_cases.${uc.key}.desc`)}</p>
                            <Link href="/ai-tools-directory/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:underline">
                                {tc('see_picks')} <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="h2h-heading">
                <div>
                    <p className="text-xs uppercase tracking-widest text-foreground/50">{t('head_to_head')}</p>
                    <h2 id="h2h-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('head_to_head')}</h2>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {headToHeadData.map((h, i) => (
                        <Link key={i} href={`/compare/${h.slug}/`} className="group rounded-2xl border border-foreground/10 bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center gap-3">
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                                    <img src={h.a.logo} alt={h.a.name} className="w-8 h-8 object-contain" loading="lazy" />
                                </span>
                                <span className="text-xs text-foreground/40">{tc('vs')}</span>
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                                    <img src={h.b.logo} alt={h.b.name} className="w-8 h-8 object-contain" loading="lazy" />
                                </span>
                            </div>
                            <p className="mt-3 text-sm font-semibold">{h.a.name} vs {h.b.name}</p>
                            <p className="mt-1 text-xs text-foreground/55">{t(`h2h_verdicts.${h.verdict_key}`)}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:underline">
                                {tc('open_comparison')} <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {featuredTools.length > 0 && (
                <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="editors-pick-heading">
                    <p className="text-xs uppercase tracking-widest text-foreground/50">{t('editors_pick')}</p>
                    <h2 id="editors-pick-heading" className="sr-only">{t('editors_pick')}</h2>
                    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.5fr]">
                        <div className="rounded-3xl border border-foreground/10 bg-card p-8">
                            <div className="flex h-32 items-center justify-center">
                                <ToolLogo logo={featuredTools[0].logo} name={featuredTools[0].name} size="xl" />
                            </div>
                            <h3 className="mt-6 font-serif text-3xl">{featuredTools[0].name}</h3>
                            <p className="mt-1 text-sm text-foreground/55">{featuredTools[0].primaryCategory?.replace(/-/g, ' ').replace('ai ', '')} · Rated {featuredTools[0].rating?.toFixed(1) || '—'} / 5</p>
                            <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{featuredTools[0].shortDescription || ''}</p>
                            <div className="mt-6 flex gap-3">
                                <Link href={`/ai-tools-directory/${featuredTools[0].primaryCategory || 'ai-general-tools'}/${featuredTools[0].slug}/`} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                                    {tc('visit')} {featuredTools[0].name} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/compare/tools/" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium hover:bg-foreground/5">
                                    {tc('vs')} {tc('build_own').toLowerCase()}
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-foreground/10 bg-card p-8">
                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-foreground/10 pt-6">
                                {[
                                    { n: `${toolCount}+`, l: tc('all_tools') },
                                    { n: `${postCount}+`, l: t('stats_guides') },
                                    { n: `${categoryCount}+`, l: t('stats_categories') },
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

            <section id="guides" className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="guides-heading">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">{t('latest_guides')}</p>
                        <h2 id="guides-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('long_reads')}</h2>
                    </div>
                    <Link href="/blog/" className="hidden text-sm text-foreground/70 underline-offset-4 hover:underline md:inline">{tc('view_all')} <ArrowRight className="inline h-3.5 w-3.5" /></Link>
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
                            <span className="mt-auto pt-5 text-sm font-medium text-foreground/80 group-hover:underline">{tc('read_more')} <ArrowRight className="inline h-3.5 w-3.5" /></span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="changelog-heading">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/50">{t('changelog')}</p>
                        <h2 id="changelog-heading" className="mt-2 font-serif text-4xl md:text-5xl">{t('last_30_days')}</h2>
                    </div>
                </div>
                <div className="mt-10 space-y-0 divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card">
                    {latestPosts.map((post) => {
                        const dateStr = post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
                            : '';
                        return (
                            <Link key={post.id} href={`/blog/${post.slug}/`} className="flex gap-6 px-6 py-5 transition hover:bg-foreground/[0.02]">
                                <div className="shrink-0 pt-0.5">
                                    <p className="text-xs font-medium text-foreground/50">{dateStr}</p>
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

            <section className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="quiz-heading">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-hero-gradient bg-noise p-10 text-center md:p-16">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-3 py-1 text-xs backdrop-blur">
                        <Zap className="h-3.5 w-3.5" /> 2-min quiz
                    </div>
                    <h2 id="quiz-heading" className="mx-auto mt-6 max-w-2xl font-serif text-4xl md:text-6xl">
                        {t('quiz_cta')}
                    </h2>
                    <Link href="/find-tools/" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
                        {t('quiz_button')} <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            <section className="border-y border-foreground/10 bg-card" aria-labelledby="stats-heading">
                <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-foreground/10 px-6">
                    {[
                        { n: `${toolCount}+`, l: t('stats_tools') },
                        { n: `${postCount}+`, l: t('stats_guides') },
                        { n: `${categoryCount}+`, l: t('stats_categories') },
                    ].map((s) => (
                        <div key={s.l} className="px-4 py-12 text-center md:py-16">
                            <p className="font-serif text-5xl md:text-7xl">{s.n}</p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-foreground/50">{s.l}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="newsletter-heading">
                <div className="grid items-center gap-8 rounded-3xl border border-foreground/10 bg-card p-8 md:grid-cols-2 md:p-12">
                    <div>
                        <h2 id="newsletter-heading" className="font-serif text-3xl md:text-4xl">{t('newsletter_title')}</h2>
                        <p className="mt-3 text-sm text-foreground/60">{t('newsletter_subtitle')}</p>
                    </div>
                    <form className="flex gap-2">
                        <label htmlFor="locale-newsletter" className="sr-only">{t('email_placeholder')}</label>
                        <input
                            id="locale-newsletter"
                            type="email"
                            required
                            placeholder={t('email_placeholder')}
                            className="flex-1 rounded-full border border-foreground/15 bg-background px-5 py-3 text-sm outline-none focus:border-foreground/40"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                        >
                            {tc('subscribe')} <Check className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </section>

            <AdSlot slot="homepage-bottom" format="horizontal" className="max-w-7xl mx-auto mt-12 mb-8" />

            <Footer />
        </div>
    );
}
