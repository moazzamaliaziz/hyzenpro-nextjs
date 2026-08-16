import { sanitizeInput } from '@/lib/utils';

const URL_PATTERN = /^https?:\/\/.+/i;

export function cleanVendorText(value: unknown, maxLength = 2000): string {
    return sanitizeInput(value).slice(0, maxLength);
}

export function cleanUrl(value: unknown): string {
    const url = cleanVendorText(value, 500);
    if (!url || !URL_PATTERN.test(url)) {
        return '';
    }
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

export function cleanStringList(value: unknown, maxItems = 12, maxItemLength = 280): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => cleanVendorText(item, maxItemLength))
        .filter(Boolean)
        .slice(0, maxItems);
}

export type SocialLinks = {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    discord?: string;
    website?: string;
};

export function cleanSocialLinks(value: unknown): SocialLinks {
    if (!value || typeof value !== 'object') {
        return {};
    }
    const raw = value as Record<string, unknown>;
    const out: SocialLinks = {};
    for (const key of ['twitter', 'linkedin', 'github', 'youtube', 'discord', 'website'] as const) {
        const url = cleanUrl(raw[key]);
        if (url) {
            out[key] = url;
        }
    }
    return out;
}
