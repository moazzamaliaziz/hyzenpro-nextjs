import { NextResponse } from 'next/server';
import { getBlogInventory } from '@/lib/blog-query';
import { getBlogPostPath } from '@/lib/blog-seo';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 3600;

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        const posts = (await getBlogInventory()).slice(0, 50);
        const baseUrl = getBaseUrl();

        const rssItems = posts.map((post) => {
            const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString();
            const link = `${baseUrl}${getBlogPostPath(post.slug)}`;
            const categories = post.categories.map((category) => `<category>${escapeXml(category)}</category>`).join('');

            return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      ${categories}
      <pubDate>${pubDate}</pubDate>
    </item>`;
        }).join('\n');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HyzenPro Blog - AI Tool Reviews, Tutorials &amp; Comparisons</title>
    <link>${baseUrl}/blog/</link>
    <description>2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

        return new NextResponse(rss, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('[RSS] Failed to generate feed:', error);
        const baseUrl = getBaseUrl();
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HyzenPro Blog - AI Tool Reviews, Tutorials &amp; Comparisons</title>
    <link>${baseUrl}/blog/</link>
    <description>2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
        return new NextResponse(rss, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    }
}
