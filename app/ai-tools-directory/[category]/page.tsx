import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolCard from '@/components/tools/ToolCard';
import prisma from '@/lib/prisma';
import { getBaseUrl, getCategoryIcon } from '@/lib/utils';
import { generateBreadcrumbSchema } from '@/lib/structured-data';

export const revalidate = 3600;

interface Props {
    params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    try {
        const cat = await prisma.category.findUnique({ where: { slug: category } });
        if (!cat) return { title: 'Category Not Found' };
        const seo = cat.seo as any;
        return {
            title: seo?.metaTitle || `${cat.name} - Best AI Tools Directory`,
            description: seo?.metaDescription || cat.description || `Browse the best ${cat.name.toLowerCase()} with reviews and comparisons.`,
            alternates: {
                canonical: `${getBaseUrl()}/ai-tools-directory/${category}/`,
            },
        };
    } catch {
        return { title: 'Category Not Found' };
    }
}

export async function generateStaticParams() {
    try {
        const categories = await prisma.category.findMany({
            select: { slug: true },
        });
        return categories.map((c: any) => ({ category: c.slug }));
    } catch {
        return [];
    }
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;

    let cat;
    let tools: any[] = [];
    try {
        cat = await prisma.category.findUnique({ where: { slug: category } });
        if (cat) {
            tools = await prisma.tool.findMany({
                where: {
                    status: 'published',
                    OR: [
                        { primaryCategory: category },
                        { categoryIds: { has: cat.id } },
                    ],
                },
                orderBy: { name: 'asc' },
            });
        }
    } catch { }

    if (!cat) notFound();

    const baseUrl = getBaseUrl();
    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'AI Tools', url: `${baseUrl}/ai-tools-directory/` },
        { name: cat.name, url: `${baseUrl}/ai-tools-directory/${category}/` },
    ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) }} />

            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'AI Tools', href: '/ai-tools-directory/' },
                            { label: cat.name },
                        ]}
                        className="mb-8"
                    />

                    {/* Category Hero */}
                    <div className="text-center mb-12">
                        <span className="text-5xl mb-4 block">{getCategoryIcon(category)}</span>
                        <h1 className="font-heading text-5xl md:text-6xl text-black mb-4">{cat.name}</h1>
                        {cat.description && (
                            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{cat.description}</p>
                        )}
                        <p className="text-gray-400 text-sm mt-4">{tools.length} tool{tools.length !== 1 ? 's' : ''} in this category</p>
                    </div>

                    {/* Long Description / SEO Content */}
                    {cat.longDescription && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8">
                            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: cat.longDescription }} />
                        </div>
                    )}

                    {/* Tools Grid */}
                    {tools.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tools.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl">
                            <p className="text-gray-400">No tools found in this category yet.</p>
                        </div>
                    )}

                    {/* SEO Content */}
                    {cat.seoContent && (
                        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-8">
                            <div className="prose prose-sm max-w-none text-gray-500" dangerouslySetInnerHTML={{ __html: cat.seoContent }} />
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
