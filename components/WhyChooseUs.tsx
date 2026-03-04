'use client';

import { motion } from 'framer-motion';

const reasons = [
    {
        number: '01',
        title: 'Expert Reviews',
        description: 'In-depth analysis and hands-on testing of every AI tool we feature.',
        features: ['Detailed pros and cons', 'Real-world testing', 'Honest ratings'],
    },
    {
        number: '02',
        title: 'Comprehensive Comparisons',
        description: 'Side-by-side comparisons to help you make informed decisions.',
        features: ['Feature-by-feature analysis', 'Pricing breakdown', 'Use case matching'],
    },
    {
        number: '03',
        title: 'Trusted Community',
        description: 'Join thousands of professionals who rely on our recommendations.',
        features: ['50K+ monthly readers', 'Active discussions', 'User reviews'],
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-white section">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="section-tag">Why HyzenPro</p>
                    <h2 className="section-title text-black">Why Choose Us</h2>
                </div>

                {/* Content */}
                <div className="space-y-0">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={reason.number}
                            className={`grid md:grid-cols-2 gap-8 items-center py-16 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'
                                } ${index !== reasons.length - 1 ? 'border-b border-gray-100' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            {/* Number & Image Side */}
                            <div className={`relative ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
                                <div className="font-heading text-[8rem] md:text-[12rem] text-gray-100 leading-none">
                                    {reason.number}
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className={`${index % 2 !== 0 ? 'md:order-1' : ''}`}>
                                <h3 className="font-heading text-4xl md:text-5xl text-black mb-4">
                                    {reason.title}
                                </h3>
                                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                    {reason.description}
                                </p>
                                <ul className="space-y-3">
                                    {reason.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
