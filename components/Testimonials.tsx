'use client';

import { motion } from 'framer-motion';

const testimonials = [
    {
        quote: "HyzenPro helped me find the perfect AI writing tool. Their reviews are incredibly detailed and honest.",
        author: "Sarah Chen",
        role: "Content Creator",
        rating: 5,
    },
    {
        quote: "The comparison guides saved me hours of research. I finally found an AI tool that fits my workflow.",
        author: "Michael Rodriguez",
        role: "Marketing Manager",
        rating: 5,
    },
    {
        quote: "Best AI tools directory out there. The team really knows what they're talking about.",
        author: "Emma Thompson",
        role: "Freelance Writer",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section className="bg-black section">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="section-tag text-gray-400">Testimonials</p>
                    <h2 className="section-title text-white">What Our Readers Say</h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            className="bg-white/5 p-8 rounded-2xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <span key={i} className="text-yellow-500">★</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                "{testimonial.quote}"
                            </p>

                            {/* Author */}
                            <div>
                                <p className="text-white font-semibold">{testimonial.author}</p>
                                <p className="text-gray-500 text-sm">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
