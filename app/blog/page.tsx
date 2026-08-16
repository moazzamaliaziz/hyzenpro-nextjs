import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import { normalizeCategories } from '@/lib/normalize-category';
import { mergeDedicatedBlogPosts } from '@/lib/dedicated-blog-registry';
import BlogPageContent from '@/components/pages/BlogPageContent';

export const dynamic = 'force-dynamic';

async function getData() {
    try {
        const rawPosts = await prisma.post.findMany({
            where: { status: 'published' },
            include: {
                authorModel: {
                    select: { id: true, name: true, slug: true, image: true },
                },
            },
            orderBy: { publishedAt: 'desc' },
        });
        const prismaPosts = rawPosts.map((post) => ({
            ...post,
            categories: normalizeCategories(post.categories),
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));
        return mergeDedicatedBlogPosts(prismaPosts);
    } catch (error) {
        console.error('[Blog] Failed to fetch posts:', error);
        return mergeDedicatedBlogPosts([]);
    }
}

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const selectedCategory = getSearchParamValue(resolvedSearchParams?.category);
    const selectedTag = getSearchParamValue(resolvedSearchParams?.tag);
    const posts = selectedCategory || selectedTag ? await getData() : [];
    const normalizedCategory = selectedCategory.trim().toLowerCase();
    const normalizedTag = selectedTag.trim().toLowerCase();
    const filteredCount = posts.filter((post: any) => {
        const matchesCategory = normalizedCategory
            ? normalizeCategories(post.categories).some((cat) => cat.toLowerCase() === normalizedCategory)
            : true;
        const matchesTag = normalizedTag
            ? (Array.isArray(post.tags) ? post.tags : []).some((tag: string) => tag.trim().toLowerCase() === normalizedTag)
            : true;
        return matchesCategory && matchesTag;
    }).length;
    const isThinArchive = Boolean((selectedCategory || selectedTag) && filteredCount < 5);

    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${getBaseUrl()}/blog/` : `${getBaseUrl()}/${loc}/blog/`;
    }
    languages['x-default'] = `${getBaseUrl()}/blog/`;

    return {
        title: 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
        description:
            'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
        keywords: ['AI tools blog', 'AI reviews', 'AI comparisons', 'AI tutorials', 'AI tool guides', 'best AI tools 2026'],
        alternates: {
            canonical: `${getBaseUrl()}/blog/`,
            languages,
        },
        openGraph: {
            url: `${getBaseUrl()}/blog/`,
            title: 'AI Tool Blog — Reviews, Tutorials & Comparisons in 2026',
            description:
                'Read 2026 AI tool reviews, buying guides, tutorials, and comparisons for creators, marketers, developers, and lean teams.',
            type: 'website',
        },
        robots: {
            index: !isThinArchive,
            follow: true,
        },
    };
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    return <BlogPageContent searchParams={searchParams} />;
}
