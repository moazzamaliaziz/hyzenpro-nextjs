import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getAlternateLinks, getCategoryTranslation } from '@/lib/locale-helpers';
import { stripTitleBrand } from '@/lib/seo-titles';
import CategoryPageContent from '@/components/pages/CategoryPageContent';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
    const { category, locale } = await params;

    try {
        const cat = await prisma.category.findUnique({ where: { slug: category } });
        if (!cat) return { title: 'Category Not Found' };

        const translation = await getCategoryTranslation(cat.id, locale);
        const seo = cat.seo as any;

        const title = translation?.name
            ? `Best ${translation.name} — HyzenPro`
            : seo?.metaTitle
                ? stripTitleBrand(seo.metaTitle)
                : `Best ${cat.name}`;

        const description = translation?.description || seo?.metaDescription || cat.description || '';

        const { canonical, languages } = getAlternateLinks(locale, `/ai-tools-directory/${category}`);

        return {
            title,
            description,
            alternates: { canonical, languages },
            openGraph: {
                url: canonical,
                title,
                description,
                locale: locale === 'en' ? 'en_US' : locale,
            },
        };
    } catch {
        return { title: 'Category Not Found' };
    }
}

export default async function LocaleCategoryPage({
    params,
}: {
    params: Promise<{ locale: string; category: string }>;
}) {
    const { locale, category } = await params;
    setRequestLocale(locale);

    return <CategoryPageContent category={category} />;
}
