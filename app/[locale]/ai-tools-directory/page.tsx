import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';
import AIToolsDirectoryPageContent from '@/components/pages/AIToolsDirectoryPageContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/ai-tools-directory');

    return {
        title: 'AI Tools Directory — Find & Compare the Best AI Tools in 2026',
        description:
            'Browse our comprehensive directory of AI tools. Filter by category, pricing, ratings, and features to find the perfect AI tool for your needs.',
        alternates: { canonical, languages },
    };
}

export default async function LocaleAIToolsDirectoryPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AIToolsDirectoryPageContent />;
}
