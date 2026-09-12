import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

export async function GET() {
    const baseUrl = getBaseUrl();

    let personaPages: { slug: string; updatedAt: Date }[] = [];
    try {
        personaPages = await prisma.personaPage.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true },
        });
    } catch (error) {
        console.error('[Sitemap] Database unavailable, serving empty sitemap:', error);
    }

    return xmlResponse(
        renderSitemap(
            personaPages.map((page) => ({
                url: `${baseUrl}/ai-tools-for/${page.slug}/`,
                lastModified: page.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
                locales: LOCALES,
                defaultLocale: DEFAULT_LOCALE,
            })),
        ),
    );
}
