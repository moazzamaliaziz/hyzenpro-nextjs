import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { AlternativeTool } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageAlternativesProps {
    toolName: string;
    alternatives: AlternativeTool[];
    accent: string;
}

export default function ToolPageAlternatives({
    toolName,
    alternatives,
    accent,
}: ToolPageAlternativesProps) {
    if (alternatives.length === 0) {
        return null;
    }

    return (
        <section id="alternatives" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                Top {toolName} Alternatives
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-[1.75] text-[#4B5563]">
                If {toolName} is close but not quite right, these are the tools we would compare next.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                {alternatives.map((alternative) => {
                    const href = alternative.category
                        ? `/ai-tools-directory/${alternative.category}/${alternative.slug}/`
                        : `/ai-tools-directory/${alternative.slug}/`;

                    return (
                        <Link
                            key={alternative.slug}
                            href={href}
                            className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 transition-colors hover:bg-[#FAFAFA]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-[18px] font-semibold leading-[1.4] text-[#0F0F0F]">
                                        {alternative.name}
                                    </h3>
                                    {alternative.pricingLabel && (
                                        <div className="mt-2 text-[12px] uppercase tracking-[0.16em] text-[#6B7280]">
                                            {alternative.pricingLabel}
                                        </div>
                                    )}
                                </div>

                                {alternative.rating !== undefined && (
                                    <div className="inline-flex items-center gap-1 text-[13px] text-[#0F0F0F]">
                                        <Star className="h-4 w-4 fill-current text-black" />
                                        {alternative.rating.toFixed(1)}
                                    </div>
                                )}
                            </div>

                            <p className="mt-4 text-[15px] leading-[1.75] text-[#4B5563]">
                                {alternative.tagline}
                            </p>

                            <div className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-black">
                                Read review
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
