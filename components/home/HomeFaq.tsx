'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
    q: string;
    a: string;
}

interface HomeFaqProps {
    items: FaqItem[];
}

export default function HomeFaq({ items }: HomeFaqProps) {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
        <div className="divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card">
            {items.map((item, i) => (
                <div key={i}>
                    <button
                        onClick={() => setOpenIdx(openIdx === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium transition hover:bg-foreground/[0.02]"
                        aria-expanded={openIdx === i}
                    >
                        {item.q}
                        <ChevronDown
                            className={`h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-200 ${openIdx === i ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {openIdx === i && (
                        <div className="px-6 pb-5 text-sm text-foreground/60 leading-relaxed">
                            {item.a}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
