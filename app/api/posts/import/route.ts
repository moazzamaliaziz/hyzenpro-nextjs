import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { z } from 'zod';

const ImportSchema = z.object({
    html: z.string().min(1, 'HTML content is required'),
    url: z.string().url().optional(),
});

interface HtmlImportResult {
    title: string;
    content: string;
    excerpt: string;
    featuredImage: string;
    headings: Array<{ level: number; text: string; id: string }>;
    links: Array<{ text: string; href: string; isInternal: boolean }>;
    images: Array<{ src: string; alt: string }>;
    metadata: Record<string, string>;
}

function sanitizeForSiteStyles(html: string): string {
    // Remove inline styles that could break the site design
    let sanitized = html;

    // Remove style attributes
    sanitized = sanitized.replace(/\s*style="[^"]*"/gi, '');

    // Remove <style> tags
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove class attributes that might conflict
    // But keep semantic classes
    const keepClasses = ['highlight', 'code', 'pre', 'blockquote', 'callout'];
    sanitized = sanitized.replace(/\s*class="([^"]*)"/gi, (match, classes) => {
        const kept = classes.split(/\s+/).filter((c: string) =>
            keepClasses.some(kc => c.toLowerCase().includes(kc))
        );
        return kept.length > 0 ? ` class="${kept.join(' ')}"` : '';
    });

    return sanitized;
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = ImportSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const { html, url } = parsed.data;

        // Parse HTML - use simple regex-based extraction for server-side
        // (jsdom is not available, so we do basic HTML parsing)
        const extractMetaContent = (html: string, pattern: RegExp): string => {
            const match = html.match(pattern);
            return match ? match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
        };

        const title = extractMetaContent(html, /<meta\s+property="og:title"\s+content="([^"]+)"/i)
            || extractMetaContent(html, /<title[^>]*>([^<]+)<\/title>/i)
            || extractMetaContent(html, /<h1[^>]*>([^<]+)<\/h1>/i)
            || 'Untitled';

        const excerpt = extractMetaContent(html, /<meta\s+name="description"\s+content="([^"]+)"/i)
            || extractMetaContent(html, /<meta\s+property="og:description"\s+content="([^"]+)"/i)
            || '';

        const featuredImage = extractMetaContent(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i)
            || extractMetaContent(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"/i)
            || '';

        // Extract content from article/main/content containers
        let content = '';
        const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
            || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
            || html.match(/<div\s+class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (contentMatch) {
            content = contentMatch[1]
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<nav[\s\S]*?<\/nav>/gi, '')
                .replace(/<header[\s\S]*?<\/header>/gi, '')
                .replace(/<footer[\s\S]*?<\/footer>/gi, '');
        }

        // Extract headings
        const headings: Array<{ level: number; text: string; id: string }> = [];
        const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
        let headingMatch;
        const seenIds = new Map<string, number>();
        while ((headingMatch = headingRegex.exec(html)) !== null) {
            const level = parseInt(headingMatch[1]);
            const text = headingMatch[2].trim();
            const baseId = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const count = seenIds.get(baseId) || 0;
            seenIds.set(baseId, count + 1);
            const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
            headings.push({ level, text, id });
        }

        // Extract links
        const links: Array<{ text: string; href: string; isInternal: boolean }> = [];
        const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi;
        let linkMatch;
        const baseHost = url ? new URL(url).hostname : 'example.com';
        while ((linkMatch = linkRegex.exec(html)) !== null) {
            const href = linkMatch[1];
            const text = linkMatch[2].trim();
            if (!href || !text || href.startsWith('#') || href.startsWith('javascript:')) continue;
            let isInternal = false;
            try {
                const linkUrl = new URL(href, `https://${baseHost}`);
                isInternal = linkUrl.hostname === baseHost || linkUrl.hostname === `www.${baseHost}`;
            } catch {
                isInternal = href.startsWith('/');
            }
            links.push({ text, href, isInternal });
        }

        // Extract images
        const images: Array<{ src: string; alt: string }> = [];
        const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
            images.push({ src: imgMatch[1], alt: imgMatch[2] || '' });
        }

        // Extract metadata
        const metadata: Record<string, string> = {};
        const metaRegex = /<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]+)"/gi;
        let metaMatch;
        while ((metaMatch = metaRegex.exec(html)) !== null) {
            metadata[metaMatch[1]] = metaMatch[2];
        }

        // Sanitize content for site styles
        content = sanitizeForSiteStyles(content);

        const result: HtmlImportResult = {
            title,
            content,
            excerpt,
            featuredImage,
            headings,
            links,
            images,
            metadata,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Import] Failed to parse HTML:', error);
        return NextResponse.json({ error: 'Failed to parse HTML' }, { status: 500 });
    }
}
