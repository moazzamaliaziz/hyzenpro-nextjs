import type { Metadata } from 'next';
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

async function getData() {
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
        });
        return posts;
    } catch {
        return [];
    }
}

export default async function BlogPage() {
    const posts = await getData();

    // Get unique categories
    const allCategories = Array.from(new Set(posts.flatMap((p: any) => p.categories))) as string[];

    return (
        <>
            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Blog' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-7xl text-white mb-4">
                            Blog
                        </h1>
                        <p className="text-white/40 text-lg max-w-2xl mx-auto">
                            Expert reviews, tutorials, and comparisons to help you navigate the AI landscape.
                        </p>
                    </div>

                    {/* Category Pills */}
                    {allCategories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-10">
                            {allCategories.map((cat) => (
                                <span
                                    key={cat}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/50 rounded-full hover:bg-white/[0.08] transition-colors"
                                >
                                    {cat}
                                </span>
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
                        <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                            <p className="text-white/30">No posts yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
