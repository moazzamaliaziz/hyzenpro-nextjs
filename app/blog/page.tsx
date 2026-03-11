import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PostCard from '@/components/blog/PostCard';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Blog – AI Tool Reviews, Tutorials & Comparisons',
    description:
        'Read the latest AI tool reviews, in-depth tutorials, and side-by-side comparisons. Stay updated with the rapidly evolving AI landscape.',
    alternates: {
        canonical: `${getBaseUrl()}/blog/`,
    },
};

async function getData(category?: string) {
    try {
        const whereClause: any = { status: 'published' };
        
        if (category) {
            whereClause.categories = { has: category };
        }

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: { publishedAt: 'desc' },
        });
        return posts;
    } catch {
        return [];
    }
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const posts = await getData(category);

    // Get unique categories from ALL posts for the filter pills, not just the filtered ones
    const allPosts = await prisma.post.findMany({
        where: { status: 'published' },
        select: { categories: true }
    });
    const allCategories = Array.from(new Set(allPosts.flatMap((p: any) => p.categories))) as string[];

    return (
        <>
            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Blog' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-7xl text-black mb-4">
                            Blog
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Expert reviews, tutorials, and comparisons to help you navigate the AI landscape.
                        </p>
                    </div>

                    {/* Category Pills */}
                    {allCategories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                            <Link
                                href="/blog"
                                prefetch={true}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-colors ${!category
                                    ? 'bg-black border-black text-white hover:bg-gray-800'
                                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                All Posts
                            </Link>
                            {allCategories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/blog?category=${encodeURIComponent(cat)}`}
                                    prefetch={true}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-colors cursor-pointer ${category === cat
                                        ? 'bg-black border-black text-white hover:bg-gray-800'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Posts Grid */}
                    {posts.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post: any, i: number) => (
                                <PostCard key={post.id} post={post} priority={i < 6} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl">
                            <p className="text-gray-400">No posts yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
