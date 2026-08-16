import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { getBlogDisplayExcerpt, getBlogDisplayTitle, getBlogFeaturedImage, getBlogPostPath } from '@/lib/blog-seo';
import { formatDateShort, calculateReadingTime, stripHtml, truncate } from '@/lib/utils';
import { resolvePostAuthor } from '@/lib/post-author';

interface PostCardProps {
    post: {
        title: string;
        slug: string;
        excerpt?: string | null;
        content?: string;
        featuredImage?: string | null;
        categories?: string[] | null;
        author?: string | null;
        authorModel?: {
            id: string;
            name: string;
            slug: string;
            image?: string | null;
        } | null;
        publishedAt?: Date | string | null;
    };
    priority?: boolean;
}

export default function PostCard({ post, priority = false }: PostCardProps) {
    const readingTime = post.content ? calculateReadingTime(post.content) : 5;
    const title = getBlogDisplayTitle(post);
    const excerpt = getBlogDisplayExcerpt(post) || (post.content ? truncate(stripHtml(post.content), 120) : '');
    const featuredImage = getBlogFeaturedImage(post);
    const isSvgImage = featuredImage.toLowerCase().split('?')[0].endsWith('.svg');
    const categories = Array.isArray(post.categories) ? post.categories.filter(Boolean) : [];
    const resolvedAuthor = resolvePostAuthor(post);

    return (
        <Link
            href={getBlogPostPath(post.slug)}
            className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className="relative h-48 overflow-hidden bg-gray-50 rounded-t-3xl">
                {isSvgImage ? (
                    <img
                        src={featuredImage}
                        alt={title}
                        loading={priority ? 'eager' : 'lazy'}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <Image
                        src={featuredImage}
                        alt={title}
                        fill
                        priority={priority}
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}

                {categories.length > 0 && (
                    <div className="absolute top-3 left-3 flex gap-1.5">
                        {categories.slice(0, 2).map((cat) => (
                            <span
                                key={cat}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/70 backdrop-blur-sm rounded-full"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {resolvedAuthor.name}
                    </span>
                    {post.publishedAt && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateShort(post.publishedAt)}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime} min
                    </span>
                </div>

                <h3 className="font-heading text-xl text-black group-hover:text-gray-600 transition-colors duration-300 line-clamp-2 mb-2">
                    {title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {excerpt}
                </p>

                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-black transition-colors duration-300 flex items-center gap-1">
                    Read More
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </Link>
    );
}
