import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { mergeDedicatedBlogPosts } from '@/lib/dedicated-blog-registry';
import { normalizeCategories, normalizeCategory } from '@/lib/normalize-category';

export const BLOG_PAGE_SIZE = 12;

export type BlogAuthorSummary = {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
};

export type BlogPostSummary = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    categories: string[];
    tags: string[];
    author: string;
    authorModel?: BlogAuthorSummary | null;
    publishedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    readingTime?: number | null;
    postType?: string;
};

export type BlogListingFilters = {
    category?: string;
    tag?: string;
    q?: string;
    page?: number;
};

export type BlogListing = {
    posts: BlogPostSummary[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    filters: {
        category: string;
        tag: string;
        q: string;
    };
};

const CURATED_CATEGORIES = [
    'Reviews',
    'Comparisons',
    'Tutorials',
    'AI Writing Tools',
    'AI Coding Tools',
    'AI Image Tools',
    'AI Video Tools',
    'AI Automation',
    'AI Productivity Tools',
    'AI Marketing Tools',
    'AI Chatbots',
    'Agentic AI',
] as const;

function toIso(value: Date | string | null | undefined) {
    if (!value) return null;
    return value instanceof Date ? value.toISOString() : value;
}

function mapPrismaPost(post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    categories: string[];
    tags: string[];
    author: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    readingTime: number | null;
    postType: string;
    authorModel: BlogAuthorSummary | null;
}): BlogPostSummary {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        categories: normalizeCategories(post.categories),
        tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
        author: post.author,
        authorModel: post.authorModel,
        publishedAt: toIso(post.publishedAt),
        createdAt: toIso(post.createdAt),
        updatedAt: toIso(post.updatedAt),
        readingTime: post.readingTime,
        postType: post.postType,
    };
}

const getCachedPrismaPostSummaries = unstable_cache(
    async (): Promise<BlogPostSummary[]> => {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featuredImage: true,
                categories: true,
                tags: true,
                author: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                readingTime: true,
                postType: true,
                authorModel: {
                    select: { id: true, name: true, slug: true, image: true },
                },
            },
            orderBy: { publishedAt: 'desc' },
        });

        return posts.map(mapPrismaPost);
    },
    ['hyzenpro-blog-post-summaries-v1'],
    { revalidate: 300, tags: ['blog-posts'] },
);

function mapDedicatedPost(post: ReturnType<typeof mergeDedicatedBlogPosts>[number]): BlogPostSummary {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || null,
        featuredImage: post.featuredImage || null,
        categories: normalizeCategories(post.categories),
        tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
        author: post.author,
        publishedAt: toIso(post.publishedAt),
        createdAt: null,
        updatedAt: toIso(post.publishedAt),
    };
}

function sortPosts(posts: BlogPostSummary[]) {
    return [...posts].sort((a, b) => {
        const dateA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const dateB = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        if (dateB !== dateA) return dateB - dateA;
        return a.slug.localeCompare(b.slug);
    });
}

export async function getBlogInventory(): Promise<BlogPostSummary[]> {
    try {
        const prismaPosts = await getCachedPrismaPostSummaries();
        const merged = mergeDedicatedBlogPosts(prismaPosts);
        return sortPosts(merged.map(mapDedicatedPost));
    } catch (error) {
        console.error('[Blog] Failed to fetch published inventory:', error);
        return sortPosts(mergeDedicatedBlogPosts([]).map(mapDedicatedPost));
    }
}

export function normalizeFilterValue(value: string | undefined | null) {
    return (value || '').trim().toLocaleLowerCase();
}

function matchesCategory(post: BlogPostSummary, category: string) {
    const wanted = normalizeFilterValue(normalizeCategory(category));
    return post.categories.some((value) => normalizeFilterValue(value) === wanted);
}

function matchesTag(post: BlogPostSummary, tag: string) {
    const wanted = normalizeFilterValue(tag);
    return post.tags.some((value) => normalizeFilterValue(value) === wanted);
}

