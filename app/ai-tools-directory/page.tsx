import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolsFilterGrid from '@/components/tools/ToolsFilterGrid';
import DirectoryCTA from '@/components/tools/DirectoryCTA';
import AIToolsSEOContent from '@/components/tools/AIToolsSEOContent';
import prisma from '@/lib/prisma';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'AI Tools Directory - Find & Compare the Best AI Tools',
    description:
        'Browse our comprehensive directory of AI tools. Filter by category, pricing, and ratings to find the perfect AI tool for your needs.',
    alternates: {
        canonical: `${getBaseUrl()}/ai-tools-directory/`,
    },
};

async function getData() {
    try {
        const [tools, categories] = await Promise.all([
            prisma.tool.findMany({
                where: { status: 'published' },
                orderBy: { name: 'asc' },
            }),
            prisma.category.findMany({
                orderBy: { name: 'asc' },
            }),
        ]);
        return { tools, categories };
    } catch {
        return { tools: [], categories: [] };
    }
}

export default async function AIToolsDirectoryPage() {
    const { tools, categories } = await getData();
    const baseUrl = getBaseUrl();

    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'AI Tools Directory', url: `${baseUrl}/ai-tools-directory/` },
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
                }}
            />

            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[{ label: 'AI Tools Directory' }]}
                        className="mb-8"
                    />

                    {/* Hero */}
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-black mb-4">
                            AI Tools Directory
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Discover, compare, and choose from our curated collection of the best AI tools across {categories.length} categories.
                        </p>
                    </div>

                    {/* Tools Grid with Filters */}
                    <ToolsFilterGrid
                        tools={tools.map((t: any) => ({
                            ...t,
                            rating: t.rating,
                            logo: t.logo,
                            primaryCategory: t.primaryCategory,
                        }))}
                        categories={categories.map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            toolCount: c.toolCount,
                        }))}
                    />
                </div>
                
                {/* Find Tools / Compare Engine CTA Block */}
                <DirectoryCTA />

                {/* SEO Content Block (Below the Fold) */}
                <AIToolsSEOContent />
            </main>

            <Footer />
        </>
    );
}
