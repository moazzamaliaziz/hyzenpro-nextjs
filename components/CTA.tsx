'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
    return (
        <section className="bg-white section">
            <div className="container">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-heading text-5xl md:text-7xl text-black mb-6">
                        READY TO FIND YOUR<br />
                        <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>
                            PERFECT AI TOOL?
                        </span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
                        Browse our comprehensive directory of AI tools and find the perfect solution for your needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/ai-tools-directory"
                            className="btn bg-black text-white hover:bg-gray-800 rounded-full"
                        >
                            Browse All Tools
                        </Link>
                        <Link
                            href="/contact"
                            className="btn bg-transparent text-black border-2 border-black hover:bg-black hover:text-white rounded-full"
                        >
                            Contact Us
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
