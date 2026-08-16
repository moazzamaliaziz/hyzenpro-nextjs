import {
    generateBreadcrumbSchema,
    generateFaqSchema,
    generateToolReviewSchema,
    generateToolSchema,
} from '@/lib/structured-data';
import { buildToolPageMeta, getToolOverallRating } from '@/lib/tool-page';
import { buildToolCanonicalPath } from '@/lib/tool-paths';

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

export default async function Head({ params }: Props) {
    const { slug, category } = await params;

    try {
        const { default: prisma } = await import('@/lib/prisma');
        const tool = await prisma.tool.findUnique({
            where: { slug },
            include: { categories: true },
        });

        if (!tool || tool.status !== 'published') {
            return null;
        }

        const pageMeta = buildToolPageMeta(tool as any, [], tool.categories as any);
        const displayName = pageMeta.displayName || tool.name;
        const displayLogo = pageMeta.displayLogo || tool.logo;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
        const canonicalPath = buildToolCanonicalPath(tool.primaryCategory || category, tool.slug);
        const pageUrl = `${baseUrl}${canonicalPath}`;
        const categoryName = tool.categories[0]?.name || category.replace(/-/g, ' ');
        const overallRating = getToolOverallRating(tool as any, pageMeta);
        const schemaBlocks: Array<Record<string, unknown>> = [
            generateToolSchema({ ...(tool as any), name: displayName, logo: displayLogo } as any, {
                pageUrl,
                toolPage: pageMeta,
                overallRating,
                reviewCount: pageMeta.reviewCount,
            }),
            generateBreadcrumbSchema([
                { name: 'Home', url: baseUrl },
                { name: 'AI Tools', url: `${baseUrl}/ai-tools-directory/` },
                { name: categoryName, url: `${baseUrl}/ai-tools-directory/${tool.primaryCategory || category}/` },
                { name: tool.name, url: pageUrl },
            ]),
        ];

        if ((pageMeta.faq || []).length > 0) {
            schemaBlocks.push(generateFaqSchema(pageMeta.faq || []));
        }

        if (pageMeta.ratingSummary) {
            schemaBlocks.push(generateToolReviewSchema({
                toolName: displayName,
                pageUrl,
                rating: overallRating,
                summary: pageMeta.ratingSummary,
            }));
        }

        return (
            <>
                {schemaBlocks.map((schema, index) => (
                    <script
                        key={index}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                ))}
            </>
        );
    } catch {
        return null;
    }
}
