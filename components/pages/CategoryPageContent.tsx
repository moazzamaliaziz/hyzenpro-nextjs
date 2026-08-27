import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import UnifiedFilterPanel from '@/components/tools/UnifiedFilterPanel';
import MatcherDiscoveryCard from '@/components/quiz/MatcherDiscoveryCard';
import prisma from '@/lib/prisma';
import { getBaseUrl, getCategoryIcon } from '@/lib/utils';
import { getMatcherDiscoveryContext } from '@/lib/matcher-discovery';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { directoryToolSelect } from '@/lib/directory-data';

const NOINDEX_EMPTY_CATEGORIES = new Set([
    'ai-subtitle-generators',
    'ai-ui-generators',
    'text-to-speech',
    'copywriting',
    'avatar-generators',
    'ai-agentic-tools',
]);

export default async function CategoryPageContent({ category }: { category: string }) {
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
                select: directoryToolSelect,
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
    const matcherContext = getMatcherDiscoveryContext(category);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) }} />

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
                        <p className="text-gray-500 text-sm mt-4">{tools.length} tool{tools.length !== 1 ? 's' : ''} in this category</p>
                    </div>

                    {/* Long Description / SEO Content */}
                    {cat.longDescription && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8">
                            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: cat.longDescription }} />
                        </div>
                    )}

                    <div className="mb-8">
                        <MatcherDiscoveryCard context={matcherContext} />
                    </div>

                    {/* Tools Grid / Advanced Filters */}
                    {tools.length > 0 ? (
                        <UnifiedFilterPanel 
                            tools={tools}
                            isCategoryPage={true}
                            allPricingTypes={Array.from(new Set(tools.map(t => t.pricingType).filter(Boolean))) as string[]}
                            allFeatures={Array.from(new Set(tools.flatMap(t => t.features || []))).sort()}
                        />
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                            <p className="text-gray-500">No tools found in this category yet.</p>
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
