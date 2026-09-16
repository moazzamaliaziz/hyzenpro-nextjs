import { describe, expect, it } from 'vitest';
import { renderSitemap, renderSitemapIndex, xmlResponse, type SitemapEntry } from '@/lib/sitemap-xml';

const EPOCH_ISO = new Date(0).toISOString();

describe('renderSitemap', () => {
    it('does not throw when lastModified is undefined and still emits a valid urlset', () => {
        const entries = [
            { url: 'https://hyzenpro.com/', lastModified: undefined },
        ] as unknown as SitemapEntry[];

        expect(() => renderSitemap(entries)).not.toThrow();

        const xml = renderSitemap(entries);
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
        expect(xml).toContain('<loc>https://hyzenpro.com/</loc>');
        expect(xml).toContain(`<lastmod>${EPOCH_ISO}</lastmod>`);
        expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    });

    it('renders one url entry per item with optional changefreq and priority', () => {
        const xml = renderSitemap([
            {
                url: 'https://hyzenpro.com/blog/',
                lastModified: '2026-06-10',
                changeFrequency: 'daily',
                priority: 0.8,
            },
        ]);

        expect(xml).toContain('<loc>https://hyzenpro.com/blog/</loc>');
        expect(xml).toContain('<lastmod>2026-06-10T00:00:00.000Z</lastmod>');
        expect(xml).toContain('<changefreq>daily</changefreq>');
        expect(xml).toContain('<priority>0.8</priority>');
    });

    it('emits hreflang alternates only when locales are provided', () => {
        const withLocales = renderSitemap([
            {
                url: 'https://hyzenpro.com/find-tools/',
                lastModified: '2026-06-10',
                locales: ['en', 'es'],
                defaultLocale: 'en',
            },
        ]);

        expect(withLocales).toContain('hreflang="en" href="https://hyzenpro.com/find-tools/"');
        expect(withLocales).toContain('hreflang="es" href="https://hyzenpro.com/es/find-tools/"');
        expect(withLocales).toContain('hreflang="x-default" href="https://hyzenpro.com/find-tools/"');

        const withoutLocales = renderSitemap([
            { url: 'https://hyzenpro.com/about-us/', lastModified: '2026-06-07' },
        ]);
        expect(withoutLocales).not.toContain('xhtml:link');
        expect(withoutLocales).not.toContain('hreflang');
    });

    it('escapes XML special characters in urls', () => {
        const xml = renderSitemap([
            { url: 'https://hyzenpro.com/search/?a=1&b=2', lastModified: '2026-06-10' },
        ]);
        expect(xml).toContain('<loc>https://hyzenpro.com/search/?a=1&amp;b=2</loc>');
    });

    it('produces a urlset with no url children for an empty entry list', () => {
        const xml = renderSitemap([]);
        expect(xml).toContain('<urlset');
        expect(xml).toContain('</urlset>');
        expect(xml).not.toContain('<url>');
    });
});

describe('renderSitemapIndex', () => {
    it('lists child sitemaps and tolerates an undefined lastModified', () => {
        const xml = renderSitemapIndex([
            { url: 'https://hyzenpro.com/sitemap-static.xml', lastModified: new Date('2026-06-10T00:00:00.000Z') },
            { url: 'https://hyzenpro.com/sitemap-tools.xml', lastModified: undefined as unknown as string },
        ]);

        expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(xml).toContain('<loc>https://hyzenpro.com/sitemap-static.xml</loc>');
        expect(xml).toContain(`<lastmod>${EPOCH_ISO}</lastmod>`);
        expect(xml).toContain('</sitemapindex>');
    });
});

describe('xmlResponse', () => {
    it('returns an XML response with the sitemap content type', () => {
        const response = xmlResponse('<urlset></urlset>');
        expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
        expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
    });
});