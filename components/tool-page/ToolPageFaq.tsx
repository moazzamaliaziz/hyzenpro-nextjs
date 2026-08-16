'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { FAQItem } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageFaqProps {
    toolName: string;
    items: FAQItem[];
}

export default function ToolPageFaq({
    toolName,
    items,
}: ToolPageFaqProps) {
    const [openIndex, setOpenIndex] = useState(0);

    if (items.length === 0) {
        return null;
    }

    return (
        <section id="faq" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                {toolName} FAQ
            </h2>

            <div className="mt-8 border-t border-[#F3F4F6]">
                {items.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div key={item.question} className="border-b border-[#F3F4F6]">
                            <button
                                type="button"
                                onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                                className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left"
                                aria-expanded={isOpen}
                            >
                                <span className="text-[15px] font-medium leading-[1.7] text-[#0F0F0F]">
                                    {item.question}
                                </span>
                                <Plus className={cn('h-4 w-4 flex-none text-[#6B7280] transition-transform duration-200', isOpen && 'rotate-45')} />
                            </button>

                            <div
                                className={cn(
                                    'overflow-hidden transition-[max-height,opacity] duration-300',
                                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                )}
                            >
                                <div className="pb-5 pr-8 text-[14px] leading-[1.7] text-[#6B7280]">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