function matchesSearch(post: BlogPostSummary, query: string) {
    if (!query) return true;
    const haystack = [post.title, post.excerpt, post.author, ...post.categories, ...post.tags]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
    return haystack.includes(query);
}

export function filterBlogPosts(posts: BlogPostSummary[], filters: BlogListingFilters) {
    const category = (filters.category || '').trim();
    const tag = (filters.tag || '').trim();
    const q = normalizeFilterValue(filters.q);

    return posts.filter((post) => {
        return (!category || matchesCategory(post, category))
            && (!tag || matchesTag(post, tag))
            && matchesSearch(post, q);
    });
}

export function paginateBlogPosts(posts: BlogPostSummary[], requestedPage = 1, pageSize = BLOG_PAGE_SIZE) {
    const totalCount = posts.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1;
    const currentPage = Math.min(Math.max(safePage, 1), totalPages);
    const start = (currentPage - 1) * pageSize;

    return {
        posts: posts.slice(start, start + pageSize),
        totalCount,
        totalPages,
        currentPage,
    };
}

export async function getBlogListing(filters: BlogListingFilters = {}): Promise<BlogListing> {
    const inventory = await getBlogInventory();
    const filtered = filterBlogPosts(inventory, filters);
    const paginated = paginateBlogPosts(filtered, filters.page);

    return {
        ...paginated,
        filters: {
            category: (filters.category || '').trim(),
            tag: (filters.tag || '').trim(),
            q: (filters.q || '').trim(),
        },
    };
}

export function getCategoryOptions(posts: BlogPostSummary[]) {
    const counts = new Map<string, number>();
    for (const post of posts) {
        for (const category of post.categories) {
            counts.set(category, (counts.get(category) || 0) + 1);
        }
    }

    const curated = CURATED_CATEGORIES
        .filter((category) => counts.has(category))
        .map((name) => ({ name, count: counts.get(name) || 0 }));

    const curatedSet = new Set<string>(curated.map((category) => category.name));
    const more = Array.from(counts.entries())
        .filter(([name]) => !curatedSet.has(name))
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return { curated, more };
}

export function getPopularTagOptions(posts: BlogPostSummary[], limit = 16) {
    const counts = new Map<string, number>();
    for (const post of posts) {
        for (const tag of post.tags) {
            if (!tag.trim()) continue;
            counts.set(tag, (counts.get(tag) || 0) + 1);
        }
    }

    return Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, limit);
}

export function getKnownCategoryNames(posts: BlogPostSummary[]) {
    return new Set(posts.flatMap((post) => post.categories));
}

export function getKnownTagNames(posts: BlogPostSummary[]) {
    return new Set(posts.flatMap((post) => post.tags.map((tag) => normalizeFilterValue(tag))));
}

export function getQueryValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] || '' : value || '';
}

export function getPageValue(value: string | string[] | undefined) {
    const parsed = Number.parseInt(getQueryValue(value), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function buildBlogQuery(filters: BlogListingFilters) {
    const params = new URLSearchParams();
    if (filters.category?.trim()) params.set('category', filters.category.trim());
    if (filters.tag?.trim()) params.set('tag', filters.tag.trim());
    if (filters.q?.trim()) params.set('q', filters.q.trim());
    if (filters.page && filters.page > 1) params.set('page', String(Math.floor(filters.page)));
    const query = params.toString();
    return query ? `?${query}` : '';
}

export function buildBlogHref(filters: BlogListingFilters, basePath = '/blog/') {
    return `${basePath}${buildBlogQuery(filters)}`;
}

export function buildCategoryArchiveHref(category: string) {
    return `/blog/category/${encodeURIComponent(category)}/`;
}

export function buildTagArchiveHref(tag: string) {
    return `/blog/tag/${encodeURIComponent(tag)}/`;
}

export function isCuratedCategory(category: string) {
    return CURATED_CATEGORIES.includes(normalizeCategory(category) as (typeof CURATED_CATEGORIES)[number]);
}
