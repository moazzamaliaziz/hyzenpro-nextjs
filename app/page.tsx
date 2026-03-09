import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ToolCard from '@/components/tools/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
import TweetCard from '@/components/social/TweetCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import NeuralGlobe from '@/components/ui/NeuralGlobe';
import {
    Terminal, Search, ArrowRight, Zap, Shield, Eye,
    BarChart3, Flame, Clock, Sparkles, LayoutGrid, CheckCircle2,
    Star, Users, TrendingUp, Globe
} from 'lucide-react';
import type { Metadata } from 'next';

/* ── SEO Metadata ─────────────────────────────────────── */
export const metadata: Metadata = {
    title: 'Simplifying AI for Everyone | HyzenPro',
    description: 'Looking for the best AI tools? Browse HyzenPro AI directory with real reviews, comparisons, and guides built for creators and marketers.',
    alternates: { canonical: 'https://hyzenpro.com' },
};

export const revalidate = 3600;

/* ── Default Social Proof Tweets (overridden by DB) ──── */
const DEFAULT_TWEETS = [
    {
        avatar: '',
        name: 'Sarah Chen',
        handle: 'sarahchen_ai',
        text: 'Just discovered @HyzenPro — finally, an AI tools directory that actually verifies every listing. The comparison engine alone saved me hours of research for our marketing stack.',
        date: 'Feb 28, 2026',
        likes: 234,
        retweets: 47,
    },
    {
        avatar: '',
        name: 'DevMike',
        handle: 'devmike_codes',
        text: 'HyzenPro is what Product Hunt should have been for AI tools. Every tool has real reviews, pricing breakdowns, and side-by-side comparisons. Bookmarked permanently. 🔥',
        date: 'Mar 2, 2026',
        likes: 182,
        retweets: 31,
    },
    {
        avatar: '',
        name: 'Priya Sharma',
        handle: 'priya_marketing',
        text: 'Used the HyzenPro comparison engine to evaluate 5 AI writing tools for our agency. The feature matrix is incredibly detailed. This is how every directory should work.',
        date: 'Mar 5, 2026',
        likes: 156,
        retweets: 28,
    },
];

