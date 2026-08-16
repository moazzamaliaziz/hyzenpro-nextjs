'use client';

import { ExternalLink, MapPin, MessageSquareQuote, Star } from 'lucide-react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { ExternalReviewSource } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageReviewsProps {
    toolName: string;
    intro?: string;
    reviewSources: ExternalReviewSource[];
}

function getReviewIcon(platform: string) {
    const normalized = platform.toLowerCase();

    if (normalized.includes('google')) {
        return MapPin;
    }

    if (normalized.includes('trustpilot')) {
        return Star;
    }

    return MessageSquareQuote;
}

export default function ToolPageReviews({
    toolName,
    intro,
    reviewSources,
}: ToolPageReviewsProps) {
    if (reviewSources.length === 0) {
        return null;
    }

    return (
        <section id="reviews" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                {toolName} Reviews and Reputation
            </h2>

            <p className="mt-4 max-w-3xl text-[15px] leading-[1.75] text-[#4B5563]">
                {intro || `We checked the main public review sources and business listing pages that buyers usually open before paying for ${toolName}.`}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                {reviewSources.map((source) => {
                    const Icon = getReviewIcon(source.platform);

                    return (
                        <article
                            key={`${source.platform}-${source.url}`}
                            className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FAFAFA] text-[#0F0F0F]">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <h3 className="text-[16px] font-semibold leading-[1.4] text-[#0F0F0F]">
                                        {source.platform}
                                    </h3>
                                    {(source.ratingText || source.reviewCountText) && (
                                        <div className="mt-1 text-[13px] text-[#6B7280]">
                                            {[source.ratingText, source.reviewCountText].filter(Boolean).join(' - ')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="mt-4 flex-1 text-[14px] leading-[1.75] text-[#4B5563]">
                                {source.summary}
                            </p>

                            <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-black"
                            >
                                Open {source.platform}
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
