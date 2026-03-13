import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import VendorDashboard from '@/components/vendor/VendorDashboard';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import {
    ArrowRight, Shield, BarChart3, Users, Zap, Eye, Rocket, Star,
    CheckCircle2, Globe
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Submit Your AI Tool — Get Listed on HyzenPro\'s AI Directory | Free',
    description: 'Submit your AI tool to HyzenPro\'s curated directory. Reach thousands of decision-makers, developers, and creators searching for the best AI software. Free listing with premium upgrade options.',
    keywords: [
        'submit ai tool', 'list ai tool', 'ai tool directory listing', 'ai software submission',
        'promote ai tool', 'ai startup directory', 'ai tool vendor', 'get listed ai directory',
    ],
    openGraph: {
        title: 'Submit Your AI Tool — HyzenPro Directory',
        description: 'Get your AI platform in front of thousands of qualified buyers. Free listing available.',
        type: 'website',
    },
    alternates: {
        canonical: '/vendor/',
    },
};

async function getStats() {
    try {
        const [toolsCount, totalViews] = await Promise.all([
            prisma.tool.count({ where: { status: 'published' } }),
            prisma.tool.aggregate({ _sum: { views: true } }),
        ]);
        return { toolsCount, totalViews: totalViews._sum.views || 0 };
    } catch {
        return { toolsCount: 100, totalViews: 50000 };
    }
}

