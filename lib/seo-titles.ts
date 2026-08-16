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

function normalizeTitle(value: string) {
    return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

export function stripTitleBrand(value: string) {
    let title = normalizeTitle(value);

    while (new RegExp(`\\s*\\|\\s*${BRAND_NAME}\\s*$`, 'i').test(title)) {
        title = title.replace(new RegExp(`\\s*\\|\\s*${BRAND_NAME}\\s*$`, 'i'), '').trim();
    }

    return title;
}

export function getSerpFriendlyTitle(slug: string | undefined, fallbackTitle: string) {
    if (slug && SERP_TITLE_OVERRIDES[slug]) {
        return SERP_TITLE_OVERRIDES[slug];
    }

    return stripTitleBrand(fallbackTitle);
}

export function getMetadataBrandName(siteName: string) {
    return siteName.split('-')[0]?.trim() || BRAND_NAME;
}
