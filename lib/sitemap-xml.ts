export type SitemapEntry = {
    url: string;
    lastModified: string | Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    locales?: readonly string[];
    defaultLocale?: string;
};

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatDateToIso(value: string | Date) {
    return new Date(value).toISOString();
}

export function xmlResponse(xml: string) {
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}

export function renderSitemap(entries: SitemapEntry[]) {
    const urls = entries
        .map((entry) => {
            let hreflangLines = '';
            if (entry.locales && entry.locales.length > 0) {
                const defaultLocale = entry.defaultLocale || 'en';
                const path = new URL(entry.url).pathname;
                const pathWithoutSlash = path.endsWith('/') ? path.slice(0, -1) : path;

                for (const locale of entry.locales) {
                    const localePath = locale === defaultLocale
                        ? pathWithoutSlash
                        : `/${locale}${pathWithoutSlash}`;
                    const localeUrl = `${new URL(entry.url).origin}${localePath}/`;
                    hreflangLines += `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(localeUrl)}" />`;
                }
                const xDefaultUrl = `${new URL(entry.url).origin}${pathWithoutSlash}/`;
                hreflangLines += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefaultUrl)}" />`;
            }

            return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${formatDateToIso(entry.lastModified)}</lastmod>
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${typeof entry.priority === 'number' ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}${hreflangLines}
  </url>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

export function renderSitemapIndex(sitemaps: Array<{ url: string; lastModified: string | Date }>) {
    const items = sitemaps
        .map((sitemap) => `  <sitemap>
    <loc>${escapeXml(sitemap.url)}</loc>
    <lastmod>${formatDateToIso(sitemap.lastModified)}</lastmod>
  </sitemap>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}
