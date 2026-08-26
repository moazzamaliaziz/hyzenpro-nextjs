import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
    unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock('@/lib/prisma', () => ({ default: {} }));

import { mergeDedicatedBlogPosts } from '@/lib/dedicated-blog-registry';
import { normalizeCategories } from '@/lib/normalize-category';
import {
    BLOG_PAGE_SIZE,
    buildBlogQuery,
    filterBlogPosts,
    getCategoryOptions,
    paginateBlogPosts,
    type BlogPostSummary,
} from '@/lib/blog-query';

function post(overrides: Partial<BlogPostSummary> = {}): BlogPostSummary {
    return {
        id: overrides.id || 'post-1',
        title: overrides.title || 'Claude coding review',
        slug: overrides.slug || 'claude-coding-review',
        excerpt: overrides.excerpt ?? 'A practical review of coding workflows.',
        featuredImage: null,
        categories: overrides.categories || ['AI Coding Tools'],
        tags: overrides.tags || ['Claude Code', 'AI Coding Tools'],
        author: 'HyzenPro Team',
        publishedAt: '2026-08-01T00:00:00.000Z',
        createdAt: null,
        updatedAt: '2026-08-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('blog taxonomy and query helpers', () => {
    it('normalizes legacy category variants without losing multi-category relationships', () => {
        expect(normalizeCategories(['ai automation', 'reviews', 'Reviews & Comparisons', 'AI Coding Tools'])).toEqual([
            'AI Automation',
            'Reviews',
            'Comparisons',
            'AI Coding Tools',
        ]);
    });

    it('filters categories and tags case-insensitively while preserving exact tag semantics', () => {
        const posts = [post(), post({ id: 'post-2', title: 'Image workflow', categories: ['AI Image Tools'], tags: ['Midjourney'] })];
        expect(filterBlogPosts(posts, { category: 'ai coding tools' })).toHaveLength(1);
        expect(filterBlogPosts(posts, { tag: 'claude code' })).toHaveLength(1);
        expect(filterBlogPosts(posts, { q: 'image' })[0].slug).toBe('claude-coding-review'.replace('claude-coding-review', 'claude-coding-review'));
        expect(filterBlogPosts(posts, { q: 'image' })[0].title).toBe('Image workflow');
    });

    it('preserves all active URL filters and omits page one for clean canonical URLs', () => {
        expect(buildBlogQuery({ category: 'AI Coding Tools', tag: 'Claude Code', q: 'agent', page: 2 })).toBe('?category=AI+Coding+Tools&tag=Claude+Code&q=agent&page=2');
        expect(buildBlogQuery({ category: 'AI Coding Tools', page: 1 })).toBe('?category=AI+Coding+Tools');
    });

    it('paginates safely at the first, middle, and out-of-range pages', () => {
        const posts = Array.from({ length: BLOG_PAGE_SIZE * 2 + 1 }, (_, index) => post({ id: `post-${index}`, slug: `post-${index}` }));
        expect(paginateBlogPosts(posts, 1).posts).toHaveLength(BLOG_PAGE_SIZE);
        expect(paginateBlogPosts(posts, 2).posts[0].id).toBe(`post-${BLOG_PAGE_SIZE}`);
        expect(paginateBlogPosts(posts, 999).currentPage).toBe(3);
        expect(paginateBlogPosts([], 2).totalPages).toBe(1);
    });

    it('keeps Prisma precedence while adding missing dedicated registry entries', () => {
        const prismaPost = {
            id: 'db-1',
            slug: 'claude-sonnet-5-review',
            title: 'Database title wins',
            excerpt: 'Database excerpt',
            featuredImage: null,
            categories: ['AI Chatbots'],
            tags: ['Anthropic'],
            author: 'Database author',
            publishedAt: '2026-07-01T09:00:00.000Z',
        };
        const merged = mergeDedicatedBlogPosts([prismaPost]);
        expect(merged.find((item) => item.slug === prismaPost.slug)?.title).toBe('Database title wins');
        expect(merged.some((item) => item.slug === 'gpt-5-6-sol-preview')).toBe(true);
    });

    it('returns curated categories first and keeps remaining normalized categories discoverable', () => {
        const options = getCategoryOptions([
            post({ categories: ['Reviews', 'AI Tools'] }),
            post({ id: 'post-2', categories: ['AI Benchmarks'] }),
        ]);
        expect(options.curated.map((item) => item.name)).toContain('Reviews');
        expect(options.more.map((item) => item.name)).toContain('AI Tools');
        expect(options.more.map((item) => item.name)).toContain('AI Benchmarks');
    });
});
