import { getLiveQuizConfigs } from '@/lib/quiz-data';
import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

export async function GET() {
    const baseUrl = getBaseUrl();
    const lastModified = '2026-06-10';

    return xmlResponse(
        renderSitemap(
            getLiveQuizConfigs().map((config) => ({
                url: `${baseUrl}/find-tools/${config.category}/`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.75,
                locales: LOCALES,
                defaultLocale: DEFAULT_LOCALE,
            })),
        ),
    );
}
