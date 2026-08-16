import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import UnifiedFilterPanel from '@/components/tools/UnifiedFilterPanel';
import DirectoryCTA from '@/components/tools/DirectoryCTA';
import AIToolsSEOContent from '@/components/tools/AIToolsSEOContent';
import prisma from '@/lib/prisma';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { getBaseUrl } from '@/lib/utils';
import { Video, PenLine, Code2, Workflow, Rocket, GraduationCap } from 'lucide-react';

const AUDIENCES = [
    { name: 'Creators & YouTubers', slug: 'creators-youtubers', accent: 'from-amber-500/10 to-orange-500/10', icon: Video, description: 'Video editing, thumbnails, scripting' },
    { name: 'Marketers & Growth', slug: 'marketers-growth', accent: 'from-blue-500/10 to-cyan-500/10', icon: Rocket, description: 'SEO, ads, email, social' },
    { name: 'Developers', slug: 'developers-indie-hackers', accent: 'from-violet-500/10 to-purple-500/10', icon: Code2, description: 'Code, debug, deploy' },
    { name: 'Founders & Small Teams', slug: 'founders-small-teams', accent: 'from-emerald-500/10 to-teal-500/10', icon: Workflow, description: 'Ops, hiring, finance' },
    { name: 'Students & Educators', slug: 'students-educators', accent: 'from-rose-500/10 to-pink-500/10', icon: GraduationCap, description: 'Research, writing, study' },
    { name: 'Agencies & Consultants', slug: 'agencies-consultancies', accent: 'from-sky-500/10 to-indigo-500/10', icon: PenLine, description: 'Client work, reporting' },
];

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

export default async function AIToolsDirectoryPageContent() {
    const { tools, categories } = await getData();
    const baseUrl = getBaseUrl();

    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'AI Tools Directory', url: `${baseUrl}/ai-tools-directory/` },
    ];

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AI Tools Directory',
        description: 'Browse our comprehensive directory of AI tools. Filter by category, pricing, ratings, and features to find the perfect AI tool for your needs.',
        url: `${baseUrl}/ai-tools-directory/`,
        mainEntity: {
            '@type': 'ItemList',
            name: 'AI Tools',
            numberOfItems: tools.length,
            itemListElement: tools.slice(0, 50).map((tool: any, i: number) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'SoftwareApplication',
                    name: tool.name,
                    url: `${baseUrl}/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}/`,
                    applicationCategory: 'AI Tool',
                    offers: {
                        '@type': 'Offer',
                        price: tool.pricingType?.toLowerCase() === 'free' ? '0' : undefined,
                        priceCurrency: 'USD',
                    },
                },
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(collectionSchema),
                }}
            />

            <main id="main-content" tabIndex={-1}>
                {/* Hero */}
                <section className="relative pt-32 pb-16 text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <p className="text-xs uppercase tracking-[0.25em] font-medium text-muted-foreground mb-4">
                            Browse
                        </p>
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
                            AI Tools <span className="italic text-muted-foreground">Directory</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                            Discover, compare, and choose from our curated collection of the best AI tools across {categories.length} categories.
                        </p>

                        {/* Trust row */}
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/60">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {tools.length} tools reviewed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {categories.length} categories
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Updated monthly
                            </span>
                        </div>
                    </div>
                </section>

                {/* Audience grid */}
                <section className="max-w-6xl mx-auto px-6 mb-16" aria-label="Browse by role">
                    <div className="text-center mb-8">
                        <p className="text-xs uppercase tracking-[0.25em] font-medium text-muted-foreground mb-2">
                            Collections
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                            Find tools <span className="italic text-muted-foreground">for your role</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {AUDIENCES.map((audience) => {
                            const Icon = audience.icon;
                            return (
                                <Link
                                    key={audience.slug}
                                    href={`/ai-tools-for/${audience.slug}/`}
                                    className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${audience.accent} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-foreground/20`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Icon className="w-5 h-5 text-foreground" />
                                    </div>
                                    <h3 className="font-serif text-lg text-foreground mb-1">{audience.name}</h3>
                                    <p className="text-sm text-muted-foreground">{audience.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Filter + Grid */}
                <section className="max-w-6xl mx-auto px-6 mb-16">
                    <UnifiedFilterPanel
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
                </section>

                {/* Category links */}
                {categories.length > 0 && (
                    <nav aria-label="Browse AI tools by category" className="max-w-6xl mx-auto px-6 mb-16 border-t border-border pt-8">
                        <h2 className="font-serif text-2xl text-foreground mb-4">
                            Browse by <span className="italic text-muted-foreground">category</span>
                        </h2>
                        <ul className="flex flex-wrap gap-x-4 gap-y-2">
                            {categories.map((c: any) => (
                                <li key={c.slug}>
                                    <Link
                                        href={`/ai-tools-directory/${c.slug}/`}
                                        className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                                    >
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                <DirectoryCTA />
                <AIToolsSEOContent />
            </main>

            <Footer />
        </>
    );
}
