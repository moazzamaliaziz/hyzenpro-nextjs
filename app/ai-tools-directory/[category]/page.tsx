import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { stripTitleBrand } from '@/lib/seo-titles';
import { getBaseUrl } from '@/lib/utils';
import CategoryPageContent from '@/components/pages/CategoryPageContent';

export const revalidate = 86400;

interface Props {
    params: Promise<{ category: string }>;
}

const NOINDEX_EMPTY_CATEGORIES = new Set([
    'ai-subtitle-generators',
    'ai-ui-generators',
    'text-to-speech',
    'copywriting',
    'avatar-generators',
    'ai-agentic-tools',
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    try {
        const cat = await prisma.category.findUnique({ where: { slug: category } });
        if (!cat) return { title: 'Category Not Found' };
        const seo = cat.seo as any;
        const canonicalUrl = `${getBaseUrl()}/ai-tools-directory/${category}/`;
        const ogTitle = seo?.metaTitle ? stripTitleBrand(seo.metaTitle) : `Best ${cat.name}`;
        const ogDescription = seo?.metaDescription || cat.description || `Browse the best ${cat.name.toLowerCase()} with reviews and comparisons.`;
        const toolCount = await prisma.tool.count({
            where: {
                status: 'published',
                OR: [
                    { primaryCategory: category },
                    { categoryIds: { has: cat.id } },
                ],
            },
        });
        const shouldNoIndex = NOINDEX_EMPTY_CATEGORIES.has(category) || toolCount === 0;
        return {
            title: ogTitle,
            description: ogDescription,
            robots: {
                index: !shouldNoIndex,
                follow: true,
            },
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                url: canonicalUrl,
                title: ogTitle,
                description: ogDescription,
            },
        };
    } catch {
        return { title: 'Category Not Found' };
    }
}

export async function generateStaticParams() {
    try {
        const categories = await prisma.category.findMany({
            select: { slug: true },
        });
        return categories.map((c: any) => ({ category: c.slug }));
    } catch {
        return [];
    }
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    return <CategoryPageContent category={category} />;
}
