import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import BlogPageContent from '@/components/pages/BlogPageContent';
import {
    buildBlogQuery,
    getBlogListing,
    getPageValue,
    getQueryValue,
} from '@/lib/blog-query';

export const revalidate = 300;

function getSearchParamValue(value: string | string[] | undefined) {
    return getQueryValue(value);
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const category = getSearchParamValue(resolvedSearchParams?.category);
    const tag = getSearchParamValue(resolvedSearchParams?.tag);
    const q = getSearchParamValue(resolvedSearchParams?.q);
    const page = getPageValue(resolvedSearchParams?.page);
    const hasFilters = Boolean(category || tag || q);
    const listing = hasFilters || page > 1 ? await getBlogListing({ category, tag, q, page }) : undefined;
    const query = buildBlogQuery({ category, tag, q, page: listing?.currentPage || page });
    const canonical = `${getBaseUrl()}/blog/${query}`;
    const languages: Record<string, string> = {};

    for (const locale of routing.locales) {
        const localizedBase = locale === 'en' ? `${getBaseUrl()}/blog/` : `${getBaseUrl()}/${locale}/blog/`;
        languages[locale] = `${localizedBase}${query}`;
    }
    languages['x-default'] = `${getBaseUrl()}/blog/${query}`;

    const filteredCount = listing?.totalCount;

    return {
        title: hasFilters
            ? `AI Tool Blog${category ? `: ${category}` : tag ? `: ${tag}` : ''}`
            : 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
        description: hasFilters
            ? `Browse HyzenPro articles${category ? ` in ${category}` : ''}${tag ? ` tagged ${tag}` : ''}${q ? ` matching “${q}”` : ''}.`
            : 'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
        keywords: ['AI tools blog', 'AI reviews', 'AI comparisons', 'AI tutorials', 'AI tool guides', 'best AI tools 2026'],
        alternates: {
            canonical,
            languages,
        },
        openGraph: {
            url: canonical,
            title: hasFilters ? `AI Tool Blog${category ? `: ${category}` : ''}` : 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
            description: hasFilters
                ? `Browse ${filteredCount || 0} HyzenPro article${filteredCount === 1 ? '' : 's'} matching this selection.`
                : 'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
            type: 'website',
        },
        robots: {
            index: !hasFilters,
            follow: true,
        },
    };
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    return <BlogPageContent searchParams={searchParams} />;
}
