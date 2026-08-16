import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getAlternateLinks, getToolTranslation } from '@/lib/locale-helpers';
import CompareSlugPageContent from '@/components/pages/CompareSlugPageContent';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const tool = await prisma.tool.findUnique({ where: { slug } });
        if (!tool) return { title: 'Compare | HyzenPro' };

        const translation = await getToolTranslation(tool.id, locale);
        const { canonical, languages } = getAlternateLinks(locale, `/compare/${slug}`);

        const title = translation?.name
            ? `${translation.name} — Compare | HyzenPro`
            : `${tool.name} — Compare | HyzenPro`;

        return {
            title,
            description: `Compare ${tool.name} with alternatives. Pricing, features, and reviews.`,
            alternates: { canonical, languages },
        };
    } catch {
        return { title: 'Compare | HyzenPro' };
    }
}

export default async function LocaleCompareSlugPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    return <CompareSlugPageContent slug={slug} />;
}
