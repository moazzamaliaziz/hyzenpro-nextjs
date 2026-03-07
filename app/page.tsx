import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Search, Star, Users, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ToolCard from '@/components/tools/ToolCard';
import PostCard from '@/components/blog/PostCard';
import prisma from '@/lib/prisma';
import { getCategoryIcon } from '@/lib/utils';
import {
    generateOrganizationSchema,
    generateWebsiteSchema,
} from '@/lib/structured-data';

export const revalidate = 3600; // ISR: revalidate every hour

async function getData() {
    try {
        const [featuredTools, latestTools, categories, latestPosts] = await Promise.all([
            prisma.tool.findMany({
                where: { status: 'published', featured: true },
                take: 6,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.tool.findMany({
                where: { status: 'published' },
                take: 8,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.category.findMany({
                orderBy: { toolCount: 'desc' },
                take: 12,
            }),
            prisma.post.findMany({
                where: { status: 'published' },
                take: 6,
                orderBy: { publishedAt: 'desc' },
            }),
        ]);
        return { featuredTools, latestTools, categories, latestPosts };
    } catch {
        return { featuredTools: [], latestTools: [], categories: [], latestPosts: [] };
    }
}

export default async function HomePage() {
    const { featuredTools, latestTools, categories, latestPosts } = await getData();

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateOrganizationSchema()),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateWebsiteSchema()),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: 'HyzenPro - Best AI Tools Directory & Reviews',
                        description: 'Discover the best AI tools with expert reviews, detailed comparisons, and practical guidance.',
                        url: 'https://hyzenpro.com',
                    }),
                }}
            />

            <Header />

            <main>
                {/* ============ 1. HERO SECTION ============ */}
                <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.02)_1px,_transparent_1px)] bg-[length:32px_32px]" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                        <div className="text-center max-w-4xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-500 mb-8 animate-fade-in">
                                <Sparkles className="w-3.5 h-3.5 text-black" />
                                <span>Trusted by 10,000+ AI Professionals</span>
                            </div>

                            {/* Heading */}
                            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 animate-slide-up">
                                <span className="block text-black">DISCOVER</span>
                                <span className="block text-gray-200">THE BEST</span>
                                <span className="block text-black">AI TOOLS</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                Expert reviews, detailed comparisons, and practical guidance to find your perfect AI tool. Curated for creators, developers & businesses.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <Link
                                    href="/ai-tools-directory/"
                                    className="group flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all duration-300"
                                >
                                    <Search className="w-4 h-4" />
                                    Explore Tools
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/blog/"
                                    className="group flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-black text-black text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Read Reviews
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                {[
                                    { value: '50+', label: 'AI Tools', icon: Zap },
                                    { value: '18', label: 'Categories', icon: Search },
                                    { value: '30+', label: 'Reviews', icon: Star },
                                    { value: '10K+', label: 'Monthly Users', icon: Users },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <stat.icon className="w-5 h-5 text-black mx-auto mb-2" />
                                        <div className="font-heading text-3xl text-black">{stat.value}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ 2. CATEGORIES / TOPIC CLUSTERS ============ */}
                {categories.length > 0 && (
                    <section className="py-20 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">Browse by Category</span>
                                <h2 className="font-heading text-4xl md:text-5xl text-black mt-4">AI Tool Categories</h2>
                                <p className="text-gray-500 mt-3 max-w-lg mx-auto">Organized by use case to help you find exactly what you need.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {categories.map((cat: any) => (
                                    <Link
                                        key={cat.id}
                                        href={`/ai-tools-directory/${cat.slug}/`}
                                        className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300"
                                    >
                                        <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
                                        <span className="text-xs font-medium text-gray-600 group-hover:text-black text-center transition-colors leading-tight">
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold">{cat.toolCount} tools</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ============ 3. FEATURED AI TOOLS ============ */}
                {(featuredTools.length > 0 || latestTools.length > 0) && (
                    <section className="py-20 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">Curated Selection</span>
                                    <h2 className="font-heading text-4xl md:text-5xl text-black mt-4">
                                        {featuredTools.length > 0 ? 'Featured AI Tools' : 'Latest AI Tools'}
                                    </h2>
                                </div>
                                <Link
                                    href="/ai-tools-directory/"
                                    className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors font-medium"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(featuredTools.length > 0 ? featuredTools : latestTools).map((tool: any, i: number) => (
                                    <ToolCard key={tool.id} tool={tool} priority={i < 4} />
                                ))}
                            </div>

                            <div className="text-center mt-10 md:hidden">
                                <Link
                                    href="/ai-tools-directory/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg"
                                >
                                    View All Tools <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* ============ 4. LATEST BLOG POSTS ============ */}
                {latestPosts.length > 0 && (
                    <section className="py-20 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">From the Blog</span>
                                    <h2 className="font-heading text-4xl md:text-5xl text-black mt-4">Latest Articles</h2>
                                </div>
                                <Link
                                    href="/blog/"
                                    className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors font-medium"
                                >
                                    All Posts <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {latestPosts.map((post: any, i: number) => (
                                    <PostCard key={post.id} post={post} priority={i < 2} />
                                ))}
                            </div>

                            <div className="text-center mt-10 md:hidden">
                                <Link
                                    href="/blog/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg"
                                >
                                    All Articles <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* ============ 5. ABOUT / AUTHORITY SECTION ============ */}
                <section className="py-20 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">Why HyzenPro</span>
                            <h2 className="font-heading text-4xl md:text-5xl text-black mt-4">
                                Your Trusted AI Guide
                            </h2>
                            <p className="text-gray-500 mt-3 max-w-xl mx-auto">We personally test every tool we recommend. No sponsored rankings, no hidden agendas — just honest, expert analysis.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Shield,
                                    title: 'Honest Reviews',
                                    desc: 'Every tool is personally tested. No sponsored rankings — just honest, hands-on analysis you can trust.',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Always Updated',
                                    desc: 'AI moves fast. We keep our reviews and comparisons current so you never rely on outdated information.',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'Expert Curation',
                                    desc: 'We cut through the noise. Only tools that genuinely deliver value make it into our directory.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-8 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-5 group-hover:bg-gray-800 transition-colors">
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-heading text-2xl text-black mb-3">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ 6. CTA SECTION ============ */}
                <section className="py-20 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-black p-12 md:p-16 text-center">
                            {/* Subtle grid overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:24px_24px]" />
                            <div className="relative z-10">
                                <h2 className="font-heading text-4xl md:text-6xl text-white mb-4">
                                    Have an AI Tool?
                                </h2>
                                <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
                                    Submit your tool to get featured in our directory and reach thousands of potential users.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/submit-ai-tool/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-gray-100 transition-all duration-300"
                                    >
                                        Submit Your Tool <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/ai-tools-directory/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white/10 transition-all duration-300"
                                    >
                                        Browse Tools <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
