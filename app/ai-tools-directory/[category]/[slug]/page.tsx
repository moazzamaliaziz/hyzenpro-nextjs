import type { Metadata } from 'next';
import ToolPageContent from '@/components/pages/ToolPageContent';
import prisma from '@/lib/prisma';
import { getSerpFriendlyTitle, stripTitleBrand } from '@/lib/seo-titles';
import {
    buildToolPageMeta,
} from '@/lib/tool-page';
import {
    buildPreferredToolCanonicalPath,
    normalizePrimaryCategorySlug,
    resolveToolCanonicalUrl,
} from '@/lib/tool-paths';

export const revalidate = 86400;
export const dynamicParams = true;

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, category } = await params;

    try {
        const tool = await prisma.tool.findUnique({
            where: { slug },
        });

        if (!tool) {
            return { title: 'Tool Not Found | HyzenPro' };
        }

        const pageMeta = buildToolPageMeta(tool as any);
        const displayName = pageMeta.displayName || tool.name;
        const reviewedLabel = pageMeta.lastReviewedDate || new Date(tool.updatedAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
        const currentYear = new Date().getFullYear();
        const canonicalPath = buildPreferredToolCanonicalPath(tool.primaryCategory || category, tool.slug);
        const generatedTitle = `${displayName} Review ${currentYear}: Pricing & Alternatives`;
        const generatedDescription = `Honest ${displayName} review. Pricing breakdown, Magic Clips notes, real pros and cons, review sources, and top alternatives. Updated ${reviewedLabel}.`;
        const seo = tool.seo as Record<string, unknown> | null;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
        const openGraphImage = `${baseUrl}${canonicalPath}opengraph-image`;
        const replaceBrandName = (value: unknown) => {
            if (typeof value !== 'string' || !value.trim()) {
                return undefined;
            }

            return tool.name !== displayName ? value.split(tool.name).join(displayName) : value;
        };
        const seoTitle = replaceBrandName(seo?.metaTitle);
        const seoDescription = replaceBrandName(seo?.metaDescription);
        const seoOgTitle = replaceBrandName(seo?.ogTitle);
        const seoOgDescription = replaceBrandName(seo?.ogDescription);

        const canonicalUrl = resolveToolCanonicalUrl(
            seo?.canonicalUrl,
            `${baseUrl}${canonicalPath}`,
        );
        const isHermesDirectoryPage = tool.slug === 'hermes-agent';
        const finalTitle = isHermesDirectoryPage
            ? 'Hermes Agent Features, Pricing & Alternatives'
            : getSerpFriendlyTitle(tool.slug, seoTitle || generatedTitle);
        const finalDescription = isHermesDirectoryPage
            ? 'Compare Hermes Agent features, pricing, setup, memory, and alternatives for browser-based AI automation.'
            : (seoDescription || generatedDescription);
        const finalOgTitle = isHermesDirectoryPage
            ? 'Hermes Agent Features, Pricing & Alternatives'
            : (seoOgTitle ? stripTitleBrand(seoOgTitle) : generatedTitle);
        const finalOgDescription = isHermesDirectoryPage
            ? finalDescription
            : (seoOgDescription || generatedDescription);

        return {
            title: finalTitle,
            description: finalDescription,
            alternates: {
                canonical: canonicalUrl,
            },
            robots: {
                index: !(seo?.noIndex === true),
                follow: !(seo?.noIndex === true),
            },
            openGraph: {
                url: canonicalUrl,
                title: finalOgTitle,
                description: finalOgDescription,
                type: 'article',
                images: [openGraphImage],
            },
            twitter: {
                card: 'summary_large_image',
                title: finalOgTitle,
                description: finalOgDescription,
                images: [openGraphImage],
            },
            keywords: [
                `${displayName} review`,
                `${displayName} pricing`,
                `${displayName} features`,
                `${displayName} alternatives`,
                `${displayName} FAQ`,
            ],
        };
    } catch {
        return { title: 'Tool Not Found | HyzenPro' };
    }
}

export async function generateStaticParams() {
    try {
        const tools = await prisma.tool.findMany({
            where: { status: 'published' },
            select: { slug: true, primaryCategory: true },
        });

        return tools.map((tool) => ({
            category: normalizePrimaryCategorySlug(tool.primaryCategory),
            slug: tool.slug,
        }));
    } catch {
        return [];
    }
}

export default async function ToolPage({ params }: Props) {
    const { category, slug } = await params;
    return <ToolPageContent category={category} slug={slug} />;
}
