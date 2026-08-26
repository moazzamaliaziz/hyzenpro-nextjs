import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AuthorBox from '@/components/eeat/AuthorBox';
import AffiliateDisclosure from '@/components/blog/AffiliateDisclosure';
import TableOfContents from '@/components/blog/TableOfContents';
import InternalLinkingPanel from '@/components/blog/InternalLinkingPanel';
import PostCard from '@/components/blog/PostCard';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getBaseUrl, formatDate, calculateReadingTime } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import SocialShare from '@/components/blog/SocialShare';
import MatcherDiscoveryCard from '@/components/quiz/MatcherDiscoveryCard';
import * as cheerio from 'cheerio';
import { getMatcherDiscoveryContext } from '@/lib/matcher-discovery';
import { resolvePostAuthor } from '@/lib/post-author';
import { getEditorialAuthor } from '@/lib/editorial-authors';
import { resolveBlogImageSource } from '@/lib/blog-images';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';
import {
    getBlogDisplayExcerpt,
    getBlogDisplayTitle,
    getBlogFeaturedImage,
    getInternalLinkRecommendations,
    normalizeEvergreenYear,
} from '@/lib/blog-seo';

export default async function BlogPostPageContent({ slug }: { slug: string }) {
    let post;
    try {
        post = await prisma.post.findUnique({
            where: { slug },
            include: { authorModel: true }
        });
    } catch (error) {
        console.error('[Blog] Database error fetching post:', error);
        notFound();
    }

    if (!post || post.status !== 'published') {
        notFound();
    }

    const readingTime = calculateReadingTime(post.content);
    const matcherContext = getMatcherDiscoveryContext();
    const displayTitle = getBlogDisplayTitle(post);
    const displayExcerpt = getBlogDisplayExcerpt(post);
    const featuredImage = resolveBlogImageSource(getBlogFeaturedImage(post));
    const isSvgFeaturedImage = featuredImage.toLowerCase().split('?')[0].endsWith('.svg');
    const featuredImageUrl = featuredImage.startsWith('http') ? featuredImage : `${getBaseUrl()}${featuredImage}`;
    const internalLinks = getInternalLinkRecommendations(post);
    const postCategories = Array.isArray(post.categories) ? post.categories.filter(Boolean) : [];
    const postTags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];

    // Get related posts (same categories)
    let relatedPosts: any[] = [];
    try {
        if (postCategories.length > 0) {
            relatedPosts = await prisma.post.findMany({
                where: {
                    status: 'published',
                    id: { not: post.id },
                    categories: { hasSome: postCategories }
                },
                take: 3,
                orderBy: { publishedAt: 'desc' },
                include: { authorModel: { select: { id: true, name: true, slug: true, image: true } } },
            });
        }
    } catch (error) {
        console.error('[Blog] Failed to fetch fallback related posts:', error);
    }

    // Fallback if no category matches
    if (relatedPosts.length === 0) {
        try {
            relatedPosts = await prisma.post.findMany({
                where: { status: 'published', id: { not: post.id } },
                take: 3,
                orderBy: { publishedAt: 'desc' },
                include: { authorModel: { select: { id: true, name: true, slug: true, image: true } } },
            });
    } catch (error) {
        console.error('[Blog] Failed to fetch related posts:', error);
    }
    }

    const resolvedAuthor = resolvePostAuthor(post);
    const editorialFallback = getEditorialAuthor(resolvedAuthor.slug);
    const authorData = post.authorModel ? {
        name: post.authorModel.name,
        role: post.authorModel.role || 'Contributor',
        bio: post.authorModel.bio || '',
        avatar: post.authorModel.image || undefined,
        slug: post.authorModel.slug,
        socialLinks: post.authorModel.socialLinks as any
    } : {
        name: resolvedAuthor.name,
        role: editorialFallback?.role || 'Contributor',
        bio: editorialFallback?.bio || '',
        avatar: resolvedAuthor.avatar,
        slug: resolvedAuthor.slug,
        socialLinks: editorialFallback?.socialLinks as any
    };

    // Server-side HTML parsing for TOC IDs
    const $ = cheerio.load(sanitizeBlogHtml(post.content));
    $('h1').each((_, el) => {
        const $heading = $(el);
        if (!$heading.text().trim()) {
            $heading.remove();
            return;
        }

        const attrs = Object.entries((el as any).attribs || {})
            .map(([key, value]) => ` ${key}="${String(value).replace(/"/g, '&quot;')}"`)
            .join('');
        $heading.replaceWith(`<h2${attrs}>${$heading.html() || ''}</h2>`);
    });
    const headingIds = new Map<string, number>();
    const tocItems: Array<{ id: string; text: string; level: number }> = [];
    $('h2, h3').each((i, el) => {
        const text = $(el).text();
        const baseId = ($(el).attr('id') || text)
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/^-+|-+$/g, '') || `section-${i + 1}`;
        const count = headingIds.get(baseId) || 0;
        headingIds.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
        $(el).attr('id', id);
        tocItems.push({
            id,
            text,
            level: el.tagName.toLowerCase() === 'h2' ? 2 : 3,
        });
    });
    const parsedContent = normalizeEvergreenYear($('body').html() || post.content);

    // Structured Data JSON-LD
    const currentUrl = `${getBaseUrl()}/blog/${post.slug}/`;
    
    const jsonLdArticle = {
        '@context': 'https://schema.org',
        '@type': post.postType === 'review' || postCategories.some((category: string) => category.toLowerCase() === 'reviews') ? 'Review' : 'Article',
        headline: displayTitle,
        description: displayExcerpt,
        image: [featuredImageUrl],
        datePublished: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: {
            '@type': 'Person',
            name: authorData.name,
            url: `${getBaseUrl()}/author/${authorData.slug || resolvedAuthor.slug}/`
        },
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
            logo: {
                '@type': 'ImageObject',
                url: `${getBaseUrl()}/images/logo.svg`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': currentUrl,
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
                name: displayTitle,
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

            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: displayTitle },
                        ]}
                        className="mb-8"
                    />

                    {/* Article Header */}
                    <header className="max-w-4xl mx-auto mb-12">
                        {/* Categories */}
                        {postCategories.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {postCategories.map((cat: string) => (
                                    <Link
                                        key={cat}
                                        href={`/blog/?category=${encodeURIComponent(cat)}`}
                                        className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:border-black hover:text-black transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black leading-tight mb-6">
                            {displayTitle}
                        </h1>

                        {displayExcerpt && (
                            <p className="text-gray-700 text-lg leading-relaxed mb-6">{displayExcerpt}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 pb-6 border-b border-gray-200">
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

                    <div className="max-w-4xl mx-auto">
                        <AffiliateDisclosure />
                    </div>

                    {/* Featured Image */}
                    <div className="max-w-5xl mx-auto relative w-full aspect-[2/1] md:aspect-[21/9] rounded-3xl overflow-hidden mb-16 border border-gray-200 shadow-xl">
                        <Image
                            src={featuredImage}
                            alt={`${displayTitle} — HyzenPro article cover`}
                            fill
                            preload
                            unoptimized={isSvgFeaturedImage}
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 1024px"
                        />
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sticky Left Sidebar - Socials */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-32">
                                <SocialShare url={currentUrl} title={displayTitle} />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <article
                                className="prose prose-lg blog-article max-w-none mb-16
                  prose-headings:font-heading prose-headings:text-black prose-headings:scroll-mt-28
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-strong:text-gray-800
                  prose-a:text-blue-700 prose-a:underline prose-a:decoration-blue-300 prose-a:underline-offset-4 hover:prose-a:text-blue-900 hover:prose-a:decoration-blue-700
                  prose-ul:text-gray-700 prose-ol:text-gray-700
                  prose-li:marker:text-gray-700
                  prose-blockquote:border-gray-400 prose-blockquote:text-gray-700 prose-blockquote:italic
                  prose-table:text-sm prose-th:bg-gray-950 prose-th:text-white
                  prose-img:rounded-2xl prose-img:border prose-img:border-gray-200 prose-img:shadow-sm"
                            >
                                <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
                            </article>

                            {/* Tags */}
                            {postTags.length > 0 && (
                                <div className="mb-10 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                         <Tag className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                                        {postTags.map((tag: string) => (
                                            <Link
                                                key={tag}
                                                href={`/blog/?tag=${encodeURIComponent(tag)}`}
                                                className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[11px] font-medium text-gray-700 hover:bg-black hover:text-white hover:border-black transition-colors"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <InternalLinkingPanel links={internalLinks} />

                            <div className="mb-16">
                                <MatcherDiscoveryCard context={matcherContext} />
                            </div>

                            {/* Author Box Footer */}
                            <div className="mt-16 pt-12 border-t border-gray-200">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-6">About the Author</h3>
                                <AuthorBox author={{ ...authorData, avatar: authorData.avatar ?? undefined }} variant="full" />
                            </div>

                            {/* Mobile Social Share */}
                            <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
                                <h3 className="font-heading text-sm text-gray-700 uppercase tracking-widest mb-4">Share This Article</h3>
                                <SocialShare url={currentUrl} title={displayTitle} />
                            </div>
                        </div>

                        {/* Sticky Right Sidebar - TOC */}
                        <div className="lg:col-span-4 xl:col-span-3 order-first lg:order-last mb-10 lg:mb-0">
                            <div className="sticky top-32">
                                <TableOfContents items={tocItems} />
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
                                    <PostCard key={relatedPost.id} post={relatedPost} />
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
