'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tool } from '@/lib/wordpress';

interface ToolsGridProps {
    tools: Tool[];
    title: string;
    description: string;
}

export default function ToolsGrid({ tools, title, description }: ToolsGridProps) {
    return (
        <section className="bg-[#f5f5f5] section">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="section-tag">Discover</p>
                    <h2 className="section-title text-black">{title}</h2>
                    <p className="section-description text-gray-600">{description}</p>
                </div>

                {/* Tools Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool, index) => (
                        <motion.article
                            key={tool.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            {/* Image */}
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img
                                    src={tool.featuredImage}
                                    alt={tool.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-4 right-4 bg-black text-white text-xs px-3 py-1 rounded-full">
                                    {tool.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="font-heading text-2xl text-black mb-2 group-hover:text-accent transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {tool.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-semibold text-black">{tool.rating}</span>
                                    </div>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {tool.pricing}
                                    </span>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/ai-tools-directory/${tool.categorySlug}/${tool.slug}`}
                                    className="block w-full text-center mt-4 py-3 bg-black text-white text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    View Details →
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/ai-tools-directory"
                        className="inline-block btn bg-black text-white hover:bg-gray-800 rounded-full"
                    >
                        Browse All Tools
                    </Link>
                </div>
            </div>
        </section>
    );
}
