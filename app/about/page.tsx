'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';

const team = [
    {
        name: 'The HyzenPro Team',
        role: 'AI Enthusiasts & Reviewers',
        description: 'A passionate group of technology experts dedicated to testing and reviewing the best AI tools.',
        avatar: '👨‍💻'
    }
];

const values = [
    {
        icon: '🎯',
        title: 'Honest Reviews',
        description: 'We provide unbiased, in-depth reviews based on real testing and practical usage.'
    },
    {
        icon: '🔬',
        title: 'Thorough Testing',
        description: 'Every tool we review is tested extensively before we publish our findings.'
    },
    {
        icon: '💡',
        title: 'User-First Approach',
        description: 'Our recommendations are based on what works best for real users like you.'
    },
    {
        icon: '🚀',
        title: 'Stay Updated',
        description: 'We continuously update our reviews as AI tools evolve and improve.'
    }
];

export default function AboutPage() {
    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white">
                    <div className="container">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <p className="section-tag text-gray-400">About Us</p>
                                <h1 className="font-heading text-5xl md:text-7xl mb-6">
                                    YOUR TRUSTED<br />
                                    <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>
                                        AI RESOURCE
                                    </span>
                                </h1>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                    HyzenPro is your go-to destination for discovering the best AI tools.
                                    We provide expert reviews, detailed comparisons, and practical guidance
                                    to help you find the perfect AI solutions for your needs.
                                </p>
                                <Link
                                    href="/ai-tools"
                                    className="btn-primary inline-block rounded-full"
                                >
                                    Explore AI Tools
                                </Link>
                            </motion.div>

                            <motion.div
                                className="relative h-80 md:h-[500px]"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                                <div className="absolute inset-8 border border-white/20 rounded-2xl flex items-center justify-center">
                                    <span className="font-heading text-[15rem] text-white/5">AI</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-white py-16">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { number: '500+', label: 'Tools Reviewed' },
                                { number: '50K+', label: 'Monthly Readers' },
                                { number: '100+', label: 'Comparisons' },
                                { number: '4.8★', label: 'Average Rating' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="font-heading text-5xl text-black mb-2">{stat.number}</div>
                                    <div className="text-gray-600 text-sm uppercase tracking-wider">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="section bg-[#f5f5f5]">
                    <div className="container max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="section-tag">Our Mission</p>
                            <h2 className="font-heading text-4xl md:text-5xl text-black mb-8">
                                HELPING YOU NAVIGATE THE AI LANDSCAPE
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                With hundreds of AI tools launching every month, it can be overwhelming
                                to find the right one for your needs. Our mission is to cut through the
                                noise and provide you with honest, detailed reviews that help you make
                                informed decisions. We test each tool extensively so you don't have to.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Values */}
                <section className="section bg-black text-white">
                    <div className="container">
                        <div className="text-center mb-16">
                            <p className="section-tag text-gray-400">Our Values</p>
                            <h2 className="font-heading text-4xl md:text-5xl">WHAT WE STAND FOR</h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, i) => (
                                <motion.div
                                    key={value.title}
                                    className="bg-white/5 p-8 rounded-2xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="text-4xl mb-4">{value.icon}</div>
                                    <h3 className="font-heading text-2xl mb-3">{value.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section bg-white text-center">
                    <div className="container max-w-3xl">
                        <h2 className="font-heading text-4xl md:text-5xl text-black mb-6">
                            READY TO FIND YOUR PERFECT AI TOOL?
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Browse our comprehensive directory and read in-depth reviews.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/ai-tools" className="btn bg-black text-white rounded-full">
                                Browse AI Tools
                            </Link>
                            <Link href="/contact" className="btn bg-transparent border-2 border-black text-black rounded-full">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
