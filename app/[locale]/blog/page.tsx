import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';
import BlogPageContent from '@/components/pages/BlogPageContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/blog');

    return {
        title: 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
        description:
            'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
        alternates: { canonical, languages },
    };
}

export default async function LocaleBlogPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <BlogPageContent />;
}
