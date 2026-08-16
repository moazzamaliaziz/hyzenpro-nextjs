'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
    question: string;
    answer: string;
}

interface PersonaFaqProps {
    faq: FaqItem[];
}

export default function PersonaFaq({ faq }: PersonaFaqProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faq?.length) return null;

    return (
        <section className="mb-16">
            <h2 className="font-serif text-3xl text-foreground mb-2">
                Frequently asked <span className="italic text-muted-foreground">questions</span>
            </h2>
            <p className="text-muted-foreground mb-8">Quick answers to common questions from professionals in your field.</p>
            <div className="space-y-3">
                {faq.map((item, i) => (
                    <div key={i} className="border border-border rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                        >
                            <span className="font-serif text-lg text-foreground pr-4">{item.question}</span>
                            <ChevronDown
                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
