import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthorBox from '@/components/eeat/AuthorBox';
import TableOfContents from '@/components/blog/TableOfContents';
import Link from 'next/link';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

// Generate all blog post pages at build time
export async function generateStaticParams() {
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            select: { slug: true }
        });
        return posts.map((post: any) => ({
            slug: post.slug,
        }));
    } catch {
        return [];
    }
}

// Generate metadata for each post
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug }
        });

        if (!post) {
            return { title: 'Post Not Found | HyzenPro' };
        }

        const seo = post.seo as any;

        return {
            title: seo?.metaTitle || `${post.title} | HyzenPro Blog`,
            description: seo?.metaDescription || post.excerpt,
            alternates: {
                canonical: seo?.canonicalUrl || `${getBaseUrl()}/blog/${post.slug}/`,
            },
            openGraph: {
                type: 'article',
                title: seo?.metaTitle || post.title,
                description: seo?.metaDescription || post.excerpt || '',
                images: seo?.ogImage ? [seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
                publishedTime: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
                authors: [post.author],
            },
        };
    } catch {
        return { title: 'Post Not Found | HyzenPro' };
    }
}

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    let post;
    try {
        post = await prisma.post.findUnique({
            where: { slug }
        });
    } catch {
        notFound();
    }

    if (!post || post.status !== 'published') {
        notFound();
    }

    // Get related posts (same categories)
    let relatedPosts: any[] = [];
    try {
        if (post.categories.length > 0) {
            relatedPosts = await prisma.post.findMany({
                where: {
                    status: 'published',
                    id: { not: post.id },
                    categories: { hasSome: post.categories }
                },
                take: 3,
                orderBy: { publishedAt: 'desc' }
            });
        }
    } catch { }

    // Fallback if no category matches
    if (relatedPosts.length === 0) {
        try {
            relatedPosts = await prisma.post.findMany({
                where: { status: 'published', id: { not: post.id } },
                take: 3,
                orderBy: { publishedAt: 'desc' }
            });
        } catch { }
    }

    const authorData = {
        name: post.author || 'HyzenPro Team',
        role: 'AI Tool Reviewer & Editor',
        bio: 'Passionate about artificial intelligence and its practical applications. Writing in-depth reviews and guides to help users navigate the AI landscape.'
    };

    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24 min-h-screen">
                {/* Hero */}
                <section className="section bg-black text-white">
                    <div className="container max-w-4xl">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-white line-clamp-1">{post.title}</span>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 mb-6">
                            {post.categories.map((cat: string) => (
                                <span key={cat} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="font-heading text-4xl md:text-6xl mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex items-center gap-6 text-gray-400">
                            <span className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    {authorData.name.charAt(0)}
                                </div>
                                {authorData.name}
                            </span>
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                {post.featuredImage && (
                    <section className="bg-black pb-12">
                        <div className="container max-w-4xl">
                            <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden border border-white/5">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Content */}
                <section className="section bg-white">
                    <div className="container max-w-3xl">
                        <TableOfContents />
                        <article className="prose prose-lg max-w-none">
                            {post.excerpt && (
                                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Main Content Rendered Safely */}
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </article>

                        {/* Author Box */}
                        <div className="mt-16 pt-12 border-t border-gray-100">
                            <h3 className="font-heading text-xl text-gray-500 uppercase tracking-widest mb-8">About the Author</h3>
                            <AuthorBox author={authorData} variant="full" />
                        </div>

                        {/* Share */}
                        <div className="border-t border-gray-200 mt-12 pt-8">
                            <h3 className="font-heading text-xl text-black mb-4">SHARE THIS ARTICLE</h3>
                            <div className="flex gap-4">
                                <a href={`https://twitter.com/intent/tweet?url=${getBaseUrl()}/blog/${post.slug}&text=${post.title}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    Twitter
                                </a>
                                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${getBaseUrl()}/blog/${post.slug}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="section bg-[#f5f5f5]">
                        <div className="container">
                            <h2 className="font-heading text-4xl text-black text-center mb-12">
                                RELATED ARTICLES
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedPosts.map((relatedPost: any) => (
                                    <article key={relatedPost.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                        {relatedPost.featuredImage && (
                                            <div className="h-48 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <Link href={`/blog/${relatedPost.slug}/`}>
                                                <h3 className="font-heading text-xl text-black group-hover:text-accent transition-colors line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
