import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star, Check, X, ArrowRight, Eye, ThumbsUp, Globe } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdSlot from '@/components/ads/AdSlot';
import ToolCard from '@/components/tools/ToolCard';
import ViewTracker from '@/components/tools/ViewTracker';
import prisma from '@/lib/prisma';
import { getBaseUrl, getCategoryIcon, getPricingLabel, getPricingColor, formatDate } from '@/lib/utils';
import { generateToolSchema, generateBreadcrumbSchema } from '@/lib/structured-data';

export const revalidate = 3600;

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const tool = await prisma.tool.findUnique({ where: { slug } });
        if (!tool) return { title: 'Tool Not Found' };
        const seo = tool.seo as any;
        return {
            title: seo?.metaTitle || `${tool.name} – AI Tool Review & Details`,
            description: seo?.metaDescription || tool.shortDescription,
            alternates: {
                canonical: seo?.canonicalUrl || `${getBaseUrl()}/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}/`,
            },
            openGraph: {
                title: seo?.metaTitle || `${tool.name} – AI Tool Review`,
                description: seo?.metaDescription || tool.shortDescription,
                images: seo?.ogImage ? [seo.ogImage] : tool.logo ? [tool.logo] : [],
            },
        };
    } catch {
        return { title: 'Tool Not Found' };
    }
}

export async function generateStaticParams() {
    try {
        const tools = await prisma.tool.findMany({
            where: { status: 'published' },
            select: { slug: true, primaryCategory: true },
        });
        return tools.map((t: any) => ({
            category: t.primaryCategory || 'ai-general-tools',
            slug: t.slug,
        }));
    } catch {
        return [];
    }
}

export default async function ToolDetailPage({ params }: Props) {
    const { category, slug } = await params;
    let tool;
    try {
        tool = await prisma.tool.findUnique({ where: { slug } });
    } catch {
        notFound();
    }
    if (!tool || tool.status !== 'published') notFound();

    // Get related tools
    let relatedTools: any[] = [];
    try {
        relatedTools = await prisma.tool.findMany({
            where: {
                status: 'published',
                primaryCategory: tool.primaryCategory,
                id: { not: tool.id },
            },
            take: 4,
        });
    } catch { }

    // Get categories for this tool
    let toolCategories: any[] = [];
    try {
        if (tool.categoryIds.length > 0) {
            toolCategories = await prisma.category.findMany({
                where: { id: { in: tool.categoryIds } },
            });
        }
    } catch { }

    const baseUrl = getBaseUrl();
    const catName = toolCategories.find((c) => c.slug === category)?.name || category.replace(/-/g, ' ').replace(/\bai\b/gi, 'AI');

    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'AI Tools', url: `${baseUrl}/ai-tools-directory/` },
        { name: catName, url: `${baseUrl}/ai-tools-directory/${category}/` },
        { name: tool.name, url: `${baseUrl}/ai-tools-directory/${category}/${slug}/` },
    ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateToolSchema(tool)) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) }} />

            <Header />
            <ViewTracker toolId={tool.id} />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'AI Tools', href: '/ai-tools-directory/' },
                            { label: catName, href: `/ai-tools-directory/${category}/` },
                            { label: tool.name },
                        ]}
                        className="mb-8"
                    />

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Tool Header */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6">
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                                        {tool.logo ? (
                                            <Image src={tool.logo} alt={tool.name} width={56} height={56} className="object-contain" />
                                        ) : (
                                            <span className="text-3xl">{getCategoryIcon(category)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="font-heading text-4xl md:text-5xl text-black mb-2">{tool.name}</h1>
                                        <p className="text-gray-500 text-lg">{tool.shortDescription}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-4">
                                            {tool.rating && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-bold text-amber-600">{tool.rating.toFixed(1)}/5</span>
                                                </div>
                                            )}
                                            <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg ${getPricingColor(tool.pricingType)}`}>
                                                {getPricingLabel(tool.pricingType)}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Eye className="w-3 h-3" /> {tool.views?.toLocaleString()} views
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Button */}
                                <a
                                    href={tool.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-gray-800 transition-all"
                                >
                                    <Globe className="w-4 h-4" /> Visit {tool.name}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Description */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                                <h2 className="font-heading text-2xl text-black mb-4">About {tool.name}</h2>
                                <div
                                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: tool.longDescription }}
                                />
                            </div>

                            {/* Pros & Cons */}
                            {(tool.pros.length > 0 || tool.cons.length > 0) && (
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    {tool.pros.length > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                            <h3 className="font-heading text-xl text-green-700 mb-4">✅ Pros</h3>
                                            <ul className="space-y-2.5">
                                                {tool.pros.map((pro: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {tool.cons.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                            <h3 className="font-heading text-xl text-red-700 mb-4">❌ Cons</h3>
                                            <ul className="space-y-2.5">
                                                {tool.cons.map((con: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                                                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Features */}
                            {tool.features.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                                    <h2 className="font-heading text-2xl text-black mb-4">Key Features</h2>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {tool.features.map((feature: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <Check className="w-4 h-4 text-black flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <AdSlot slot="tool-detail-bottom" format="horizontal" />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tool Info Card */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sticky top-28">
                                <h3 className="font-heading text-lg text-black mb-4">Quick Info</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-400">Pricing</span>
                                        <span className="text-black font-medium">{getPricingLabel(tool.pricingType)}</span>
                                    </div>
                                    {tool.rating && (
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-400">Rating</span>
                                            <span className="text-black font-medium">{tool.rating.toFixed(1)}/5</span>
                                        </div>
                                    )}
                                    {toolCategories.length > 0 && (
                                        <div className="py-2 border-b border-gray-200">
                                            <span className="text-gray-400 block mb-2">Categories</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {toolCategories.map((c) => (
                                                    <Link
                                                        key={c.id}
                                                        href={`/ai-tools-directory/${c.slug}/`}
                                                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:text-black hover:border-gray-400 transition-colors"
                                                    >
                                                        {c.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-400">Updated</span>
                                        <span className="text-gray-600 text-xs">{formatDate(tool.updatedAt)}</span>
                                    </div>
                                </div>

                                <a
                                    href={tool.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-gray-800 transition-all"
                                >
                                    Visit Website <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            <AdSlot slot="tool-sidebar" format="vertical" />
                        </div>
                    </div>

                    {/* Related Tools */}
                    {relatedTools.length > 0 && (
                        <section className="mt-16">
                            <h2 className="font-heading text-3xl text-black mb-8">
                                Similar Tools in {catName}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {relatedTools.map((t) => (
                                    <ToolCard key={t.id} tool={t} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
