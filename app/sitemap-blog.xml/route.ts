import { getBlogInventory, type BlogPostSummary } from '@/lib/blog-query';
import { getBlogPostPath } from '@/lib/blog-seo';
import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

export async function GET() {
    const baseUrl = getBaseUrl();
    let posts: BlogPostSummary[] = [];
    try {
        posts = await getBlogInventory();
    } catch (error) {
        console.error('[Sitemap] Database unavailable, serving empty sitemap:', error);
    }

    return xmlResponse(
        renderSitemap(
            posts.map((post) => ({
                url: `${baseUrl}${getBlogPostPath(post.slug)}`,
                lastModified: new Date(post.updatedAt || post.publishedAt || Date.now()),
                changeFrequency: 'weekly',
                priority: 0.7,
                locales: LOCALES,
                defaultLocale: DEFAULT_LOCALE,
            })),
        ),
    );
}