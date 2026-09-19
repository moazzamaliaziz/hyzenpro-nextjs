import { decodeHtmlEntities } from '@/lib/utils';

const BRAND_NAME = 'HyzenPro';

const SERP_TITLE_OVERRIDES: Record<string, string> = {
    'animaker-review': 'Animaker Review 2026: AI Video Maker Tested',
    'clipchamp-review': 'Clipchamp Review 2026: Is It Worth It?',
    'veed-io-review': 'VEED.io Review 2026: Pricing, Pros & Cons',
    'liquid-ai-review': 'Liquid AI Review: Local AI Models Explained',
    'zubtitle-review': 'Zubtitle Review 2026: AI Caption Tool Tested',
    'kapwing-review': 'Kapwing Review 2026: AI Video Editor Tested',
    'replit-ai-agent-review': 'Replit AI Agent Review 2026: Features & Pricing',
    'leonardo-ai-vs-midjourney': 'Leonardo AI vs Midjourney: Which Is Better?',
    'midjourney-vs-dall-e-3-vs-stable-diffusion': 'Midjourney vs DALL-E 3 vs Stable Diffusion',
};

export function normalizeTitle(value: unknown) {
    return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

export function stripTitleBrand(value: unknown) {
    let title = normalizeTitle(value);

    while (new RegExp(`\\s*\\|\\s*${BRAND_NAME}\\s*$`, 'i').test(title)) {
        title = title.replace(new RegExp(`\\s*\\|\\s*${BRAND_NAME}\\s*$`, 'i'), '').trim();
    }

    return title;
}

export function getSerpFriendlyTitle(slug: string | undefined, fallbackTitle: string | undefined) {
    if (slug && SERP_TITLE_OVERRIDES[slug]) {
        return SERP_TITLE_OVERRIDES[slug];
    }

    return stripTitleBrand(fallbackTitle ?? '');
}

export function getMetadataBrandName(siteName: string) {
    return siteName.split('-')[0]?.trim() || BRAND_NAME;
}

const META_DESCRIPTION_MAX = 160;

// An approved submission arrives with no hand-written SEO, so the auto-generated
// description is what actually ships. Leading with the tool's own summary keeps
// each page distinct instead of every tool sharing one boilerplate sentence.
export function buildToolMetaDescription(input: {
    displayName: string;
    shortDescription?: string | null;
    reviewedLabel: string;
}): string {
    const summary = input.shortDescription?.trim().replace(/\s+/g, ' ');
    const lead = summary
        ? `${input.displayName}: ${summary.replace(/\.+$/, '')}.`
        : `Honest ${input.displayName} review.`;
    const tail = ` Pricing, real pros and cons, and top alternatives. Updated ${input.reviewedLabel}.`;

    const maxLead = META_DESCRIPTION_MAX - tail.length;
    if (maxLead <= 0) return lead;

    return (lead.length > maxLead ? `${lead.slice(0, maxLead - 1).trimEnd()}…` : lead) + tail;
}
