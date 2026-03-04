'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Category } from '@/lib/wordpress';

interface CategoriesProps {
    categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
    return (
        <section className="bg-black section">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="section-tag text-gray-400">Explore</p>
                    <h2 className="section-title text-white">Browse by Category</h2>
                    <p className="section-description text-gray-400">
                        Find the perfect AI tool for your specific needs
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/ai-tools-directory/${category.slug}`}
                                className="block p-6 bg-white/5 rounded-xl text-center hover:bg-white/10 transition-all group"
                            >
                                <span className="text-4xl mb-4 block">{category.icon}</span>
                                <h3 className="text-white font-heading text-xl mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {category.count} tools
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
