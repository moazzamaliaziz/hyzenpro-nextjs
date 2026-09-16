import { getLiveQuizConfigs } from '@/lib/quiz-data';
import { renderSitemap, xmlResponse } from '@/lib/sitemap-xml';
import { getBaseUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = getBaseUrl();
    const lastModified = '2026-06-10';

    return xmlResponse(
        renderSitemap(
            getLiveQuizConfigs().map((config) => ({
                url: `${baseUrl}/find-tools/${config.category}/`,
                lastModified,
                changeFrequency: 'weekly' as const,
                priority: 0.75,
            })),
        ),
    );
}