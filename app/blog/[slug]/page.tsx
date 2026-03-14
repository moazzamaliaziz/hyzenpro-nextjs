import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AuthorBox from '@/components/eeat/AuthorBox';
import TableOfContents from '@/components/blog/TableOfContents';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl, formatDate, calculateReadingTime } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User } from 'lucide-react';
import SocialShare from '@/components/blog/SocialShare';
import * as cheerio from 'cheerio';

export const revalidate = 3600;

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
            where: { slug },
            include: { authorModel: true }
        });
    } catch {
        notFound();
    }

    if (!post || post.status !== 'published') {
        notFound();
    }

    const readingTime = calculateReadingTime(post.content);

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

    const authorData = post.authorModel ? {
        name: post.authorModel.name,
        role: post.authorModel.role || 'Contributor',
        bio: post.authorModel.bio || '',
        image: post.authorModel.image || undefined,
        socialLinks: post.authorModel.socialLinks as any
    } : {
        name: post.author || 'HyzenPro Team',
        role: 'AI Tool Reviewer & Editor',
        bio: 'Passionate about artificial intelligence and its practical applications. Writing in-depth reviews and guides to help users navigate the AI landscape.'
    };

    // Server-side HTML parsing for TOC IDs
    const $ = cheerio.load(post.content);
    $('h2, h3').each((i, el) => {
        const text = $(el).text();
        const id = $(el).attr('id') || text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        $(el).attr('id', id);
    });
    const parsedContent = $('body').html() || post.content;

    // Structured Data JSON-LD
    const currentUrl = `${getBaseUrl()}/blog/${post.slug}/`;
    
    const jsonLdArticle = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage ? [post.featuredImage] : [],
        datePublished: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: {
            '@type': 'Person',
            name: authorData.name,
            url: authorData.socialLinks?.website || `${getBaseUrl()}/about-us`
        },
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
            logo: {
                '@type': 'ImageObject',
                url: `${getBaseUrl()}/logo.png`
            }
        }
    };

    const jsonLdBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: getBaseUrl()
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${getBaseUrl()}/blog/`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: currentUrl
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
            />
            <Header />

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: post.title },
                        ]}
                        className="mb-8"
                    />

                    {/* Article Header */}
                    <header className="max-w-4xl mx-auto mb-12">
                        {/* Categories */}
                        {post.categories.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {post.categories.map((cat: string) => (
                                    <span key={cat} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-black leading-tight mb-6">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-gray-500 text-lg leading-relaxed mb-6">{post.excerpt}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pb-6 border-b border-gray-200">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {authorData.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTime} min read
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featuredImage && (
                        <div className="max-w-5xl mx-auto relative w-full aspect-[2/1] md:aspect-[21/9] rounded-3xl overflow-hidden mb-16 border border-gray-200 shadow-xl">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 1024px"
                            />
                        </div>
                    )}

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sticky Left Sidebar - Socials */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <SocialShare url={currentUrl} title={post.title} />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <article
                                className="prose prose-lg max-w-none mb-16
                  prose-headings:font-heading prose-headings:text-black prose-headings:scroll-mt-28
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-a:text-black prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-800
                  prose-ul:text-gray-600 prose-ol:text-gray-600
                  prose-li:marker:text-gray-400
                  prose-blockquote:border-gray-300 prose-blockquote:text-gray-500 prose-blockquote:italic
                  prose-img:rounded-2xl prose-img:border prose-img:border-gray-200 prose-img:shadow-sm"
                                dangerouslySetInnerHTML={{ __html: parsedContent }}
                            />

                            {/* Author Box Footer */}
                            <div className="mt-16 pt-12 border-t border-gray-200">
                                <h3 className="font-heading text-sm text-gray-400 uppercase tracking-widest mb-6">About the Author</h3>
                                <AuthorBox author={authorData} variant="full" />
                            </div>

                            {/* Mobile Social Share */}
                            <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
                                <h3 className="font-heading text-sm text-gray-400 uppercase tracking-widest mb-4">Share This Article</h3>
                                <SocialShare url={currentUrl} title={post.title} />
                            </div>
                        </div>

                        {/* Sticky Right Sidebar - TOC */}
                        <div className="lg:col-span-4 xl:col-span-3 order-first lg:order-last mb-10 lg:mb-0">
                            <div className="sticky top-32">
                                <TableOfContents />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="mt-16 py-16 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="font-heading text-3xl text-black text-center mb-10">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost: any) => (
                                    <article key={relatedPost.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
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
                                                <h3 className="font-heading text-xl text-black group-hover:text-gray-600 transition-colors line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
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
        </>
    );
}
