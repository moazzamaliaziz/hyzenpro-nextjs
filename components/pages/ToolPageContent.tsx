import { notFound, permanentRedirect } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdSlot from '@/components/ads/AdSlot';
import MatcherDiscoveryCard from '@/components/quiz/MatcherDiscoveryCard';
import ToolCard from '@/components/tools/ToolCard';
import ViewTracker from '@/components/tools/ViewTracker';
import ToolPageAlternatives from '@/components/tool-page/ToolPageAlternatives';
import ToolPageContentSections from '@/components/tool-page/ToolPageContentSections';
import ToolPageFaq from '@/components/tool-page/ToolPageFaq';
import ToolPageGallery from '@/components/tool-page/ToolPageGallery';
import ToolPageHero from '@/components/tool-page/ToolPageHero';
import ToolPagePersonas from '@/components/tool-page/ToolPagePersonas';
import ToolPagePricing from '@/components/tool-page/ToolPagePricing';
import ToolPageRatingBreakdown from '@/components/tool-page/ToolPageRatingBreakdown';
import ToolPageReviews from '@/components/tool-page/ToolPageReviews';
import ToolPageSidebar from '@/components/tool-page/ToolPageSidebar';
import ToolPageTableOfContents from '@/components/tool-page/ToolPageTableOfContents';
import ToolPageVerdict from '@/components/tool-page/ToolPageVerdict';
import ToolPageVideos from '@/components/tool-page/ToolPageVideos';
import prisma from '@/lib/prisma';
import { getMatcherDiscoveryContext } from '@/lib/matcher-discovery';
import { stripTitleBrand } from '@/lib/seo-titles';
import { toolBodyFont, toolHeadingFont } from '@/lib/tool-page-fonts';
import {
    buildToolPageMeta,
    getToolOverallRating,
    getToolPageTheme,
    TOOL_PAGE_SECTION_DEFINITIONS,
} from '@/lib/tool-page';
import { buildToolCanonicalPath } from '@/lib/tool-paths';
import { getPricingLabel, stripHtml } from '@/lib/utils';
import { toSecureExternalUrl } from '@/lib/secure-external-url';

