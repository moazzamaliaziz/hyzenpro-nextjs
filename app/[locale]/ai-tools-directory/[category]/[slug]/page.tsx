import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ToolPageContent from '@/components/pages/ToolPageContent';
import prisma from '@/lib/prisma';
import { getAlternateLinks, getToolTranslation } from '@/lib/locale-helpers';
import { buildToolPageMeta } from '@/lib/tool-page';
import { buildToolCanonicalPath } from '@/lib/tool-paths';
import { getSerpFriendlyTitle } from '@/lib/seo-titles';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
    const { slug, category, locale } = await params;

    try {
        const tool = await prisma.tool.findUnique({ where: { slug } });
        if (!tool) return { title: 'Tool Not Found | HyzenPro' };

        const translation = await getToolTranslation(tool.id, locale);
        const pageMeta = buildToolPageMeta(tool as any);
        const seo = tool.seo as any;
        const canonicalPath = buildToolCanonicalPath(tool.primaryCategory || category, tool.slug);

        const displayName = translation?.name || pageMeta.displayName || tool.name;
        const currentYear = new Date().getFullYear();

        const title = translation?.metaTitle
            || getSerpFriendlyTitle(tool.slug, `${displayName} Review ${currentYear}: Pricing & Alternatives`);

        const description = translation?.metaDescription
            || `Honest ${displayName} review. Pricing, real pros and cons, and top alternatives.`;

        const { canonical, languages } = getAlternateLinks(locale, canonicalPath);

        return {
            title,
            description,
            alternates: { canonical: seo?.canonicalUrl || canonical, languages },
            robots: { index: !(seo?.noIndex === true), follow: !(seo?.noIndex === true) },
            openGraph: {
                url: seo?.canonicalUrl || canonical,
                title,
                description,
                type: 'article',
                locale: locale === 'en' ? 'en_US' : locale,
            },
        };
    } catch {
        return { title: 'Tool Not Found | HyzenPro' };
    }
}

export default async function LocaleToolPage({
    params,
}: {
    params: Promise<{ locale: string; category: string; slug: string }>;
}) {
    const { locale, category, slug } = await params;
    setRequestLocale(locale);

    return <ToolPageContent category={category} slug={slug} />;
}
