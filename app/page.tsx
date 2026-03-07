import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ToolCard from '@/components/tools/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
import {
    Terminal, Search, ArrowRight, Zap, Shield, Eye,
    BarChart3, Flame, Clock, Sparkles, LayoutGrid, CheckCircle2
} from 'lucide-react';

export const revalidate = 3600;

export default async function HomePage() {
    // 1. Fetch Top 6 Latest Tools for Directory Slice
    const featuredTools = await prisma.tool.findMany({
        where: {
            status: 'published',
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            logo: true,
            pricingType: true,
            rating: true,
            primaryCategory: true,
            featured: true
        }
    });

    // 2. Fetch Top 6 Most Viewed Tools for Trending Section
    const trendingTools = await prisma.tool.findMany({
        where: {
            status: 'published',
        },
        orderBy: { views: 'desc' },
        take: 6,
        select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            logo: true,
            pricingType: true,
            rating: true,
            primaryCategory: true,
            featured: true,
            views: true
        }
    });

    // 3. Fetch latest 3 blog posts
    const latestPosts = await prisma.post.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: 3,
    });

    const categories = [
        "AI Video Generators", "AI Writing Assistants", "AI Image Generators",
        "SEO Optimization", "Code Assistants", "Marketing Automation",
        "Audio & Voice", "Chatbots"
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />

            <main className="overflow-hidden">
                {/* 1. Hero Section (Vercel-inspired Command Palette Mockup) */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-gray-100 bg-grid-pattern">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-white pointer-events-none" />

                    <div className="container relative z-10 max-w-5xl text-center px-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-8 animate-fade-in-up">
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                            HyzenPro Directory 2.0
                        </div>

                        <h1 className="font-heading text-6xl md:text-8xl leading-[0.9] tracking-tighter text-black mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            Discover the <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">Perfect AI Layer.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 text-balance mx-auto max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            The enterprise-grade registry for modern AI tools. Search, compare, and integrate the world's most powerful models and applications into your workflow.
                        </p>

                        {/* Interactive Command Palette Mockup */}
                        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                <Search className="w-4 h-4 text-gray-400 mr-3" />
                                <div className="text-sm font-mono text-gray-400 flex-1 text-left">Find tools, categories, or comparisons...</div>
                                <div className="flex gap-1.5">
                                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold shadow-sm">⌘</kbd>
                                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold shadow-sm">K</kbd>
                                </div>
                            </div>
                            <div className="bg-white p-2">
                                <Link href="/ai-tools-directory/" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <LayoutGrid className="w-4 h-4 text-black" />
                                        </div>
                                        <div className="text-sm font-medium text-black">Browse AI Directory</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                </Link>
                                <Link href="/compare/" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                                            <Zap className="w-4 h-4 text-black" />
                                        </div>
                                        <div className="text-sm font-medium text-black">Compare Models (GPT-4 vs Claude 3)</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Infinite Marquee (Social Proof) */}
                <section className="py-14 border-b border-gray-100 overflow-hidden bg-gray-50/50 flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by industry leaders</p>
                    <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
                        {/* Optional Gradient Fades for edges */}
                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent z-10" />
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent z-10" />

                        <div className="flex w-[200%] animate-marquee">
                            <div className="flex justify-around min-w-[50%] flex-shrink-0 items-center opacity-40 grayscale gap-12 px-6">
                                <div className="font-heading text-2xl tracking-wider">OPENAI</div>
                                <div className="font-heading text-2xl tracking-wider">ANTHROPIC</div>
                                <div className="font-heading text-2xl tracking-wider">MISTRAL</div>
                                <div className="font-heading text-2xl tracking-wider">META LLaMA</div>
                                <div className="font-heading text-2xl tracking-wider">MIDJOURNEY</div>
                                <div className="font-heading text-2xl tracking-wider">RUNWAY</div>
                            </div>
                            <div className="flex justify-around min-w-[50%] flex-shrink-0 items-center opacity-40 grayscale gap-12 px-6">
                                <div className="font-heading text-2xl tracking-wider">OPENAI</div>
                                <div className="font-heading text-2xl tracking-wider">ANTHROPIC</div>
                                <div className="font-heading text-2xl tracking-wider">MISTRAL</div>
                                <div className="font-heading text-2xl tracking-wider">META LLaMA</div>
                                <div className="font-heading text-2xl tracking-wider">MIDJOURNEY</div>
                                <div className="font-heading text-2xl tracking-wider">RUNWAY</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. The "Platform Vetted" Bento Box */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-black mb-4">The Infrastructure for Decision Making</h2>
                        <p className="text-gray-500">Stop guessing which AI tool is right for your stack. HyzenPro provides the structural data you need to deploy with confidence.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="md:col-span-2 bg-gradient-to-tr from-gray-50/50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 transition-all duration-500 group overflow-hidden relative">
                            <div className="relative z-10 max-w-sm">
                                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <Shield className="w-5 h-5 text-black" />
                                </div>
                                <h3 className="font-heading text-2xl text-black mb-2">Verified & Indexed Data</h3>
                                <p className="text-gray-500 text-sm">Every tool in our directory undergoes a rigorous 5-point verification process for pricing accuracy, SOC2 compliance, and API reliability.</p>
                            </div>
                            {/* Decorative background visual */}
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Terminal className="w-64 h-64 -mb-16 -mr-16 text-black" />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 transition-all duration-500 group relative">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="font-heading text-2xl text-black mb-2">Deep Analytics</h3>
                            <p className="text-gray-500 text-sm">Track trending models globally and view sentiment analysis across verified user reviews before integrating.</p>
                        </div>
                    </div>
                </section>

                {/* 4. AdSense Slot #1 (Top Tier Native) */}
                <div className="relative max-w-7xl mx-auto my-8 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl min-h-[90px] overflow-hidden">
                    <span className="text-xs text-gray-300 font-mono tracking-widest absolute z-0 pointer-events-none">AD SPONSORSHIP</span>
                    <div className="relative z-10 w-full">
                        <AdSlot slot="homepage-top" format="horizontal" className="!my-0" />
                    </div>
                </div>

                {/* 5. Trending Tracker (Most Viewed AI Tools) */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-100 mt-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-black" />
                                <span className="font-heading text-2xl tracking-widest uppercase text-black">Trending Now</span>
                            </div>
                            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-gray-400">Most Viewed Platforms</h2>
                        </div>
                        <Link href="/ai-tools-directory/" className="hidden md:flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-600 transition-colors border-b border-black pb-1">
                            View All Rankings <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingTools.map((tool, index) => (
                            <div key={tool.id} className="relative">
                                <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-sm text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
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

                {/* 6. The Category Matrix (Interactive Tags) */}
                <section className="py-24 bg-gray-50 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-3xl sm:text-4xl text-black mb-4">Explore the Ecosystem</h2>
                            <p className="text-gray-500 text-sm">Navigate over 50+ precise categories.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                            {categories.map((cat, i) => (
                                <Link
                                    key={i}
                                    href={`/ai-tools-directory/`}
                                    className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-black hover:border-black hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Directory Slice (Grid) */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-black mb-2">Latest Additions</h2>
                            <p className="text-gray-500">Newly verified and indexed platforms.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>

                    <div className="mt-12 text-center md:hidden">
                        <Link href="/ai-tools-directory/" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg">
                            Explore All Tools <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* 8. Comparison Interface Showcase */}
                <section className="py-24 bg-black text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-dot-pattern opacity-30" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-6">
                                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                                    Advanced Feature
                                </div>
                                <h2 className="font-heading text-5xl md:text-7xl tracking-tight mb-6 leading-none">
                                    Don't Guess.<br />
                                    <span className="text-gray-500">Compare.</span>
                                </h2>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">
                                    Select up to three tools from the directory to view a dynamic, side-by-side feature matrix. Compare APIs, token pricing, compliance, and execution speeds instantly.
                                </p>
                                <Link href="/compare/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-gray-100 transition-colors">
                                    Try Comparison Engine
                                </Link>
                            </div>

                            {/* Abstract Mockup UI */}
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl relative animate-pulse-glow">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                            <span className="text-emerald-400 font-heading">A</span>
                                        </div>
                                        <span className="font-semibold text-sm">ChatGPT Plus</span>
                                    </div>
                                    <span className="text-gray-600 text-sm italic font-mono">VS</span>
                                    <div className="flex items-center gap-2 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                            <span className="text-amber-400 font-heading">C</span>
                                        </div>
                                        <span className="font-semibold text-sm">Claude 3 Opus</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'Coding Logic', a: '95%', b: '98%', aC: 'bg-emerald-500', bC: 'bg-amber-500' },
                                        { label: 'Creative Writing', a: '88%', b: '94%', aC: 'bg-emerald-500', bC: 'bg-amber-500' },
                                        { label: 'API Speed', a: '92%', b: '85%', aC: 'bg-emerald-500', bC: 'bg-amber-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="text-xs font-mono">
                                            <div className="flex justify-between text-gray-400 mb-1">
                                                <span>{stat.label}</span>
                                            </div>
                                            <div className="flex gap-4 h-2 rounded-full overflow-hidden bg-gray-800">
                                                <div className={`${stat.aC} h-full`} style={{ width: stat.a }} />
                                                <div className={`${stat.bC} h-full`} style={{ width: stat.b }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. Insights from the Blog */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-black mb-2">Intelligence & Insights</h2>
                            <p className="text-gray-500">Read our latest deep dives and industry analyses.</p>
                        </div>
                        <Link href="/blog/" className="hidden md:flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-600 transition-colors border-b border-black pb-1">
                            Read All Articles <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {latestPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}/`} className="group flex flex-col">
                                {post.featuredImage && (
                                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 mb-4">
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 mt-auto">
                                    <Clock className="w-3 h-3" />
                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                </div>
                                <h3 className="font-heading text-2xl text-black group-hover:text-gray-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 10. Developer / CTA Footer & AdSlot 2 */}
                <div className="relative max-w-7xl mx-auto mt-12 mb-8 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl min-h-[90px] overflow-hidden">
                    <span className="text-xs text-gray-300 font-mono tracking-widest absolute z-0 pointer-events-none">AD SPONSORSHIP</span>
                    <div className="relative z-10 w-full">
                        <AdSlot slot="homepage-bottom" format="horizontal" className="!my-0" />
                    </div>
                </div>

                <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white mb-8 relative">
                        <div className="absolute inset-0 bg-black rounded-2xl animate-pulse-glow" />
                        <Terminal className="w-8 h-8 relative z-10" />
                    </div>
                    <h2 className="font-heading text-5xl md:text-7xl tracking-tighter text-black mb-6">
                        Build with the Best.
                    </h2>
                    <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
                        Are you building the next generation of AI tools? Index your platform on HyzenPro to reach thousands of enterprise decision-makers and developers daily.
                    </p>
                    <Link href="/submit-ai-tool/" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-all">
                        Submit Your API or Tool <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}
