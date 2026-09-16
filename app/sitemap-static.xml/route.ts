import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

// Only these static paths have a localized counterpart under app/[locale]/.
const LOCALIZED_STATIC_PATHS = new Set([
    '/',
    '/ai-tools-directory/',
    '/find-tools/',
    '/blog/',
    '/contact/',
    '/compare/tools/',
    '/compare/opus-4-8-vs-codex-5-5-pro/',
    '/compare/sonnet-5-vs-glm-5-2/',
    '/compare/claude-fable-5-vs-claude-mythos-5/',
]);

const staticPages = [
    { path: '/', lastModified: '2026-06-09', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/ai-tools-directory/', lastModified: '2026-06-09', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/find-tools/', lastModified: '2026-06-10', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/blog/', lastModified: '2026-06-10', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/about-us/', lastModified: '2026-06-07T09:00:00.000Z', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/contact/', lastModified: '2026-06-07T09:10:00.000Z', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/submit-ai-tool/', lastModified: '2026-06-07T09:20:00.000Z', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/privacy-policy/', lastModified: '2026-06-07T09:30:00.000Z', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms-of-service/', lastModified: '2026-06-07T09:40:00.000Z', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/how-we-test/', lastModified: '2026-06-11', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/compare/tools/', lastModified: '2026-07-05', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/compare/opus-4-8-vs-codex-5-5-pro/', lastModified: '2026-07-05', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/compare/sonnet-5-vs-glm-5-2/', lastModified: '2026-07-05', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/compare/claude-fable-5-vs-claude-mythos-5/', lastModified: '2026-07-05', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/advertise/', lastModified: '2026-06-11', changeFrequency: 'monthly' as const, priority: 0.5 },
];

export async function GET() {
    const baseUrl = getBaseUrl();

    return xmlResponse(
        renderSitemap(
            staticPages.map((page) => {
                const enUrl = `${baseUrl}${page.path}`;
                const hasLocalizedRoute = LOCALIZED_STATIC_PATHS.has(page.path);
                return {
                    url: enUrl,
                    lastModified: page.lastModified,
                    changeFrequency: page.changeFrequency,
                    priority: page.priority,
                    locales: hasLocalizedRoute ? LOCALES : undefined,
                    defaultLocale: hasLocalizedRoute ? DEFAULT_LOCALE : undefined,
                };
            }),
        ),
    );
}