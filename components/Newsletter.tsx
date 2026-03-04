'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate submission
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="bg-black section">
            <div className="container">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="section-tag text-gray-400">Stay Updated</p>
                    <h2 className="section-title text-white">
                        Get AI Tool Updates<br />Straight to Your Inbox
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Join 5,000+ professionals who get our weekly roundup of the best AI tools and tips.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-6 py-4 rounded-full bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>

                    {status === 'success' && (
                        <motion.p
                            className="text-green-400 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            ✓ Thank you for subscribing!
                        </motion.p>
                    )}

                    <p className="text-gray-600 text-sm mt-4">
                        No spam, unsubscribe anytime.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
