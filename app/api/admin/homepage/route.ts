import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

type TweetContent = {
    tweetId: string;
    tweetUrl: string;
    embedHtml: string;
    sourceInput?: string;
    name?: string;
    handle?: string;
    text?: string;
    date?: string;
};

import { decodeHtmlEntities } from '@/lib/utils';

function stripTags(value: string): string {
    return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim();
}

function normalizeTweetUrl(value: string): string {
    const match = value.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+/i);
    if (!match) {
        return '';
    }

    const url = match[0]
        .replace('twitter.com', 'x.com')
        .replace(/\/$/, '');

    return url;
}

function extractTweetId(value: string): string | null {
    const match = value.match(/status\/(\d+)/i);
    return match?.[1] || null;
}

function extractBlockquoteHtml(value: string): string {
    const match = value.match(/<blockquote[\s\S]*?<\/blockquote>/i);
    return match?.[0]?.trim() || '';
}

function extractAuthorMeta(blockquoteHtml: string): Pick<TweetContent, 'name' | 'handle' | 'date'> {
    const authorMatch = blockquoteHtml.match(/&mdash;\s*([^<]+?)\s*\(@([A-Za-z0-9_]+)\)/i);
    const dateMatch = blockquoteHtml.match(/status\/\d+[^"]*"[^>]*>([^<]+)<\/a>/i);

    return {
        name: authorMatch ? decodeHtmlEntities(authorMatch[1].trim()) : '',
        handle: authorMatch ? authorMatch[2].trim() : '',
        date: dateMatch ? decodeHtmlEntities(dateMatch[1].trim()) : '',
    };
}

function extractTweetText(blockquoteHtml: string): string {
    const paragraphMatch = blockquoteHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (!paragraphMatch) {
        return '';
    }

    return stripTags(paragraphMatch[1]);
}

function buildEmbedHtml(tweetUrl: string): string {
    return `<blockquote class="twitter-tweet"><a href="${tweetUrl}"></a></blockquote>`;
}

function parseTweetInput(rawValue: unknown): TweetContent | null {
    if (typeof rawValue !== 'string') {
        return null;
    }

    const sourceInput = rawValue.trim();
    if (!sourceInput) {
        return null;
    }

    const blockquoteHtml = extractBlockquoteHtml(sourceInput);
    const normalizedUrl = normalizeTweetUrl(sourceInput);
    const tweetId = extractTweetId(normalizedUrl);

    if (!normalizedUrl || !tweetId) {
        return null;
    }

    const authorMeta = blockquoteHtml ? extractAuthorMeta(blockquoteHtml) : { name: '', handle: '', date: '' };
    const text = blockquoteHtml ? extractTweetText(blockquoteHtml) : '';

    return {
        tweetId,
        tweetUrl: normalizedUrl,
        embedHtml: blockquoteHtml || buildEmbedHtml(normalizedUrl),
        sourceInput,
        name: authorMeta.name || '',
        handle: authorMeta.handle || '',
        text,
        date: authorMeta.date || '',
    };
}

function normalizeTweets(rawTweets: unknown): TweetContent[] {
    if (!Array.isArray(rawTweets)) {
        return [];
    }

    const parsedTweets = rawTweets
        .map((item) => {
            if (typeof item === 'string') {
                return parseTweetInput(item);
            }

            if (typeof item === 'object' && item) {
                const candidate = item as Record<string, unknown>;
                return parseTweetInput(candidate.sourceInput || candidate.embedHtml || candidate.tweetUrl);
            }

            return null;
        })
        .filter((item): item is TweetContent => Boolean(item));

    const uniqueTweets: TweetContent[] = [];
    const seenIds = new Set<string>();

    for (const tweet of parsedTweets) {
        if (seenIds.has(tweet.tweetId)) {
            continue;
        }

        seenIds.add(tweet.tweetId);
        uniqueTweets.push(tweet);
    }

    return uniqueTweets;
}

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const sections = await prisma.siteContent.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(sections);
    } catch (error) {
        console.error('Failed to fetch homepage content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const token = await requireAdminToken(req);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await req.json();
        const { sectionId, title, subtitle, content, enabled, sortOrder } = body;

        if (!sectionId) {
            return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
        }

        let contentToPersist = content;

        if (sectionId === 'social-proof') {
            const normalizedTweets = normalizeTweets(content?.tweets);

            contentToPersist = {
                ...(typeof content === 'object' && content ? content : {}),
                tweets: normalizedTweets,
            };
        }

        const section = await prisma.siteContent.upsert({
            where: { sectionId },
            update: {
                ...(title !== undefined && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(contentToPersist !== undefined && { content: contentToPersist }),
                ...(enabled !== undefined && { enabled }),
                ...(sortOrder !== undefined && { sortOrder }),
            },
            create: {
                sectionId,
                title: title || '',
                subtitle: subtitle || '',
                content: contentToPersist || {},
                enabled: enabled ?? true,
                sortOrder: sortOrder ?? 0,
            },
        });

        return NextResponse.json(section);
    } catch (error) {
        console.error('Failed to update homepage content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
