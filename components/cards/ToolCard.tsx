'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ToolCardProps {
    tool: {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        featuredImage: string;
        category: string;
        categorySlug: string;
        rating: number;
        pricing: string;
    };
}

export default function ToolCard({ tool }: ToolCardProps) {
    return (
        <article className="tool-card group">
            <Link href={`/ai-tools-directory/${tool.categorySlug}/${tool.slug}`}>
                <div className="tool-card-inner">
                    {/* Icon/Logo Section */}
                    <div className="tool-card-icon">
                        <img
                            src={tool.featuredImage}
                            alt={tool.title}
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="tool-card-content">
                        {/* Header with Title and Rating */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="tool-card-title">{tool.title}</h3>
                            <div className="tool-card-rating">
                                <span className="text-yellow-500">★</span>
                                <span>{tool.rating}</span>
                            </div>
                        </div>

                        {/* Category Badge */}
                        <div className="mb-3">
                            <span className="tool-card-category">{tool.category}</span>
                        </div>

                        {/* Excerpt */}
                        <p className="tool-card-excerpt">{tool.excerpt}</p>

                        {/* Footer with Pricing */}
                        <div className="tool-card-footer">
                            <span className="tool-card-pricing">{tool.pricing}</span>
                            <span className="tool-card-cta">
                                View Details <span className="ml-1">→</span>
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
