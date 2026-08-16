'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
        >
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                        top: '10%',
                        left: '10%',
                    }}
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                        bottom: '10%',
                        right: '10%',
                    }}
                    animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <motion.div
                className="container relative z-10 text-center text-white py-20"
                style={{ y, opacity }}
            >
                <motion.p
                    className="text-sm uppercase tracking-[0.4em] mb-8 text-gray-400 font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Discover • Compare • Choose
                </motion.p>

                <motion.h1
                    className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-[0.9] mb-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.span
                        className="block"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        AI TOOL
                    </motion.span>
                    <motion.span
                        className="block text-transparent"
                        style={{ WebkitTextStroke: '2px white' }}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        SHORTLISTS
                    </motion.span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-gray-400 font-light leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    Focused reviews, detailed comparisons, and practical guidance for teams choosing AI tools.
                    Find a tighter shortlist and move faster with more confidence.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                >
                    <Link
                        href="/ai-tools-directory"
                        className="group px-10 py-5 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-3"
                    >
                        Browse All Tools
                        <motion.span
                            className="text-lg"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </Link>
                    <Link
                        href="/about-us"
                        className="px-10 py-5 bg-transparent text-white text-sm font-semibold uppercase tracking-wider border-2 border-white/30 hover:border-white hover:bg-white hover:text-black transition-all"
                    >
                        Learn More
                    </Link>
                </motion.div>

                <motion.div
                    className="mt-20 pt-12 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: 'Focused', label: 'Coverage' },
                            { number: 'Hands-On', label: 'Testing' },
                            { number: 'Buyer', label: 'Decision Lens' },
                            { number: 'Live', label: 'Comparisons' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
                            >
                                <div className="font-heading text-4xl md:text-5xl text-white mb-1">
                                    {stat.number}
                                </div>
                                <div className="text-gray-500 text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                    <motion.div
                        className="w-1 h-2 bg-white rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>
        </section>
    );
}
