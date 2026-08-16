import { Check, Minus } from 'lucide-react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { ToolFeatureHighlight, ToolReviewPoint } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageContentSectionsProps {
    toolName: string;
    overviewHtml: string;
    uniqueValueHtml?: string;
    featureHighlights: ToolFeatureHighlight[];
    prosDetailed: ToolReviewPoint[];
    consDetailed: ToolReviewPoint[];
    accent: string;
    accentSoft: string;
}

export default function ToolPageContentSections({
    toolName,
    overviewHtml,
    uniqueValueHtml,
    featureHighlights,
    prosDetailed,
    consDetailed,
    accent,
    accentSoft,
}: ToolPageContentSectionsProps) {
    return (
        <>
            <section id="overview" className="scroll-mt-28 pt-10 sm:pt-12">
                <div className="max-w-none">
                    <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                        What Is {toolName} and What Makes It Worth Using?
                    </h2>
                    <div
                        className="mt-6 space-y-5 text-[15px] leading-[1.75] text-[#374151]"
                        dangerouslySetInnerHTML={{ __html: overviewHtml }}
                    />

                    {uniqueValueHtml && (
                        <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-6">
                            <h3 className="text-[18px] font-semibold leading-[1.4] text-[#0F0F0F]">
                                What makes {toolName} unique?
                            </h3>
                            <div
                                className="mt-4 space-y-4 text-[15px] leading-[1.75] text-[#374151]"
                                dangerouslySetInnerHTML={{ __html: uniqueValueHtml }}
                            />
                        </div>
                    )}
                </div>
            </section>

            {featureHighlights.length > 0 && (
                <section id="features" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
                    <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                        {toolName} Features We Would Actually Use
                    </h2>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {featureHighlights.map((feature) => (
                            <article key={feature.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#E5E7EB] bg-[#FAFAFA] text-black">
                                    <Check className="h-4 w-4" />
                                </div>
                                <h3 className="mt-4 text-[18px] font-semibold leading-[1.4] text-[#0F0F0F]">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 text-[15px] leading-[1.75] text-[#4B5563]">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {(prosDetailed.length > 0 || consDetailed.length > 0) && (
                <section id="pros-cons" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
                    <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                        {toolName} Pros and Cons
                    </h2>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                                Pros
                            </div>
                            {prosDetailed.map((pro) => (
                                <article key={pro.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5] text-black">
                                            <Check className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className="text-[17px] font-semibold leading-[1.5] text-[#0F0F0F]">
                                                {pro.title}
                                            </h3>
                                            <p className="mt-2 text-[15px] leading-[1.75] text-[#4B5563]">
                                                {pro.description}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                                Cons
                            </div>
                            {consDetailed.map((con) => (
                                <article key={con.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF7ED] text-[#9A3412]">
                                            <Minus className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className="text-[17px] font-semibold leading-[1.5] text-[#0F0F0F]">
                                                {con.title}
                                            </h3>
                                            <p className="mt-2 text-[15px] leading-[1.75] text-[#4B5563]">
                                                {con.description}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
