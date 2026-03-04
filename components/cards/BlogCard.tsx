'use client';

import Link from 'next/link';

interface BlogCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        featuredImage: string;
        categories: string[];
        author: string;
        date: string;
    };
}

export default function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Estimate reading time (approx 200 words per minute)
    const readingTime = Math.max(3, Math.ceil(post.excerpt.split(' ').length / 40));

    return (
        <article className="blog-card group">
            <Link href={`/blog/${post.slug}`}>
                {/* Featured Image */}
                <div className="blog-card-image">
                    <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="blog-card-overlay" />

                    {/* Categories */}
                    <div className="blog-card-categories">
                        {post.categories.slice(0, 2).map((cat, idx) => (
                            <span key={idx} className="blog-card-category-pill">
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="blog-card-content">
                    {/* Meta Info */}
                    <div className="blog-card-meta">
                        <span className="flex items-center gap-2">
                            <span className="blog-card-author-avatar">
                                {post.author.charAt(0)}
                            </span>
                            {post.author}
                        </span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{readingTime} min read</span>
                    </div>

                    {/* Title */}
                    <h3 className="blog-card-title">{post.title}</h3>

                    {/* Excerpt */}
                    <p className="blog-card-excerpt">{post.excerpt}</p>

                    {/* Read More */}
                    <span className="blog-card-cta">
                        Read Article <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </span>
                </div>
            </Link>
        </article>
    );
}
