import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_BLOG_FEATURED_IMAGE } from '@/lib/blog-seo';

const BLOG_SITE_HOSTS = new Set(['hyzenpro.com', 'www.hyzenpro.com']);

/**
 * Resolve a post image before it reaches next/image or social metadata.
 * Local sources are checked against /public at request/build time; remote
 * sources are retained and still constrained by next.config.js allowlists.
 * Same-origin absolute generated image routes are normalized to relative
 * paths so Next's optimizer treats them as internal routes, not external
 * fetches.
 */
export function resolveBlogImageSource(source: string | null | undefined) {
    const value = source?.trim();
    if (!value || value.startsWith('//')) return DEFAULT_BLOG_FEATURED_IMAGE;

    let normalized = value;
    if (!value.startsWith('/')) {
        try {
            const url = new URL(value);
            if (url.protocol !== 'https:') return DEFAULT_BLOG_FEATURED_IMAGE;
            if (BLOG_SITE_HOSTS.has(url.hostname.toLowerCase())) {
                normalized = `${url.pathname || '/'}${url.search}`;
            } else {
                return value;
            }
        } catch {
            return DEFAULT_BLOG_FEATURED_IMAGE;
        }
    }

    const pathname = normalized.split('?')[0] || '/';
    if (pathname.includes('..') || pathname.includes('\\')) {
        return DEFAULT_BLOG_FEATURED_IMAGE;
    }

    // `/images/` is the static public asset namespace. Other internal paths
    // may be generated image routes and must remain untouched.
    if (!pathname.startsWith('/images/')) return normalized;

    const assetPath = path.join(process.cwd(), 'public', pathname.replace(/^\/+/, ''));
    return fs.existsSync(assetPath) ? normalized : DEFAULT_BLOG_FEATURED_IMAGE;
}