export default async function VendorPage() {
    const session = await auth();
    const stats = await getStats();
    const isLoggedIn = !!session?.user;

    const breadcrumbs = [
        { label: 'Vendor Portal' },
    ];

    const schemaBreadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Vendor Portal', url: '/vendor/' },
    ];

    return (
        <>
            {/* If logged in, show full dashboard mode */}
            {isLoggedIn ? (
                <VendorDashboard />
            ) : (
                <>
                    <Header />
                    <main className="pt-32 pb-24 min-h-screen bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                            <Breadcrumbs items={breadcrumbs} />

                            {/* Hero Section */}
                            <div className="text-center mb-20">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-6">
                                    <Rocket className="w-3.5 h-3.5 text-black" />
                                    For AI Tool Builders
                                </div>
                                <h1 className="font-heading text-5xl md:text-7xl tracking-tight text-black mb-4">
                                    Get Your AI Tool<br />In Front of Thousands
                                </h1>
                                <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                                    Submit your platform to HyzenPro's curated AI tools directory. Reach {stats.totalViews.toLocaleString()}+ monthly visitors actively searching for AI software solutions.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/portal-auth/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20"
                                    >
                                        Submit Your Tool — Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/ai-tools-directory/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold rounded-xl border border-gray-200 hover:border-black transition-all"
                                    >
                                        Browse Directory <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Social Proof Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                                {[
                                    { value: `${stats.toolsCount}+`, label: 'Listed Tools', icon: Globe },
                                    { value: `${Math.round(stats.totalViews / 1000)}K+`, label: 'Monthly Views', icon: Eye },
                                    { value: '9+', label: 'Categories', icon: BarChart3 },
                                    { value: 'Free', label: 'Basic Listing', icon: CheckCircle2 },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <stat.icon className="w-6 h-6 text-black mx-auto mb-3" />
                                        <div className="font-heading text-3xl text-black mb-1">{stat.value}</div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* How It Works */}
                            <section className="mb-24">
                                <div className="text-center mb-12">
                                    <h2 className="font-heading text-4xl text-black mb-3">How It Works</h2>
                                    <p className="text-gray-500 max-w-xl mx-auto">Three simple steps to get your AI tool listed and generating qualified traffic.</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {[
                                        {
                                            step: '01',
                                            title: 'Create an Account',
                                            description: 'Sign up for a free vendor account using your email. It takes less than 30 seconds.',
                                            icon: Users,
                                        },
                                        {
                                            step: '02',
                                            title: 'Submit Your Tool',
                                            description: 'Fill in your tool name, website URL, description, pricing model, and primary category.',
                                            icon: Rocket,
                                        },
                                        {
                                            step: '03',
                                            title: 'Get Discovered',
                                            description: 'Once approved by our editorial team, your tool goes live across our directory, comparisons, and recommendations.',
                                            icon: Star,
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300">
                                            <div className="text-5xl font-heading text-gray-100 mb-4">{item.step}</div>
                                            <item.icon className="w-6 h-6 text-black mb-3" />
                                            <h3 className="font-bold text-lg text-black mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Benefits */}
                            <section className="mb-24">
                                <div className="text-center mb-12">
                                    <h2 className="font-heading text-4xl text-black mb-3">Why List on HyzenPro?</h2>
                                    <p className="text-gray-500 max-w-xl mx-auto">Join the fastest-growing AI tools directory trusted by developers, marketers, and founders.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { icon: Eye, title: 'High-Intent Traffic', text: 'Our visitors are actively searching for AI solutions — not just browsing. Every view is a qualified lead.' },
                                        { icon: Shield, title: 'Editorial Review', text: 'Every listing is manually reviewed by our team. This ensures quality and builds developer trust in your product.' },
                                        { icon: BarChart3, title: 'Performance Analytics', text: 'Track views, impressions, and click-through rates on your vendor dashboard in real time.' },
                                        { icon: Zap, title: 'Featured in Comparisons', text: 'Your tool appears in our side-by-side comparison engine, helping users evaluate you against competitors.' },
                                        { icon: Globe, title: 'SEO-Optimized Listing', text: 'Each tool gets a dedicated page with structured data, meta tags, and semantic HTML optimized for Google.' },
                                        { icon: Star, title: 'User Reviews', text: 'Collect authentic reviews from real users. Social proof dramatically increases conversion rates for your product.' },
                                    ].map((benefit, i) => (
                                        <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                                            <benefit.icon className="w-6 h-6 text-black mb-3" />
                                            <h3 className="font-bold text-sm text-black mb-2">{benefit.title}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">{benefit.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SEO Content Block */}
                            <section className="max-w-3xl mx-auto mb-20">
                                <div className="prose prose-lg prose-gray max-w-none prose-headings:font-heading prose-headings:text-black prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-black">
                                    <h2>Submit Your AI Tool to the Leading Directory</h2>
                                    <p>
                                        <strong>HyzenPro</strong> is a premier AI tools directory serving thousands of monthly visitors who are actively researching, comparing, and selecting artificial intelligence software for their businesses and creative workflows.
                                    </p>
                                    <p>
                                        Whether you've built an AI video editor, a GPT-powered writing assistant, an autonomous coding agent, or a workflow automation platform — listing on HyzenPro positions your product directly in front of qualified buyers at the exact moment they are making purchasing decisions.
                                    </p>
                                    <h3>What Makes HyzenPro Different?</h3>
                                    <p>
                                        Unlike generic software directories, HyzenPro is <strong>exclusively focused on AI tools</strong>. Our audience consists of tech-savvy creators, SaaS founders, digital marketers, and enterprise teams who understand AI's transformative potential and are ready to invest in the right solutions.
                                    </p>
                                    <p>
                                        Every submission goes through our editorial review process where we verify your tool's claims, test core features, and create an optimized listing page with structured data markup — ensuring maximum visibility on Google, Bing, and other search engines.
                                    </p>
                                </div>
                            </section>

                            {/* Final CTA */}
                            <section className="mb-8">
                                <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 md:p-14 text-center border border-gray-800 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                                    <h2 className="font-heading text-4xl md:text-5xl text-white mb-4 relative z-10">Ready to Grow Your AI Product?</h2>
                                    <p className="text-gray-400 max-w-xl mx-auto mb-8 relative z-10">
                                        Create your free vendor account and submit your first tool in under 2 minutes. Our team reviews every submission within 48 hours.
                                    </p>
                                    <Link
                                        href="/portal-auth/"
                                        className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    >
                                        Get Started — It's Free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </main>
                    <Footer />
                </>
            )}

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(schemaBreadcrumbs)) }}
            />
        </>
    );
}
