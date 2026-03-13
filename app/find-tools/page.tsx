import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UseCaseWizard from '@/components/tools/UseCaseWizard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Sparkles, ArrowRight, Shield, Zap, Eye, Star, Users } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'Find the Perfect AI Tool for Your Needs — Smart AI Recommendation Engine | HyzenPro',
    description: 'Use our interactive AI recommendation wizard to discover the best artificial intelligence tools for your specific workflow. Filter by use case, budget, and popularity. Get personalized results in seconds.',
    keywords: [
        'find ai tools', 'ai tool recommender', 'best ai tools', 'ai tool finder',
        'ai software recommendations', 'compare ai tools', 'free ai tools',
        'ai tools for marketing', 'ai tools for writing', 'ai tools for video',
    ],
    openGraph: {
        title: 'Find Your Perfect AI Tool — HyzenPro Smart Finder',
        description: 'Answer 3 quick questions and get personalized AI tool recommendations matched to your workflow and budget.',
        type: 'website',
    },
    alternates: {
        canonical: '/find-tools/',
    },
};

async function getQuickStats() {
    try {
        const [toolsCount, categoriesCount] = await Promise.all([
            prisma.tool.count({ where: { status: 'published' } }),
            prisma.category.count(),
        ]);
        return { toolsCount, categoriesCount };
    } catch {
        return { toolsCount: 100, categoriesCount: 9 };
    }
}

export default async function FindToolsPage() {
    const stats = await getQuickStats();

    const breadcrumbs = [
        { label: 'Find Tools' },
    ];

    const schemaBreadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Find Tools', url: '/find-tools/' },
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How does the AI tool finder work?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our smart recommendation engine uses a 3-step wizard: first select your use case (video, writing, coding, etc.), then choose your budget preference, and finally pick how you want results ranked. We instantly match you with the best tools from our database of verified AI platforms.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is HyzenPro free to use?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, HyzenPro is completely free. Browse our directory, use the recommendation wizard, compare tools side-by-side, and read expert reviews — all without creating an account or paying anything.',
                },
            },
            {
                '@type': 'Question',
                name: 'How many AI tools are in the HyzenPro directory?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Our directory currently indexes ${stats.toolsCount}+ verified AI tools across ${stats.categoriesCount} specialized categories including video generation, copywriting, image creation, coding assistants, and more.`,
                },
            },
        ],
    };

    return (
        <>
            <Header />
            <main className="pt-32 pb-24 min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumbs */}
                    <Breadcrumbs items={breadcrumbs} />

                    {/* Hero Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                            Smart AI Recommendation Engine
                        </div>
                        <h1 className="font-heading text-5xl md:text-7xl tracking-tight text-black mb-4">
                            Find Your Perfect Tool
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                            Answer 3 quick questions and our engine matches you with the best AI platforms from a verified database of {stats.toolsCount}+ tools.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Verified Reviews
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" /> Instant Results
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> 100% Free
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5" /> Expert Curated
                            </div>
                        </div>
                    </div>

                    {/* Wizard */}
                    <UseCaseWizard />

                    {/* Quick Navigation Cards */}
                    <section className="mt-24 mb-16">
                        <div className="text-center mb-10">
                            <h2 className="font-heading text-3xl text-black mb-3">Or Browse by Category</h2>
                            <p className="text-gray-500">Jump directly into a specific AI tool category</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { name: 'AI Video Tools', slug: 'ai-video-tools', emoji: '🎬' },
                                { name: 'AI Writing Tools', slug: 'ai-writing-tools', emoji: '✍️' },
                                { name: 'AI Image Tools', slug: 'ai-image-tools', emoji: '🎨' },
                                { name: 'AI Code Tools', slug: 'ai-code-tools', emoji: '💻' },
                                { name: 'AI Marketing Tools', slug: 'ai-marketing-tools', emoji: '📣' },
                                { name: 'AI SEO Tools', slug: 'ai-seo-tools', emoji: '🔍' },
                            ].map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/ai-tools-directory/${cat.slug}/`}
                                    className="group flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <span className="text-2xl">{cat.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-black group-hover:text-black">{cat.name}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section for SEO */}
                    <section className="max-w-3xl mx-auto mt-16 mb-8">
                        <h2 className="font-heading text-3xl text-black text-center mb-10">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {(faqSchema.mainEntity as any[]).map((faq: any, i: number) => (
                                <details key={i} className="group border border-gray-200 rounded-2xl overflow-hidden">
                                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-left font-bold text-black text-sm hover:bg-gray-50 transition-colors">
                                        {faq.name}
                                        <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
                                    </summary>
                                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                                        {faq.acceptedAnswer.text}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="mt-16 mb-8">
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 md:p-12 text-center border border-gray-800">
                            <Users className="w-10 h-10 text-white/40 mx-auto mb-4" />
                            <h2 className="font-heading text-3xl text-white mb-3">Are You an AI Tool Builder?</h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-6">
                                List your AI platform on HyzenPro to reach thousands of decision-makers and developers daily.
                            </p>
                            <Link href="/submit-ai-tool/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-all">
                                Submit Your Tool <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>

                </div>
            </main>
            <Footer />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(schemaBreadcrumbs)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
