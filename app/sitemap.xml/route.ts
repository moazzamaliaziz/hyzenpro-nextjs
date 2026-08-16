import { getBaseUrl } from '@/lib/utils';
import { renderSitemapIndex, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = getBaseUrl();
    const lastModified = new Date();

    return xmlResponse(
        renderSitemapIndex([
            { url: `${baseUrl}/sitemap-static.xml`, lastModified },
            { url: `${baseUrl}/sitemap-tools.xml`, lastModified },
            { url: `${baseUrl}/sitemap-blog.xml`, lastModified },
            { url: `${baseUrl}/sitemap-matchers.xml`, lastModified },
            { url: `${baseUrl}/sitemap-personas.xml`, lastModified },
        ]),
    );
}
