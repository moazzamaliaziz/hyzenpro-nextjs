import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';
import FindToolsPageContent from '@/components/pages/FindToolsPageContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/find-tools');

    return {
        title: 'Find the Right AI Tool — Guided Quiz | HyzenPro',
        description: 'Answer a few questions and get a shortlist of AI tools matched to your workflow and budget.',
        alternates: { canonical, languages },
    };
}

export default async function LocaleFindToolsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <FindToolsPageContent />;
}
