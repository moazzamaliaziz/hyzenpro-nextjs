import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import {
    getBlogDisplayExcerpt,
    getBlogDisplayTitle,
    getBlogFeaturedImage,
    getBlogPostPath,
} from '@/lib/blog-seo';
import { resolveBlogImageSource } from '@/lib/blog-images';
import { formatDateShort, calculateReadingTime, stripHtml, truncate } from '@/lib/utils';
import { resolvePostAuthor } from '@/lib/post-author';
import type { BlogPostSummary } from '@/lib/blog-query';

interface PostCardProps {
    post: BlogPostSummary & {
        content?: string;
        publishedAt?: Date | string | null;
    };
    priority?: boolean;
    locale?: string;
}

export default function PostCard({ post, priority = false, locale = 'en' }: PostCardProps) {
    const readingTime = post.readingTime || (post.content ? calculateReadingTime(post.content) : 5);
    const title = getBlogDisplayTitle(post);
    const excerpt = getBlogDisplayExcerpt(post) || (post.content ? truncate(stripHtml(post.content), 120) : '');
    const featuredImage = resolveBlogImageSource(getBlogFeaturedImage(post));
    const isSvgImage = featuredImage.toLowerCase().split('?')[0].endsWith('.svg');
    const categories = Array.isArray(post.categories) ? post.categories.filter(Boolean) : [];
    const resolvedAuthor = resolvePostAuthor(post);
    const postHref = locale === 'en' ? getBlogPostPath(post.slug) : `/${locale}${getBlogPostPath(post.slug)}`;
    const imageAlt = `${title} — HyzenPro article cover`;

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg motion-reduce:transition-none">
            <Link
                href={postHref}
                className="relative block aspect-[16/10] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
                aria-label={`Read “${title}”`}
            >
                <Image
                    src={featuredImage}
                    alt={imageAlt}
                    fill
                    preload={priority}
                    fetchPriority={priority ? 'high' : undefined}
                    unoptimized={isSvgImage}
                    className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                    sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1279px) calc((100vw - 4rem) / 2), 360px"
                />
                {categories.length > 0 && (
                    <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
                        {categories.slice(0, 2).map((category) => (
                            <span key={category} className="rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                {category}
                            </span>
                        ))}
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-700">
                    <span className="flex items-center gap-1">
                        <User aria-hidden="true" className="h-3 w-3" />
                        {resolvedAuthor.name}
                    </span>
                    {post.publishedAt && (
                        <time dateTime={new Date(post.publishedAt).toISOString()} className="flex items-center gap-1">
                            <Calendar aria-hidden="true" className="h-3 w-3" />
                            {formatDateShort(post.publishedAt)}
                        </time>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock aria-hidden="true" className="h-3 w-3" />
                        {readingTime} min
                    </span>
                </div>

                <h3 className="font-heading mb-2 line-clamp-2 text-xl leading-tight text-black transition-colors duration-300 group-hover:text-gray-700">
                    <Link href={postHref} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
                        {title}
                    </Link>
                </h3>

                {excerpt && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700">{excerpt}</p>}

                <Link
                    href={postHref}
                    aria-label={`Read “${title}” article`}
                    className="mt-auto inline-flex min-h-11 w-fit items-center gap-1 rounded-sm text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors duration-300 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                    Read article
                    <ArrowRight aria-hidden="true" className="h-3 w-3 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                </Link>
            </div>
        </article>
    );
}
