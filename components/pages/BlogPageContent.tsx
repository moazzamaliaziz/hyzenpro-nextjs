import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import prisma from '@/lib/prisma';
import { normalizeCategories } from '@/lib/normalize-category';
import { mergeDedicatedBlogPosts } from '@/lib/dedicated-blog-registry';

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

export default async function BlogPageContent({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const posts = await getData();
    const resolvedSearchParams = await searchParams;
    const selectedCategory = getSearchParamValue(resolvedSearchParams?.category);
    const selectedTag = getSearchParamValue(resolvedSearchParams?.tag);

    const allCategories = Array.from(
        new Set(
            posts.flatMap((p: any) => normalizeCategories(p.categories))
        )
    ).sort((a, b) => a.localeCompare(b)) as string[];

    const allTags = Array.from(
        new Set(
            posts.flatMap((p: any) => (Array.isArray(p.tags) ? p.tags.filter(Boolean) : []))
        )
    ).sort((a, b) => a.localeCompare(b)) as string[];

    return (
        <>
            <main id="main-content" tabIndex={-1} className="pt-28 pb-20 min-h-screen">
                <div className="max-w-6xl mx-auto px-6">
                    <Breadcrumbs items={[{ label: 'Blog', href: '/blog/' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">From the blog</p>
                        <h1 className="font-serif text-4xl md:text-5xl text-black mb-4">AI Tool <span className="italic text-gray-500">Insights</span></h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            2026 AI tool reviews, comparison guides, and practical tutorials for building a sharper software shortlist.
                        </p>
                    </div>

                    <BlogPostsBrowser
                        posts={posts}
                        categories={allCategories}
                        tags={allTags}
                        selectedCategory={selectedCategory}
                        selectedTag={selectedTag}
                    />
                </div>
            </main>

            <Footer />
        </>
    );
}
