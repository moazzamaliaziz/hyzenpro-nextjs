import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { z } from 'zod';

const LinkSuggestionsSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    title: z.string().default(''),
    tags: z.array(z.string()).default([]),
    excludeSlug: z.string().optional(),
});

interface LinkSuggestion {
    title: string;
    slug: string;
    excerpt: string;
    relevance: number;
    reason: string;
}

function calculateRelevance(postTitle: string, postExcerpt: string, postTags: string[], content: string): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerTitle = postTitle.toLowerCase();

    // Title word overlap
    const titleWords = lowerTitle.split(/\s+/).filter(w => w.length > 3);
    for (const word of titleWords) {
        if (lowerContent.includes(word)) score += 10;
    }

    // Tag overlap
    for (const tag of postTags) {
        if (lowerContent.includes(tag.toLowerCase())) score += 15;
    }

    // Excerpt relevance
    const excerptWords = (postExcerpt || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const word of excerptWords) {
        if (lowerContent.includes(word)) score += 5;
    }

    return score;
}

function findInsertionPoints(content: string, suggestions: Array<{ text: string; anchor: string }>): string {
    let modified = content;
    const paragraphs = modified.split(/<\/p>/i);

    if (paragraphs.length < 3) return modified;

    // Insert after the 2nd paragraph for best placement
    const insertIndex = Math.min(2, paragraphs.length - 2);
    const linksHtml = suggestions.map(s =>
        `<p><strong>Related:</strong> <a href="/blog/${s.anchor}/">${s.text}</a></p>`
    ).join('\n');

    paragraphs.splice(insertIndex, 0, linksHtml);
    return paragraphs.join('</p>');
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = LinkSuggestionsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
        }

        const { content, title, tags, excludeSlug } = parsed.data;

        // Fetch all published posts
        const allPosts = await prisma.post.findMany({
            where: {
                status: 'published',
                slug: { not: excludeSlug || '' },
            },
            select: {
                title: true,
                slug: true,
                excerpt: true,
                tags: true,
            },
        });

        // Score each post for relevance
        const scored = allPosts.map(post => ({
            ...post,
            relevance: calculateRelevance(
                post.title || '',
                post.excerpt || '',
                post.tags || [],
                content
            ),
        }));

        // Sort by relevance and take top 5
        const suggestions = scored
            .filter(s => s.relevance > 0)
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5)
            .map(s => ({
                title: s.title,
                slug: s.slug,
                excerpt: s.excerpt || '',
                relevance: s.relevance,
                reason: s.relevance > 30 ? 'Highly relevant' : s.relevance > 15 ? 'Somewhat relevant' : 'Potentially relevant',
            }));

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('[SEO] Failed to generate link suggestions:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
