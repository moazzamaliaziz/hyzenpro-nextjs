import { describe, expect, it } from 'vitest';
import { resolveSiteLogoUrl, DEFAULT_SITE_LOGO_URL } from '@/lib/branding';
import { buildToolMetaDescription } from '@/lib/seo-titles';
import { buildToolPageMeta, normalizePublicFields } from '@/lib/tool-page';

describe('site logo resolution', () => {
    it('serves a same-origin uploaded logo as a relative path', () => {
        // Absolute same-origin URLs make next/image fetch the site over the
        // public internet; that loopback fails on Hostinger and the logo vanishes.
        expect(resolveSiteLogoUrl('https://hyzenpro.com/media/abc123/logo.png'))
            .toBe('/media/abc123/logo.png');
        expect(resolveSiteLogoUrl('https://www.hyzenpro.com/media/abc/logo.png?v=2'))
            .toBe('/media/abc/logo.png?v=2');
    });

    it('leaves genuinely external logo hosts alone', () => {
        const cdn = 'https://media.hyzenpro.com/media/2026/logo.png';
        expect(resolveSiteLogoUrl(cdn)).toBe(cdn);
    });

    it('falls back to the default for empty, blank and legacy values', () => {
        expect(resolveSiteLogoUrl('')).toBe(DEFAULT_SITE_LOGO_URL);
        expect(resolveSiteLogoUrl('   ')).toBe(DEFAULT_SITE_LOGO_URL);
        expect(resolveSiteLogoUrl(null)).toBe(DEFAULT_SITE_LOGO_URL);
        expect(resolveSiteLogoUrl('/images/logo.png')).toBe(DEFAULT_SITE_LOGO_URL);
    });

    it('keeps an already-relative path as-is', () => {
        expect(resolveSiteLogoUrl('/media/abc/logo.png')).toBe('/media/abc/logo.png');
    });
});

describe('auto-generated tool meta description', () => {
    const reviewedLabel = 'June 2026';

    it('leads with the tool summary so pages are not all identical', () => {
        const out = buildToolMetaDescription({
            displayName: 'Submajic',
            shortDescription: 'AI-powered subtitle generation with viral-style captions.',
            reviewedLabel,
        });
        expect(out).toContain('Submajic');
        expect(out).toContain('subtitle generation');
        expect(out).toContain('June 2026');
    });

    it('never leaks another tool feature name into the generic copy', () => {
        const out = buildToolMetaDescription({ displayName: 'Anything', reviewedLabel });
        expect(out).not.toContain('Magic Clips');
        expect(out).toContain('Honest Anything review.');
    });

    it('stays within the ~160 character SERP budget', () => {
        const out = buildToolMetaDescription({
            displayName: 'Some Tool',
            shortDescription: 'x'.repeat(400),
            reviewedLabel,
        });
        expect(out.length).toBeLessThanOrEqual(160);
        expect(out).toContain('Updated June 2026.');
    });
});

const baseTool = {
    name: 'Submajic',
    slug: 'submajic',
    shortDescription: 'AI subtitles.',
    longDescription: '<p>Long</p>',
    websiteUrl: 'https://example.com',
    pricingType: 'paid',
    primaryCategory: 'ai-video-tools',
    features: [],
    pros: ['Fast'],
    cons: ['Pricey'],
    rating: 4.4,
    updatedAt: new Date('2026-06-01'),
};

describe('public submission field visibility', () => {
    it('treats every field as visible when no toggles were ever saved', () => {
        const fields = normalizePublicFields(undefined);
        expect(Object.values(fields).every(Boolean)).toBe(true);
    });

    it('only hides the field explicitly switched off', () => {
        const fields = normalizePublicFields({ publicFields: { screenshots: false } });
        expect(fields.screenshots).toBe(false);
        expect(fields.faq).toBe(true);
    });

    it('hides a disabled section from the built tool page', () => {
        const screenshots = [{
            url: 'https://example.com/a.png',
            alt: 'Submajic editor',
            caption: 'The editor',
            width: 1200,
            height: 800,
        }];

        const shown = buildToolPageMeta({ ...baseTool, meta: { screenshots } } as any);
        expect(shown.screenshots?.length).toBe(1);

        const hidden = buildToolPageMeta({
            ...baseTool,
            meta: { screenshots, publicFields: { screenshots: false } },
        } as any);
        expect(hidden.screenshots).toEqual([]);
        // Disabling one field must not take the others down with it.
        expect(hidden.faq?.length).toBeGreaterThan(0);
    });
});

describe('submitted social links reach the tool page', () => {
    it('maps the submission { twitter, linkedin } shape onto socialLinks', () => {
        const page = buildToolPageMeta({
            ...baseTool,
            meta: {
                socials: {
                    twitter: 'https://twitter.com/submajic',
                    linkedin: 'https://linkedin.com/company/submajic',
                    youtube: '',
                },
            },
        } as any);

        const platforms = (page.socialLinks || []).map((s) => s.platform).sort();
        expect(platforms).toEqual(['linkedin', 'twitter']);
        expect(page.socialLinks?.find((s) => s.platform === 'twitter')?.url)
            .toBe('https://twitter.com/submajic');
    });

    it('still honours an explicit socialLinks array', () => {
        const page = buildToolPageMeta({
            ...baseTool,
            meta: { socialLinks: [{ platform: 'github', url: 'https://github.com/x' }] },
        } as any);
        expect(page.socialLinks?.map((s) => s.platform)).toEqual(['github']);
    });
});
