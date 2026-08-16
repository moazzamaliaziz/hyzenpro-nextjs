import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { normalizeCategories } from '@/lib/normalize-category';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ category: string }>;
    searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const displayName = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

let postsCount = 0;
        try {
            postsCount = await prisma.post.count({
                where: { status: 'published', categories: { has: category } },
            });
        } catch {}

        return {
            title: `${displayName} - AI Tool Blog`,
            description: `Browse all blog posts about ${displayName}. Reviews, tutorials, and comparisons for 2026.`,
            ...(postsCount === 0 ? { robots: { index: false, follow: true } } : {}),
            alternates: {
                canonical: `${getBaseUrl()}/blog/category/${category}/`,
            },
        };
}

export default async function CategoryArchivePage({ params, searchParams }: Props) {
    const { category } = await params;
    const resolvedParams = await searchParams;
    const currentPage = parseInt(resolvedParams?.page || '1', 10);
    const postsPerPage = 12;

    const displayName = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let posts: any[] = [];
    let totalCount = 0;

    try {
        // Fetch posts that have this category
        [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: {
                    status: 'published',
                    categories: { has: category },
                },
                include: {
                    authorModel: {
                        select: { id: true, name: true, slug: true, image: true },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip: (currentPage - 1) * postsPerPage,
                take: postsPerPage,
            }),
            prisma.post.count({
                where: {
                    status: 'published',
                    categories: { has: category },
                },
            }),
        ]);

        posts = posts.map(post => ({
            ...post,
            categories: normalizeCategories(post.categories),
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error('[Blog] Failed to fetch category posts:', error);
    }

    const totalPages = Math.ceil(totalCount / postsPerPage);

    return (
        <>
            {totalCount === 0 && <meta name="robots" content="noindex, follow" />}
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: 'Categories', href: '/blog/' },
                            { label: displayName },
                        ]}
                        className="mb-8"
                    />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-4xl md:text-5xl text-black mb-4">{displayName}</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            {totalCount} article{totalCount !== 1 ? 's' : ''} about {displayName.toLowerCase()}
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">No posts found in this category.</p>
                        </div>
                    ) : (
                        <BlogPostsBrowser
                            posts={posts}
                            categories={[]}
                            tags={[]}
                            selectedCategory={category}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
