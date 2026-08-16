import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
            take: 50,
        });

        const baseUrl = getBaseUrl();

        const rssItems = posts.map((post) => {
            const pubDate = post.publishedAt
                ? post.publishedAt.toUTCString()
                : post.createdAt.toUTCString();

            return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}/</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <category>${(post.categories || []).join(', ')}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
        }).join('\n');

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HyzenPro Blog - AI Tool Reviews, Tutorials & Comparisons</title>
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
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