/* ── Page Component ──────────────────────────────────── */
export default async function HomePage() {
    /* Data Fetching */
    const [featuredTools, trendingTools, latestPosts, toolCount, siteContent] = await Promise.all([
        prisma.tool.findMany({
            where: { status: 'published' },
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: { id: true, name: true, slug: true, shortDescription: true, logo: true, pricingType: true, rating: true, primaryCategory: true, featured: true },
        }),
        prisma.tool.findMany({
            where: { status: 'published' },
            orderBy: { views: 'desc' },
            take: 6,
            select: { id: true, name: true, slug: true, shortDescription: true, logo: true, pricingType: true, rating: true, primaryCategory: true, featured: true, views: true },
        }),
        prisma.post.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
            take: 3,
        }),
        prisma.tool.count({ where: { status: 'published' } }),
        prisma.siteContent.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    /* Parse editable content from DB */
    const getSection = (id: string) => siteContent.find(s => s.sectionId === id);
    const heroSection = getSection('hero');
    const socialSection = getSection('social-proof');
    const aboutSection = getSection('about');
    const ctaSection = getSection('cta');
    const compareSection = getSection('compare');

    const heroTitle = heroSection?.title || 'Simplifying AI for Everyone';
    const heroSubtitle = heroSection?.subtitle || 'Browse, compare, and choose the best AI tools with expert reviews, real comparisons, and practical guides — built for creators, marketers, and teams.';
    const tweets = (socialSection?.content as any)?.tweets || DEFAULT_TWEETS;

    // About Section Defaults
    const aboutTitle = aboutSection?.title || 'About HyzenPro';
    const aboutSubtitle = aboutSection?.subtitle || 'Your Trusted AI Resource';
    const aboutP1 = (aboutSection?.content as any)?.p1 || 'HyzenPro is an AI tools directory and review platform built to make smart choices easier. We research, test, and explain AI software using real use cases, not marketing hype. Each AI tool we review has a dedicated page with clear features, pricing insights, pros, cons, and practical guidance for real users.';
    const aboutP2 = (aboutSection?.content as any)?.p2 || 'Alongside tool pages, HyzenPro publishes in-depth blogs and comparison articles covering AI video editors, caption generators, content tools, and emerging AI SaaS platforms. Everything is written for creators, founders, and marketers who want reliable information, clear answers, and AI recommendations without wasting time or money.';

    const ctaTitle = ctaSection?.title || 'Build with the Best.';
    const ctaSubtitle = ctaSection?.subtitle || 'Are you building the next generation of AI tools? Index your platform on HyzenPro to reach thousands of decision-makers and developers daily.';

    // Compare Section Defaults
    const compareBadge = (compareSection?.content as any)?.badge || 'Advanced Feature';
    const compareTitle1 = compareSection?.title || 'Don\'t Guess.';
    const compareTitle2 = compareSection?.subtitle || 'Compare.';
    const compareP = (compareSection?.content as any)?.description || 'Select up to three tools from the directory to view a dynamic, side-by-side feature matrix. Compare APIs, token pricing, compliance, and execution speeds instantly.';
    const compareCta = (compareSection?.content as any)?.ctaText || 'Try Comparison Engine';

    const categories = [
        "AI Video Generators", "AI Writing Assistants", "AI Image Generators",
        "SEO Optimization", "Code Assistants", "Marketing Automation",
        "Audio & Voice", "Chatbots"
    ];

    /* JSON-LD Schema Markup */
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                name: 'HyzenPro',
                url: 'https://hyzenpro.com',
                description: 'The best AI tools directory with expert reviews, comparisons, and guides.',
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
                logo: 'https://hyzenpro.com/images/logo.png',
                sameAs: ['https://x.com/hyzenpro'],
            },
            {
                '@type': 'ItemList',
                name: 'Trending AI Tools',
                numberOfItems: trendingTools.length,
                itemListElement: trendingTools.map((tool, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: tool.name,
                    url: `https://hyzenpro.com/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}/`,
                })),
            },
        ],
    };

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen">
            <Header />

            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="overflow-hidden">

                {/* ═══ SECTION 1: HERO ═══════════════════════════════════ */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden" aria-label="Hero">
                    {/* 3D Animated AI Background */}
                    <NeuralGlobe />

                    <div className="container relative z-10 max-w-5xl text-center px-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 mb-8 mx-auto shadow-sm animate-fade-in-up">
                            <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
                                {toolCount}+ AI Tools Indexed
                            </span>
                        </div>

                        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter text-black dark:text-white mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            {heroTitle.split(' ').map((word, i) => {
                                const accentWords = ['AI', 'Everyone', 'Perfect', 'Best'];
                                return (
                                    <span key={i}>
                                        {accentWords.includes(word) ? (
                                            <span className="text-gray-500 dark:text-gray-400 italic font-light">{word}</span>
                                        ) : word}
                                        {' '}
                                    </span>
                                );
                            })}
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 text-balance mx-auto max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            {heroSubtitle}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <Link
                                href="/ai-tools-directory/"
                                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-2"
                            >
                                Browse AI Tools <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/compare/"
                                className="px-8 py-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 text-black dark:text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" /> Compare Tools
                            </Link>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            {[
                                { icon: Globe, label: 'AI Tools', value: toolCount, suffix: '+' },
                                { icon: Star, label: 'Expert Reviews', value: 50, suffix: '+' },
                                { icon: Users, label: 'Monthly Users', value: 12, suffix: 'K+' },
                                { icon: TrendingUp, label: 'Categories', value: 17, suffix: '' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <stat.icon className="w-5 h-5 text-black dark:text-white mx-auto mb-2" />
                                    <div className="font-heading text-3xl md:text-4xl text-black dark:text-white">
                                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 2: MARQUEE SOCIAL PROOF ════════════════ */}
                <section className="py-10 border-y border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center" aria-label="Trusted Partners">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">Trusted by industry leaders</p>
                    <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10" />
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10" />
                        <div className="flex w-[200%] animate-marquee">
                            {[0, 1].map(row => (
                                <div key={row} className="flex justify-around min-w-[50%] flex-shrink-0 items-center opacity-40 dark:opacity-30 grayscale gap-12 px-6">
                                    {['OPENAI', 'ANTHROPIC', 'MISTRAL', 'META LLaMA', 'MIDJOURNEY', 'RUNWAY'].map(name => (
                                        <div key={name} className="font-heading text-2xl tracking-wider text-black dark:text-white">{name}</div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 3: BENTO BOX — WHY HYZENPRO ═══════════ */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="why-heading">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 id="why-heading" className="font-heading text-4xl sm:text-5xl tracking-tight text-black dark:text-white mb-4">The Infrastructure for Decision Making</h2>
                        <p className="text-gray-500 dark:text-gray-400">Stop guessing which AI tool is right for your stack. HyzenPro provides the structural data you need to deploy with confidence.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-8 hover:shadow-[12px_12px_0px_#000] dark:hover:shadow-[12px_12px_0px_#fff] transition-all duration-300 group overflow-hidden relative">
                            <div className="relative z-10 max-w-sm">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <Shield className="w-5 h-5 text-black dark:text-white" />
                                </div>
                                <h3 className="font-heading text-2xl text-black dark:text-white mb-2">Verified & Indexed Data</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Every tool in our directory undergoes a rigorous verification process for pricing accuracy, compliance, and API reliability.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
                                <Terminal className="w-64 h-64 -mb-16 -mr-16 text-black dark:text-white" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-8 hover:shadow-[12px_12px_0px_#000] dark:hover:shadow-[12px_12px_0px_#fff] transition-all duration-300 group relative">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5 text-black dark:text-white" />
                            </div>
                            <h3 className="font-heading text-2xl text-black dark:text-white mb-2">Deep Analytics</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Track trending models globally and view sentiment analysis across verified user reviews before integrating.</p>
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 4: AD SLOT #1 ══════════════════════════ */}
                <div className="relative max-w-7xl mx-auto my-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl min-h-[90px] overflow-hidden">
                    <span className="text-xs text-gray-300 dark:text-gray-700 font-mono tracking-widest absolute z-0 pointer-events-none">AD SPONSORSHIP</span>
                    <div className="relative z-10 w-full">
                        <AdSlot slot="homepage-top" format="horizontal" className="!my-0" />
                    </div>
                </div>

                {/* ═══ SECTION 5: TRENDING TOOLS ══════════════════════ */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800 mt-8" aria-labelledby="trending-heading">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-black dark:text-white dark:text-black dark:text-white" />
                                <span className="font-heading text-2xl tracking-widest uppercase text-black dark:text-white">Trending Now</span>
                            </div>
                            <h2 id="trending-heading" className="font-heading text-4xl sm:text-5xl tracking-tight text-gray-400 dark:text-gray-500">Most Viewed Platforms</h2>
                        </div>
                        <Link href="/ai-tools-directory/" className="hidden md:flex items-center gap-2 text-sm font-semibold text-black dark:text-white hover:text-gray-500 dark:hover:text-gray-400 transition-colors border-b border-black dark:border-white pb-1">
                            View All Rankings <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingTools.map((tool, index) => (
                            <div key={tool.id} className="relative">
                                <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black/90 backdrop-blur-sm text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    <Flame className="w-3 h-3" />
                                    #{index + 1}
                                    <span className="mx-1 opacity-30">|</span>
                                    <Eye className="w-3 h-3" />
                                    {tool.views?.toLocaleString() || 0}
                                </div>
                                <ToolCard tool={tool} priority={index < 3} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ═══ SECTION 6: X/TWITTER SOCIAL PROOF ══════════════ */}
                <section className="py-24 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800" aria-labelledby="social-heading">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-6">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                What People Are Saying
                            </div>
                            <h2 id="social-heading" className="font-heading text-4xl sm:text-5xl tracking-tight text-black dark:text-white mb-4">Trusted by the Community</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Real feedback from creators, developers, and marketers who use HyzenPro to discover the best AI tools.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {tweets.map((tweet: any, i: number) => (
                                <TweetCard
                                    key={i}
                                    avatar={tweet.avatar || ''}
                                    name={tweet.name}
                                    handle={tweet.handle}
                                    text={tweet.text}
                                    date={tweet.date}
                                    likes={tweet.likes}
                                    retweets={tweet.retweets}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 7: CATEGORIES ══════════════════════════ */}
                <section className="py-24" aria-labelledby="categories-heading">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 id="categories-heading" className="font-heading text-3xl sm:text-4xl text-black dark:text-white mb-4">Explore the Ecosystem</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Navigate across precise categories to find exactly what you need.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                            {categories.map((cat, i) => (
                                <Link
                                    key={i}
                                    href="/ai-tools-directory/"
                                    className="px-6 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm font-semibold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 8: LATEST TOOLS ════════════════════════ */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="latest-heading">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 id="latest-heading" className="font-heading text-4xl sm:text-5xl tracking-tight text-black dark:text-white mb-2">Latest Additions</h2>
                            <p className="text-gray-500 dark:text-gray-400">Newly verified and indexed platforms.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <Link href="/ai-tools-directory/" className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Explore All Tools <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* ═══ SECTION 9: COMPARISON ENGINE SHOWCASE ══════════ */}
                <section className="py-24 bg-black text-white overflow-hidden relative" aria-labelledby="compare-heading">
                    <div className="absolute inset-0 bg-dot-pattern opacity-30" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest text-white mb-6">
                                    <BarChart3 className="w-4 h-4" />
                                    {compareBadge}
                                </div>
                                <h2 id="compare-heading" className="font-heading text-5xl md:text-7xl tracking-tight mb-6 leading-none text-gray-400">
                                    {compareTitle1}<br />
                                    <span className="text-white">{compareTitle2}</span>
                                </h2>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">
                                    {compareP}
                                </p>
                                <Link href="/compare/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(255,255,255,0.2)] border border-transparent hover:border-white transition-all duration-300">
                                    {compareCta}
                                </Link>
                            </div>

                            <div className="bg-gray-950 border border-gray-800 p-8 shadow-[16px_16px_0px_#fff] relative">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-6 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-none bg-black border border-gray-700 flex items-center justify-center">
                                            <span className="text-white font-heading">A</span>
                                        </div>
                                        <span className="font-semibold text-sm">ChatGPT Plus</span>
                                    </div>
                                    <span className="text-gray-600 text-sm italic font-mono">VS</span>
                                    <div className="flex items-center gap-2 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-none bg-gray-800 border border-gray-700 flex items-center justify-center">
                                            <span className="text-gray-400 font-heading">C</span>
                                        </div>
                                        <span className="font-semibold text-sm">Claude 3 Opus</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Coding Logic', a: '95%', b: '98%' },
                                        { label: 'Creative Writing', a: '88%', b: '94%' },
                                        { label: 'API Speed', a: '92%', b: '85%' },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-xs font-mono">
                                            <div className="flex justify-between text-gray-400 mb-1"><span>{stat.label}</span></div>
                                            <div className="flex gap-2 h-2 rounded-none overflow-hidden bg-gray-800">
                                                <div className="bg-white h-full rounded-none transition-all duration-1000" style={{ width: stat.a }} />
                                                <div className="bg-gray-500 h-full rounded-none transition-all duration-1000" style={{ width: stat.b }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 9.5: ABOUT HYZENPRO (Editable) ═════ */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden" aria-labelledby="about-heading">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-gray-100 dark:border-gray-900 rounded-full opacity-50 pointer-events-none -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-gray-100 dark:border-gray-900 rounded-full opacity-50 pointer-events-none -ml-20 -mb-20" />

                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
                        <div className="lg:col-span-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 dark:bg-black dark:bg-white/10 border border-gray-200 dark:border-gray-700 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-black dark:text-white dark:text-black dark:text-white mb-6">
                                <Shield className="w-3.5 h-3.5" />
                                {aboutSubtitle}
                            </div>
                            <h2 id="about-heading" className="font-heading text-5xl md:text-6xl tracking-tight text-black dark:text-white mb-6">
                                {aboutTitle}
                            </h2>
                            <div className="w-20 h-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full mb-8"></div>
                        </div>

                        <div className="lg:col-span-7 space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                            <p>{aboutP1}</p>
                            <p>{aboutP2}</p>

                            <div className="pt-4 flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-950 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold ${i === 1 ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                            {i === 1 ? <Users className="w-4 h-4" /> : null}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <div className="font-bold text-black dark:text-white">Built for Creators & Founders</div>
                                    <div className="text-gray-400">Join our growing community</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ SECTION 10: BLOG INSIGHTS ══════════════════════ */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800" aria-labelledby="blog-heading">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 id="blog-heading" className="font-heading text-4xl sm:text-5xl tracking-tight text-black dark:text-white mb-2">Intelligence & Insights</h2>
                            <p className="text-gray-500 dark:text-gray-400">Read our latest deep dives and industry analyses.</p>
                        </div>
                        <Link href="/blog/" className="hidden md:flex items-center gap-2 text-sm font-semibold text-black dark:text-white dark:text-black dark:text-white hover:text-indigo-800 dark:hover:text-black dark:text-white transition-colors border-b border-indigo-600 dark:border-indigo-400 pb-1">
                            Read All Articles <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {latestPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}/`} className="group flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-5 hover:border-black dark:hover:border-white hover:shadow-[8px_8px_0px_#000] dark:hover:shadow-[8px_8px_0px_#fff] transition-all duration-300">
                                {post.featuredImage && (
                                    <div className="relative w-full aspect-[4/3] rounded-none overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-4">
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 mt-auto">
                                    <Clock className="w-3 h-3" />
                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                </div>
                                <h3 className="font-heading text-2xl text-black dark:text-white group-hover:text-black dark:text-white dark:group-hover:text-black dark:text-white transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ═══ AD SLOT #2 ═════════════════════════════════════ */}
                <div className="relative max-w-7xl mx-auto mt-12 mb-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl min-h-[90px] overflow-hidden">
                    <span className="text-xs text-gray-300 dark:text-gray-700 font-mono tracking-widest absolute z-0 pointer-events-none">AD SPONSORSHIP</span>
                    <div className="relative z-10 w-full">
                        <AdSlot slot="homepage-bottom" format="horizontal" className="!my-0" />
                    </div>
                </div>

                {/* ═══ SECTION 11: FINAL CTA ══════════════════════════ */}
                <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" aria-label="Call to Action">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-black dark:bg-white text-white dark:text-black mb-8 relative border border-gray-800 dark:border-gray-200 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.1)]">
                        <Terminal className="w-8 h-8 relative z-10" />
                    </div>
                    <h2 className="font-heading text-5xl md:text-7xl tracking-tighter text-black dark:text-white mb-6">
                        {ctaTitle}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        {ctaSubtitle}
                    </p>
                    <Link href="/submit-ai-tool/" className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:hover:shadow-[6px_6px_0px_#fff] border border-transparent hover:border-black dark:hover:border-white transition-all duration-300">
                        Submit Your AI Tool <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}
