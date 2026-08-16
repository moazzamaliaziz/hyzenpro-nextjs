import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/compare/tools');

    return {
        title: 'Compare AI Tools — Side-by-Side | HyzenPro',
        description: 'Compare AI tools side by side. Pricing, features, and real user reviews.',
        alternates: { canonical, languages },
    };
}

import ComparePage from '@/app/compare/tools/page';

export default async function LocaleCompareToolsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ComparePage />;
}
