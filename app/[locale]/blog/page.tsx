import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/utils';
import BlogPageContent from '@/components/pages/BlogPageContent';

export const revalidate = 300;

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedSearchParams || {})) {
        if (typeof value === 'string' && value.trim()) query.set(key, value.trim());
        else if (Array.isArray(value) && value[0]?.trim()) query.set(key, value[0].trim());
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const path = `/blog/${suffix}`;
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${getBaseUrl()}${path}` : `${getBaseUrl()}/${loc}${path}`;
    }
    languages['x-default'] = `${getBaseUrl()}${path}`;
    const canonical = locale === 'en' ? `${getBaseUrl()}${path}` : `${getBaseUrl()}/${locale}${path}`;

    return {
        title: 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
        description: 'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
        alternates: { canonical, languages },
        robots: { index: query.has('category') || query.has('tag') || query.has('q') ? false : true, follow: true },
    };
}

export default async function LocaleBlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <BlogPageContent searchParams={searchParams} locale={locale} />;
}
