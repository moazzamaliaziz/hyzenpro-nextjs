import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PostCard from '@/components/blog/PostCard';
import AdSlot from '@/components/ads/AdSlot';
import prisma from '@/lib/prisma';
import { getBaseUrl, formatDate, calculateReadingTime } from '@/lib/utils';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/structured-data';

export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await prisma.post.findUnique({ where: { slug } });
        if (!post) return { title: 'Not Found' };
        const seo = post.seo as any;
        return {
            title: seo?.metaTitle || post.title,
            description: seo?.metaDescription || post.excerpt || '',
            alternates: {
                canonical: seo?.canonicalUrl || `${getBaseUrl()}/${slug}/`,
            },
            openGraph: {
                title: seo?.metaTitle || post.title,
                description: seo?.metaDescription || post.excerpt || '',
                type: 'article',
                publishedTime: post.publishedAt?.toISOString(),
                modifiedTime: post.updatedAt?.toISOString(),
                images: seo?.ogImage ? [seo.ogImage] : post.featuredImage ? [post.featuredImage] : [],
            },
        };
    } catch {
        return { title: 'Not Found' };
    }
}

export async function generateStaticParams() {
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            select: { slug: true },
        });
        return posts.map((p: { slug: string }) => ({ slug: p.slug }));
    } catch {
        return [];
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;

    let post;
    try {
        post = await prisma.post.findUnique({ where: { slug } });
    } catch {
        notFound();
    }
    if (!post || post.status !== 'published') notFound();

    const readingTime = calculateReadingTime(post.content);
    const baseUrl = getBaseUrl();

    // Get related posts
    let relatedPosts: any[] = [];
    try {
        relatedPosts = await prisma.post.findMany({
            where: {
                status: 'published',
                id: { not: post.id },
                categories: { hasSome: post.categories },
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
        });
    } catch { }

    const breadcrumbs = [
        { name: 'Home', url: baseUrl },
        { name: 'Blog', url: `${baseUrl}/blog/` },
        { name: post.title, url: `${baseUrl}/${slug}/` },
    ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema(post as any)) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) }} />

            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: post.title },
                        ]}
                        className="mb-8"
                    />

                    {/* Article Header */}
                    <header className="mb-10">
                        {/* Categories */}
                        {post.categories.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {post.categories.map((cat: string) => (
                                    <Link
                                        key={cat}
                                        href={`/category/${cat.toLowerCase()}/`}
                                        className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-white/40 text-lg leading-relaxed mb-6">{post.excerpt}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/30 pb-6 border-b border-white/[0.06]">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {post.author}
                            </span>
                            {post.publishedAt && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(post.publishedAt)}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTime} min read
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featuredImage && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-white/[0.06]">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                    )}

                    <AdSlot slot="blog-post-top" format="horizontal" />

                    {/* Article Content */}
                    <article
                        className="prose prose-invert prose-lg max-w-none mb-12
              prose-headings:font-heading prose-headings:text-white
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-white/55 prose-p:leading-relaxed
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white/80
              prose-ul:text-white/50 prose-ol:text-white/50
              prose-li:marker:text-accent
              prose-blockquote:border-accent/50 prose-blockquote:text-white/40
              prose-img:rounded-xl prose-img:border prose-img:border-white/10"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <AdSlot slot="blog-post-bottom" format="horizontal" />

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-6 border-t border-white/[0.06]">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1.5 text-xs text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Back to Blog */}
                    <div className="mt-8">
                        <Link
                            href="/blog/"
                            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-accent transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Link>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-3xl text-white mb-8">Related Articles</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPosts.map((p: any) => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}
