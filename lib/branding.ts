export const DEFAULT_SITE_LOGO_URL = 'https://media.hyzenpro.com/media/2026/06/21/jwq5nh41_c596008d-e19b-4e53-95b6-a9c6b1bf31e8-removalai-preview.png';
export const DEFAULT_SITE_FAVICON_URL = '/logo-main.png';
export const DEFAULT_SITE_SHARE_IMAGE_URL = '/logo-main.png';
export const DEFAULT_HERO_IMAGE_URL = 'https://hyzenpro.com/media/6a0a0d05e3696d2314b63070/hyzenpro.png';

const LEGACY_SITE_LOGO_URLS = new Set([
    '',
    '/images/logo.png',
    '/images/logo.svg',
    '/images/hyzenpro-logo-lockup.png',
]);

export function resolveSiteLogoUrl(logoUrl?: string | null) {
    if (!logoUrl || LEGACY_SITE_LOGO_URLS.has(logoUrl)) {
        return DEFAULT_SITE_LOGO_URL;
    }

    return logoUrl;
}
