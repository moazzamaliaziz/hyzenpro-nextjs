import { describe, expect, it } from 'vitest';
import { toIsoOrFallback, toIsoOrNull } from '@/lib/safe-date';
import { buildToolCanonicalPath, normalizePrimaryCategorySlug } from '@/lib/tool-paths';
import { renderSitemap } from '@/lib/sitemap-xml';

const EPOCH_ISO = new Date(0).toISOString();

describe('safe-date', () => {
    it('never throws and returns the fallback for undefined, null, invalid strings and NaN', () => {
        for (const value of [undefined, null, 'not-a-date', NaN]) {
            expect(() => toIsoOrFallback(value)).not.toThrow();
            expect(toIsoOrFallback(value)).toBe(EPOCH_ISO);
        }
    });

    it('returns the ISO string for a valid Date', () => {
        expect(toIsoOrFallback(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01T00:00:00.000Z');
    });

    it('returns null from toIsoOrNull for undefined', () => {
        expect(toIsoOrNull(undefined)).toBeNull();
    });
});

describe('tool-paths', () => {
    it('maps legacy category slugs to canonical directory slugs', () => {
        expect(normalizePrimaryCategorySlug('ai-code-tools')).toBe('ai-coding-tools');
        expect(normalizePrimaryCategorySlug('ai-chatbot-tools')).toBe('ai-chatbots');
        expect(normalizePrimaryCategorySlug('ai-seo-tools')).toBe('seo-tools');
        expect(normalizePrimaryCategorySlug('')).toBe('ai-general-tools');
        expect(normalizePrimaryCategorySlug(null)).toBe('ai-general-tools');
    });

    it('builds the canonical tool path with the normalized category', () => {
        expect(buildToolCanonicalPath('ai-code-tools', 'foo')).toBe('/ai-tools-directory/ai-coding-tools/foo/');
    });
});

describe('sitemap-xml', () => {
    it('tolerates an undefined lastModified and still emits a urlset', () => {
        const entries = [{ url: 'https://x/y/', lastModified: undefined as any }];
        expect(() => renderSitemap(entries)).not.toThrow();
        expect(renderSitemap(entries)).toContain('<urlset');
    });
});