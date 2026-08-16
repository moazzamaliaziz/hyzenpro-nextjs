'use client';

import { useEffect, useRef, useState } from 'react';
import { toolHeadingFont, toolMonoFont } from '@/lib/tool-page-fonts';
import type { RatingCategory } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageRatingBreakdownProps {
    toolName: string;
    overallRating: number;
    categories: RatingCategory[];
    summary: string;
    accent: string;
}

const ringRadius = 58;
const ringCircumference = 2 * Math.PI * ringRadius;

export default function ToolPageRatingBreakdown({
    toolName,
    overallRating,
    categories,
    summary,
    accent,
}: ToolPageRatingBreakdownProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setHasAnimated(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.35,
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const ringOffset = ringCircumference - (Math.max(0, Math.min(5, overallRating)) / 5) * ringCircumference;

    return (
        <section
            id="ratings"
            ref={sectionRef}
            className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16"
        >
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                Our {toolName} Rating
            </h2>

            <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
                <div className="flex flex-col items-center rounded-[8px] border border-[#E5E7EB] bg-white px-6 py-8">
                    <div className="relative h-36 w-36">
                        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                            <circle
                                cx="70"
                                cy="70"
                                r={ringRadius}
                                stroke="#E5E7EB"
                                strokeWidth="10"
                                fill="none"
                            />
                            <circle
                                cx="70"
                                cy="70"
                                r={ringRadius}
                                stroke={accent}
                                strokeWidth="10"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={ringCircumference}
                                strokeDashoffset={hasAnimated ? ringOffset : ringCircumference}
                                style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={cn(toolMonoFont.className, 'text-[36px] font-medium leading-none text-[#0F0F0F]')}>
                                {overallRating.toFixed(1)}
                            </div>
                            <div className="mt-2 text-[13px] uppercase tracking-[0.16em] text-[#6B7280]">
                                Overall
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-1 text-[#6B7280]">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <span
                                key={index}
                                className="h-2 w-8 rounded-full"
                                style={{ backgroundColor: index < Math.round(overallRating) ? accent : '#E5E7EB' }}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    {categories.map((category) => (
                        <div key={category.label} className="grid grid-cols-[120px_minmax(0,1fr)_48px] items-center gap-4">
                            <div className="text-[14px] leading-[1.6] text-[#374151]">
                                {category.label}
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-[#F3F4F6]">
                                <div
                                    className="h-full origin-left rounded-full"
                                    style={{
                                        transform: `scaleX(${hasAnimated ? category.score / 5 : 0})`,
                                        background: 'linear-gradient(90deg, #737373 0%, #111111 100%)',
                                        transition: 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                />
                            </div>
                            <div className={cn(toolMonoFont.className, 'text-right text-[14px] text-[#0F0F0F]')}>
                                {category.score.toFixed(1)}
                            </div>
                        </div>
                    ))}

                    <p className="pt-3 text-[15px] leading-[1.75] text-[#4B5563]">
                        {summary}
                    </p>
                </div>
            </div>
        </section>
    );
}
