import { describe, expect, it } from 'vitest';
import {
    buildToolCanonicalPath,
    CATEGORY_SLUG_ALIASES,
    DEFAULT_PRIMARY_CATEGORY,
    normalizePrimaryCategorySlug,
} from '@/lib/tool-paths';

describe('normalizePrimaryCategorySlug', () => {
    it('maps legacy aliases to canonical directory category slugs', () => {
        expect(normalizePrimaryCategorySlug('ai-code-tools')).toBe('ai-coding-tools');
        expect(normalizePrimaryCategorySlug('ai-chatbot-tools')).toBe('ai-chatbots');
        expect(normalizePrimaryCategorySlug('ai-chatbots-tools')).toBe('ai-chatbots');
        expect(normalizePrimaryCategorySlug('ai-seo-tools')).toBe('seo-tools');
        expect(normalizePrimaryCategorySlug('ai-audio-tools')).toBe('ai-voice-tools');
        expect(normalizePrimaryCategorySlug('ai-ui-tools')).toBe('ai-ui-generators');
        expect(normalizePrimaryCategorySlug('ai-subtitle-tools')).toBe('ai-subtitle-generators');
        expect(normalizePrimaryCategorySlug('ai-website-tools')).toBe('ai-website-builder');
    });

    it('defaults empty, null and undefined to the general category', () => {
        expect(normalizePrimaryCategorySlug('')).toBe(DEFAULT_PRIMARY_CATEGORY);
        expect(normalizePrimaryCategorySlug('   ')).toBe(DEFAULT_PRIMARY_CATEGORY);
        expect(normalizePrimaryCategorySlug(null)).toBe(DEFAULT_PRIMARY_CATEGORY);
        expect(normalizePrimaryCategorySlug(undefined)).toBe(DEFAULT_PRIMARY_CATEGORY);
        expect(DEFAULT_PRIMARY_CATEGORY).toBe('ai-general-tools');
    });

    it('trims, lowercases and passes through already-canonical slugs', () => {
        expect(normalizePrimaryCategorySlug('  AI-CODING-TOOLS  ')).toBe('ai-coding-tools');
        expect(normalizePrimaryCategorySlug('ai-chatbots')).toBe('ai-chatbots');
        expect(normalizePrimaryCategorySlug('seo-tools')).toBe('seo-tools');
    });
});

describe('buildToolCanonicalPath', () => {
    it('builds the canonical /ai-tools-directory/<category>/<slug>/ path', () => {
        expect(buildToolCanonicalPath('ai-coding-tools', 'cursor')).toBe('/ai-tools-directory/ai-coding-tools/cursor/');
        expect(buildToolCanonicalPath('ai-chatbots', 'gpt-4')).toBe('/ai-tools-directory/ai-chatbots/gpt-4/');
    });

    it('normalizes legacy aliases in the generated path', () => {
        expect(buildToolCanonicalPath('ai-code-tools', 'cursor')).toBe('/ai-tools-directory/ai-coding-tools/cursor/');
        expect(buildToolCanonicalPath('ai-chatbot-tools', 'gpt-4')).toBe('/ai-tools-directory/ai-chatbots/gpt-4/');
        expect(buildToolCanonicalPath('ai-seo-tools', 'ahrefs')).toBe('/ai-tools-directory/seo-tools/ahrefs/');
    });

    it('falls back to ai-general-tools for empty, null and undefined categories', () => {
        expect(buildToolCanonicalPath('', 'mystery-tool')).toBe('/ai-tools-directory/ai-general-tools/mystery-tool/');
        expect(buildToolCanonicalPath(null, 'mystery-tool')).toBe('/ai-tools-directory/ai-general-tools/mystery-tool/');
        expect(buildToolCanonicalPath(undefined, 'mystery-tool')).toBe('/ai-tools-directory/ai-general-tools/mystery-tool/');
    });

    it('always emits the directory prefix and a trailing slash', () => {
        const path = buildToolCanonicalPath('ai-writing-tools', 'copy-ai');
        expect(path.startsWith('/ai-tools-directory/')).toBe(true);
        expect(path.endsWith('/')).toBe(true);
        expect(path).toBe('/ai-tools-directory/ai-writing-tools/copy-ai/');
    });

    it('keeps the alias map scoped to known legacy slugs', () => {
        expect(Object.keys(CATEGORY_SLUG_ALIASES)).not.toContain('ai-coding-tools');
        expect(CATEGORY_SLUG_ALIASES['ai-seo-tools']).toBe('seo-tools');
    });
});