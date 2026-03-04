'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Post } from '@/lib/wordpress';

interface BlogSectionProps {
    posts: Post[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section className="bg-[#f5f5f5] section">
            <div className="container">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                    <div>
                        <p className="section-tag">Latest Articles</p>
                        <h2 className="section-title text-black">From Our Blog</h2>
                    </div>
                    <Link
                        href="/blog"
                        className="text-black uppercase tracking-wider text-sm font-semibold hover:underline"
                    >
                        View All Articles →
                    </Link>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            {/* Image */}
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Categories */}
                                <div className="flex gap-2 mb-3">
                                    {post.categories.slice(0, 2).map((cat) => (
                                        <span key={cat} className="text-xs text-gray-500 uppercase tracking-wider">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <h3 className="font-heading text-2xl text-black mb-3 group-hover:text-accent transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{post.author}</span>
                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
