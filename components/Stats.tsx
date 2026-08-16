'use client';

import { motion } from 'framer-motion';

const stats = [
    { number: 'Focused', label: 'Coverage' },
    { number: 'Hands-On', label: 'Testing' },
    { number: 'Updated', label: 'Methodology' },
    { number: '12+', label: 'Categories' },
];

export default function Stats() {
    return (
        <section className="bg-white py-16">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="font-heading text-5xl md:text-6xl text-black mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-600 text-sm uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
