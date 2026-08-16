import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { normalizeCategories } from '@/lib/normalize-category';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tag } = await params;
    const displayName = decodeURIComponent(tag).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `Tagged "${displayName}" - AI Tool Blog`,
        description: `Browse all blog posts tagged with "${displayName}". Reviews, tutorials, and comparisons for 2026.`,
        alternates: {
            canonical: `${getBaseUrl()}/blog/tag/${tag}/`,
        },
    };
}

export default async function TagArchivePage({ params }: Props) {
    const { tag } = await params;
    const displayName = decodeURIComponent(tag).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let posts: any[] = [];

    try {
        // Fetch posts that have this tag (MongoDB array contains)
        posts = await prisma.post.findMany({
            where: {
                status: 'published',
                tags: { has: tag },
            },
            include: {
                authorModel: {
                    select: { id: true, name: true, slug: true, image: true },
                },
            },
            orderBy: { publishedAt: 'desc' },
            take: 50,
        });

        posts = posts.map(post => ({
            ...post,
            categories: normalizeCategories(post.categories),
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error('[Blog] Failed to fetch tag posts:', error);
    }

    return (
        <>
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: 'Tags', href: '/blog/' },
                            { label: displayName },
                        ]}
                        className="mb-8"
                    />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-4xl md:text-5xl text-black mb-4">
                            Tagged: {displayName}
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            {posts.length} article{posts.length !== 1 ? 's' : ''} tagged with "{displayName}"
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">No posts found with this tag.</p>
                        </div>
                    ) : (
                        <BlogPostsBrowser
                            posts={posts}
                            categories={[]}
                            tags={[tag]}
                            selectedTag={tag}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
