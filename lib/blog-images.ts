import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_BLOG_FEATURED_IMAGE } from '@/lib/blog-seo';

/**
 * Resolve a post image before it reaches next/image or social metadata.
 * Local sources are checked against /public at request/build time; remote
 * sources are retained and still constrained by next.config.js allowlists.
 */
export function resolveBlogImageSource(source: string | null | undefined) {
    const value = source?.trim();
    if (!value) return DEFAULT_BLOG_FEATURED_IMAGE;

    if (!value.startsWith('/')) {
        return /^https:\/\//i.test(value) ? value : DEFAULT_BLOG_FEATURED_IMAGE;
    }

    const pathname = value.split('?')[0] || '/';
    if (pathname.includes('..') || pathname.includes('\\')) {
        return DEFAULT_BLOG_FEATURED_IMAGE;
    }

    // `/images/` is the static public asset namespace. Other internal paths
    // may be generated image routes and must remain untouched.
    if (!pathname.startsWith('/images/')) return value;

    const assetPath = path.join(process.cwd(), 'public', pathname.replace(/^\/+/, ''));
    return fs.existsSync(assetPath) ? value : DEFAULT_BLOG_FEATURED_IMAGE;
}
