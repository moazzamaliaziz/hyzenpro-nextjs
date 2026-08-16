import type { Metadata } from 'next';
import { getAllComparisonSlugs } from '@/lib/compare-data';
import CompareSlugPageContent from '@/components/pages/CompareSlugPageContent';

export const revalidate = 86400;

type ComparePageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
    const { slug } = await params;
    const { getComparisonBySlug } = await import('@/lib/compare-data');
    const comparison = getComparisonBySlug(slug);
    if (!comparison) return {};
    const { seo } = comparison;
    return {
        title: seo.title,
        description: seo.metaDescription,
        keywords: seo.keywords,
        alternates: { canonical: seo.canonical },
        openGraph: {
            title: seo.title,
            description: seo.metaDescription,
            url: seo.canonical,
            siteName: 'HyzenPro',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.title,
            description: seo.metaDescription,
        },
    };
}

export default async function CompareSlugPage({ params }: ComparePageProps) {
    const { slug } = await params;
    return <CompareSlugPageContent slug={slug} />;
}
