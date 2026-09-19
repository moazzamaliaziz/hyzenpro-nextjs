export const DEFAULT_SITE_LOGO_URL = 'https://media.hyzenpro.com/media/2026/06/21/jwq5nh41_c596008d-e19b-4e53-95b6-a9c6b1bf31e8-removalai-preview.png';
export const DEFAULT_SITE_FAVICON_URL = '/favicon.png';
export const DEFAULT_SITE_SHARE_IMAGE_URL = '/logo-main.png';
export const DEFAULT_HERO_IMAGE_URL = 'https://hyzenpro.com/media/6a0a0d05e3696d2314b63070/hyzenpro.png';

const LEGACY_SITE_LOGO_URLS = new Set([
    '',
    '/images/logo.png',
    '/images/logo.svg',
    '/images/hyzenpro-logo-lockup.png',
]);

const SITE_HOSTS = new Set(['hyzenpro.com', 'www.hyzenpro.com']);

// A logo uploaded in Settings is stored as an absolute same-origin URL
// (https://hyzenpro.com/media/...). next/image treats that as remote and
// fetches it back over the public internet; on Hostinger that loopback fails
// ("TypeError: fetch failed" in the runtime logs) and the header renders no
// logo at all. Serving it as a relative path keeps the request internal.
export function toSameOriginPath(url: string): string {
    if (!url.startsWith('http')) return url;
    try {
        const parsed = new URL(url);
        return SITE_HOSTS.has(parsed.hostname.toLowerCase())
            ? `${parsed.pathname}${parsed.search}`
            : url;
    } catch {
        return url;
    }
}

export function resolveSiteLogoUrl(logoUrl?: string | null) {
    const trimmed = logoUrl?.trim();
    if (!trimmed || LEGACY_SITE_LOGO_URLS.has(trimmed)) {
        return DEFAULT_SITE_LOGO_URL;
    }

    return toSameOriginPath(trimmed);
}
