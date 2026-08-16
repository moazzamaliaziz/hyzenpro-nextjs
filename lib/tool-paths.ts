import { slugify } from '@/lib/utils';

/** Legacy / vendor typos → canonical directory category slugs */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
    'ai-code-tools': 'ai-coding-tools',
    'ai-chatbot-tools': 'ai-chatbots',
    'ai-chatbots-tools': 'ai-chatbots',
    'ai-audio-tools': 'ai-voice-tools',
    'ai-seo-tools': 'seo-tools',
    'ai-ui-tools': 'ai-ui-generators',
    'ai-subtitle-tools': 'ai-subtitle-generators',
    'ai-website-tools': 'ai-website-builder',
};

export const DEFAULT_PRIMARY_CATEGORY = 'ai-general-tools';

export function normalizeToolSlug(raw: string): string {
    return slugify(raw).slice(0, 120) || 'tool';
}

export function normalizePrimaryCategorySlug(raw: string | null | undefined): string {
    const trimmed = (raw || '').trim().toLowerCase();
    if (!trimmed) {
        return DEFAULT_PRIMARY_CATEGORY;
    }
    return CATEGORY_SLUG_ALIASES[trimmed] || trimmed;
}

export function buildToolCanonicalPath(primaryCategory: string | null | undefined, slug: string): string {
    const category = normalizePrimaryCategorySlug(primaryCategory);
    return `/ai-tools-directory/${category}/${slug}/`;
}

export function buildDefaultToolSeo(name: string, slug: string, primaryCategory: string, shortDescription: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
    const path = buildToolCanonicalPath(primaryCategory, slug);
    return {
        metaTitle: `${name} Review: Features, Pricing & Alternatives`,
        metaDescription: shortDescription.slice(0, 160),
        canonicalUrl: `${baseUrl}${path}`,
        ogTitle: `${name} Review`,
        ogDescription: shortDescription.slice(0, 200),
        noIndex: false,
        focusKeyword: `${name} review`,
    };
}
