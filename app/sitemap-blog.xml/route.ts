import prisma from '@/lib/prisma';
import { getBlogPostPath } from '@/lib/blog-seo';
import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

export async function GET() {
    const baseUrl = getBaseUrl();
    const posts = await prisma.post.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
    });

    return xmlResponse(
        renderSitemap(
            posts.map((post) => ({
                url: `${baseUrl}${getBlogPostPath(post.slug)}`,
                lastModified: post.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.7,
                locales: LOCALES,
                defaultLocale: DEFAULT_LOCALE,
            })),
        ),
    );
}
