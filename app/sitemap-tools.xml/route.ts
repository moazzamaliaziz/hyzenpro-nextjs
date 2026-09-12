import prisma from '@/lib/prisma';
import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

const EXCLUDED_EMPTY_CATEGORIES = new Set([
    'ai-subtitle-generators',
    'ai-ui-generators',
    'text-to-speech',
    'copywriting',
    'avatar-generators',
    'ai-agentic-tools',
]);

export async function GET() {
    const baseUrl = getBaseUrl();
    let tools: { slug: string; primaryCategory: string | null; updatedAt: Date }[] = [];
    let categories: { id: string; slug: string; updatedAt: Date }[] = [];
    try {
        ([tools, categories] = await Promise.all([
            prisma.tool.findMany({
                where: { status: 'published' },
                select: { slug: true, primaryCategory: true, updatedAt: true },
            }),
            prisma.category.findMany({
                select: { id: true, slug: true, updatedAt: true },
            }),
        ]));
    } catch (error) {
        console.error('[Sitemap] Database unavailable, serving empty sitemap:', error);
    }

    const categoryEntries = categories
        .filter((category) => !EXCLUDED_EMPTY_CATEGORIES.has(category.slug))
        .filter((category) =>
            tools.some((tool) => tool.primaryCategory === category.slug),
        )
        .map((category) => ({
            url: `${baseUrl}/ai-tools-directory/${category.slug}/`,
            lastModified: category.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            locales: LOCALES,
            defaultLocale: DEFAULT_LOCALE,
        }));

    const toolEntries = tools.map((tool) => ({
        url: `${baseUrl}/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}/`,
        lastModified: tool.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        locales: LOCALES,
        defaultLocale: DEFAULT_LOCALE,
    }));

    return xmlResponse(renderSitemap([...categoryEntries, ...toolEntries]));
}
