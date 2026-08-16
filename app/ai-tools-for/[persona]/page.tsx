import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import UnifiedFilterPanel from '@/components/tools/UnifiedFilterPanel';
import DirectoryCTA from '@/components/tools/DirectoryCTA';
import PersonaHero from '@/components/persona/PersonaHero';
import PainPoints from '@/components/persona/PainPoints';
import WorkflowSteps from '@/components/persona/WorkflowSteps';
import StarterKit from '@/components/persona/StarterKit';
import PersonaFaq from '@/components/persona/PersonaFaq';
import prisma from '@/lib/prisma';
import ToolLogo from '@/components/ui/ToolLogo';
import { getBaseUrl } from '@/lib/utils';
import { generateBreadcrumbSchema } from '@/lib/structured-data';

export const revalidate = 86400;

interface Props {
    params: Promise<{ persona: string }>;
}

const OTHER_PERSONAS = [
    { name: 'Creators & YouTubers', slug: 'creators-youtubers' },
    { name: 'Marketers & Growth', slug: 'marketers-growth' },
    { name: 'Developers', slug: 'developers-indie-hackers' },
    { name: 'Founders & Small Teams', slug: 'founders-small-teams' },
    { name: 'Students & Educators', slug: 'students-educators' },
    { name: 'Agencies & Consultants', slug: 'agencies-consultancies' },
];

export async function generateStaticParams() {
    try {
        const pages = await prisma.personaPage.findMany({
            where: { status: 'published' },
            select: { slug: true },
        });
        return pages.map((p: any) => ({ persona: p.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { persona } = await params;
    try {
        const page = await prisma.personaPage.findUnique({ where: { slug: persona } });
        if (!page) return { title: 'Persona Not Found' };

        const baseUrl = getBaseUrl();
        const canonicalUrl = page.canonicalUrl || `${baseUrl}/ai-tools-for/${persona}/`;

        return {
            title: page.metaTitle || `${page.name} — AI Tools for ${page.name} | HyzenPro`,
            description: page.metaDescription || `Discover the best AI tools curated for ${page.name.toLowerCase()}. Expert reviews, comparisons, and recommendations.`,
            alternates: { canonical: canonicalUrl },
            openGraph: {
                url: canonicalUrl,
                title: page.ogTitle || page.metaTitle || `${page.name} — AI Tools`,
                description: page.ogDescription || page.metaDescription || `AI tools curated for ${page.name.toLowerCase()}`,
                images: page.ogImage ? [{ url: page.ogImage }] : undefined,
            },
        };
    } catch {
        return { title: 'Persona Not Found' };
    }
}

export default async function PersonaPage({ params }: Props) {
    const { persona } = await params;

    let page;
    try {
        page = await prisma.personaPage.findUnique({
            where: { slug: persona },
            include: {
                tools: {
                    where: { status: 'published' },
                    select: {
                        id: true, name: true, slug: true, shortDescription: true,
                        logo: true, pricingType: true, rating: true, primaryCategory: true,
                        views: true, featured: true,
                    },
                },
            },
        });
    } catch {
        notFound();
    }

    if (!page || page.status !== 'published') notFound();

    const baseUrl = getBaseUrl();
    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'AI Tools', url: `${baseUrl}/ai-tools-directory/` },
        { name: page.name, url: `${baseUrl}/ai-tools-for/${persona}/` },
    ];

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${page.name} — AI Tools`,
        description: page.metaDescription || `The best AI tools for ${page.name.toLowerCase()}. Expert reviews, comparisons, and recommendations.`,
        url: `${baseUrl}/ai-tools-for/${persona}/`,
        mainEntity: {
            '@type': 'ItemList',
            name: `AI Tools for ${page.name}`,
            numberOfItems: page.tools.length,
            itemListElement: page.tools.slice(0, 50).map((tool: any, i: number) => ({
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

    const faqItems = (page.faq as any[]) || [];
    const faqSchema = faqItems.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item: any) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    } : null;

    const otherPersonas = OTHER_PERSONAS.filter(p => p.slug !== persona);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

            <main id="main-content" tabIndex={-1}>
                {/* Hero */}
                <section className="relative pt-32 pb-16">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid md:grid-cols-[1fr,320px] gap-12 items-start">
                            <div>
                                <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
                                    <Link href="/ai-tools-directory/" className="hover:text-foreground transition-colors">AI Tools</Link>
                                    <span className="mx-2">/</span>
                                    <span className="text-foreground">{page.name}</span>
                                </nav>
                                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-4 leading-tight">
                                    {page.heroTitle || page.name}
                                </h1>
                                {page.heroSubtitle && (
                                    <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                                        {page.heroSubtitle}
                                    </p>
                                )}
                                {/* Pain points inline */}
                                {(page.painPoints as any[])?.length > 0 && (
                                    <ul className="mt-6 space-y-2">
                                        {(page.painPoints as any[]).slice(0, 3).map((pp: any, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                {pp.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Editor's top pick aside */}
                            {page.tools.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-6 hidden md:block">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Editor&apos;s top pick</p>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-lg">
                                            <ToolLogo logo={page.tools[0].logo} name={page.tools[0].name} size="xs" />
                                        </div>
                                        <div>
                                            <p className="font-serif text-sm font-semibold">{page.tools[0].name}</p>
                                            {page.tools[0].rating && (
                                                <p className="text-xs text-muted-foreground">★ {page.tools[0].rating.toFixed(1)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{page.tools[0].shortDescription}</p>
                                    <Link
                                        href={`/ai-tools-directory/${page.tools[0].primaryCategory || 'ai-general-tools'}/${page.tools[0].slug}/`}
                                        className="text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors"
                                    >
                                        Read review →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-6">
                    <PainPoints painPoints={(page.painPoints as any[]) || []} />
                    <WorkflowSteps steps={(page.workflowSteps as any[]) || []} />
                    <StarterKit tools={page.tools.slice(0, 3)} notes={(page.starterKit as any[]) || undefined} />

                    {/* Tools grid */}
                    <section className="mb-16">
                        <h2 className="font-serif text-3xl text-foreground mb-2">
                            All <span className="italic text-muted-foreground">{page.name}</span> tools
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Browse and compare {page.tools.length} AI tool{page.tools.length !== 1 ? 's' : ''} curated for {page.name.toLowerCase()}.
                        </p>
                        {page.tools.length > 0 ? (
                            <UnifiedFilterPanel tools={page.tools.map((t: any) => ({ ...t, rating: t.rating, logo: t.logo, primaryCategory: t.primaryCategory }))} />
                        ) : (
                            <div className="text-center py-20 bg-muted border border-border rounded-2xl">
                                <p className="text-muted-foreground">No tools assigned to this persona page yet.</p>
                            </div>
                        )}
                    </section>

                    <PersonaFaq faq={faqItems} />

                    {/* Cross-links */}
                    {otherPersonas.length > 0 && (
                        <nav aria-label="Explore other personas" className="mb-16 border-t border-border pt-12">
                            <h2 className="font-serif text-2xl text-foreground mb-6 text-center">
                                Explore <span className="italic text-muted-foreground">other personas</span>
                            </h2>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                                {otherPersonas.map((p) => (
                                    <Link
                                        key={p.slug}
                                        href={`/ai-tools-for/${p.slug}/`}
                                        className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                                    >
                                        {p.name}
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    )}

                    {page.ctaText && page.ctaUrl && (
                        <section className="mb-16 text-center">
                            <a href={page.ctaUrl} className="text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                                {page.ctaText} →
                            </a>
                        </section>
                    )}
                </div>

                <DirectoryCTA />
            </main>

            <Footer />
        </>
    );
}