export default async function ToolPageContent({ category, slug }: { category: string; slug: string }) {
    let tool;
    try {
        tool = await prisma.tool.findUnique({
            where: { slug },
            include: { categories: true },
        });
    } catch {
        notFound();
    }

    if (!tool || tool.status !== 'published') {
        notFound();
    }

    const canonicalCategory = tool.primaryCategory || 'ai-general-tools';
    if (category !== canonicalCategory) {
        permanentRedirect(buildToolCanonicalPath(canonicalCategory, tool.slug));
    }

    let relatedTools: any[] = [];
    try {
        relatedTools = await prisma.tool.findMany({
            where: {
                status: 'published',
                primaryCategory: tool.primaryCategory,
                id: { not: tool.id },
            },
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
            },
            take: 4,
        });
    } catch {
        relatedTools = [];
    }

    const pageMeta = buildToolPageMeta(tool as any, relatedTools as any, tool.categories as any);
    const displayName = pageMeta.displayName || tool.name;
    const displayLogo = toSecureExternalUrl(pageMeta.displayLogo || tool.logo);
    const websiteUrl = toSecureExternalUrl(tool.websiteUrl);
    const pricingTiers = (pageMeta.pricingTiers || []).map((tier) => ({
        ...tier,
        ctaUrl: toSecureExternalUrl(tier.ctaUrl),
    }));
    const reviewSources = (pageMeta.reviewSources || []).map((source) => ({
        ...source,
        url: toSecureExternalUrl(source.url),
    }));
    const screenshots = (pageMeta.screenshots || []).map((screenshot) => ({
        ...screenshot,
        url: toSecureExternalUrl(screenshot.url),
    }));
    const videos = (pageMeta.videos || []).map((video) => ({
        ...video,
        channelAvatar: toSecureExternalUrl(video.channelAvatar),
    }));
    const socialLinks = (pageMeta.socialLinks || []).map((link) => ({
        ...link,
        url: toSecureExternalUrl(link.url),
    }));
    const currentDeal = pageMeta.currentDeal
        ? { ...pageMeta.currentDeal, ctaUrl: toSecureExternalUrl(pageMeta.currentDeal.ctaUrl) }
        : undefined;
    const theme = getToolPageTheme(tool.primaryCategory);
    const overallRating = getToolOverallRating(tool as any, pageMeta);
    const matcherContext = getMatcherDiscoveryContext(tool.primaryCategory);
    const categoryLinks = tool.categories.length > 0
        ? tool.categories.map((item) => ({
            name: item.name,
            href: `/ai-tools-directory/${item.slug}/`,
        }))
        : [{ name: category.replace(/-/g, ' '), href: `/ai-tools-directory/${category}/` }];

    const alternativeSlugs = pageMeta.alternatives?.map((item) => item.slug) || [];

    let alternativeRecords: any[] = [];
    if (alternativeSlugs.length > 0) {
        try {
            alternativeRecords = await prisma.tool.findMany({
                where: {
                    slug: { in: alternativeSlugs },
                    status: 'published',
                },
                select: {
                    slug: true,
                    name: true,
                    shortDescription: true,
                    rating: true,
                    pricingType: true,
                    primaryCategory: true,
                },
            });
        } catch {
            alternativeRecords = [];
        }
    }

    const resolvedAlternatives = (pageMeta.alternatives || []).map((alternative) => {
        const match = alternativeRecords.find((record) => record.slug === alternative.slug);

        return {
            ...alternative,
            name: match?.name || alternative.name,
            tagline: match?.shortDescription || alternative.tagline,
            rating: match?.rating ?? alternative.rating,
            pricingLabel: alternative.pricingLabel || (match ? getPricingLabel(match.pricingType) : undefined),
            category: alternative.category || match?.primaryCategory || tool.primaryCategory || category,
        };
    });

    const tableOfContents = TOOL_PAGE_SECTION_DEFINITIONS.filter((section) => {
        switch (section.id) {
            case 'overview':
                return Boolean(pageMeta.overviewHtml);
            case 'features':
                return (pageMeta.featureHighlights || []).length > 0;
            case 'pricing':
                return (pageMeta.pricingTiers || []).length > 0;
            case 'who-its-for':
                return (pageMeta.personas || []).length > 0;
            case 'pros-cons':
                return (pageMeta.prosDetailed || []).length > 0 || (pageMeta.consDetailed || []).length > 0;
            case 'reviews':
                return (pageMeta.reviewSources || []).length > 0;
            case 'ratings':
                return (pageMeta.ratingBreakdown || []).length > 0;
            case 'videos':
                return (pageMeta.videos || []).length > 0;
            case 'screenshots':
                return (pageMeta.screenshots || []).length > 0;
            case 'verdict':
                return Boolean(pageMeta.verdict);
            case 'faq':
                return (pageMeta.faq || []).length > 0;
            case 'alternatives':
                return resolvedAlternatives.length > 0;
            default:
                return true;
        }
    });

    const breadcrumbItems = [
        { label: 'AI Tools', href: '/ai-tools-directory/' },
        { label: categoryLinks[0]?.name || category.replace(/-/g, ' '), href: `/ai-tools-directory/${category}/` },
        { label: displayName },
    ];

    return (
        <>
            <ViewTracker toolId={tool.id} />

            <main id="main-content" className={`${toolBodyFont.className} min-h-screen bg-white pb-20 pt-28 text-[#0F0F0F]`}>
                <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={breadcrumbItems} className="mb-8" />

                    <ToolPageHero
                        toolName={displayName}
                        tagline={pageMeta.tagline || stripHtml(tool.shortDescription)}
                        logo={displayLogo}
                        categoryLinks={categoryLinks}
                        overallRating={overallRating}
                        reviewCount={pageMeta.reviewCount}
                        verified={pageMeta.verified !== false}
                        lastReviewedDate={pageMeta.lastReviewedDate}
                        websiteUrl={websiteUrl}
                        stats={pageMeta.heroStats || []}
                        accent={theme.accent}
                        accentSoft={theme.accentSoft}
                    />

                    <div className="mt-8">
                        <MatcherDiscoveryCard context={matcherContext} compact />
                    </div>

                    <div className="mt-8 lg:hidden">
                        <ToolPageTableOfContents sections={tableOfContents as any} accent={theme.accent} />
                    </div>

                    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,700px)_280px] lg:justify-between lg:gap-x-16">
                        <article className="min-w-0">
                            <ToolPageContentSections
                                toolName={displayName}
                                overviewHtml={pageMeta.overviewHtml || ''}
                                uniqueValueHtml={pageMeta.uniqueValueHtml}
                                featureHighlights={pageMeta.featureHighlights || []}
                                prosDetailed={pageMeta.prosDetailed || []}
                                consDetailed={pageMeta.consDetailed || []}
                                accent={theme.accent}
                                accentSoft={theme.accentSoft}
                            />

                            <ToolPagePricing
                                toolName={displayName}
                                tiers={pricingTiers}
                                accent={theme.accent}
                                accentSoft={theme.accentSoft}
                                lastReviewedDate={pageMeta.lastReviewedDate}
                                intro={pageMeta.pricingIntro}
                            />

                            <ToolPagePersonas
                                toolName={displayName}
                                personas={pageMeta.personas || []}
                                accent={theme.accent}
                                accentSoft={theme.accentSoft}
                            />

                            <ToolPageReviews
                                toolName={displayName}
                                intro={pageMeta.reviewsIntro}
                                reviewSources={reviewSources}
                            />

                            <ToolPageRatingBreakdown
                                toolName={displayName}
                                overallRating={overallRating}
                                categories={pageMeta.ratingBreakdown || []}
                                summary={pageMeta.ratingSummary || ''}
                                accent={theme.accent}
                            />

                            <ToolPageVideos
                                toolName={displayName}
                                videos={videos}
                                accent={theme.accent}
                            />

                            <ToolPageGallery
                                toolName={displayName}
                                screenshots={screenshots}
                            />

                            <ToolPageVerdict
                                toolName={displayName}
                                verdictHtml={pageMeta.verdict || ''}
                                bestFor={pageMeta.bestFor || []}
                                skipIf={pageMeta.skipIf || []}
                                websiteUrl={websiteUrl}
                                accent={theme.accent}
                                accentSoft={theme.accentSoft}
                            />

                            <ToolPageFaq
                                toolName={displayName}
                                items={pageMeta.faq || []}
                            />

                            <ToolPageAlternatives
                                toolName={displayName}
                                alternatives={resolvedAlternatives}
                                accent={theme.accent}
                            />

                            <div className="mt-12">
                                <AdSlot slot="tool-detail-bottom" format="horizontal" />
                            </div>
                        </article>

                        <aside className="hidden lg:block">
                            <ToolPageSidebar
                                sections={tableOfContents as any}
                                accent={theme.accent}
                                toolName={displayName}
                                websiteUrl={websiteUrl}
                                socialLinks={socialLinks}
                                currentDeal={currentDeal}
                                bestValueNote={pageMeta.bestValueNote}
                            />

                            <div className="mt-6">
                                <AdSlot slot="tool-sidebar" format="vertical" priority />
                            </div>
                        </aside>
                    </div>

                    {relatedTools.length > 0 && (
                        <section className="mt-20 border-t border-[#F3F4F6] pt-12">
                            <h2 className={`${toolHeadingFont.className} text-[24px] leading-[1.2] text-[#0F0F0F] sm:text-[30px]`}>
                                More tools in {categoryLinks[0]?.name || 'this category'}
                            </h2>
                            <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-[#4B5563]">
                                If you are still comparing options, these are the next tools we would open in parallel.
                            </p>
                            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {relatedTools.map((relatedTool) => (
                                    <ToolCard key={relatedTool.id} tool={relatedTool} />
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
