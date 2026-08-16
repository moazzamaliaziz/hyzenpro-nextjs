import { ArrowRight } from 'lucide-react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import { cn } from '@/lib/utils';

interface ToolPageVerdictProps {
    toolName: string;
    verdictHtml: string;
    bestFor: string[];
    skipIf: string[];
    websiteUrl: string;
    accent: string;
    accentSoft: string;
}

export default function ToolPageVerdict({
    toolName,
    verdictHtml,
    bestFor,
    skipIf,
    websiteUrl,
    accent,
    accentSoft,
}: ToolPageVerdictProps) {
    return (
        <section
            id="verdict"
            className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16"
        >
            <div
                className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-6 py-8 sm:px-8"
                style={{
                    borderLeft: '4px solid #111111',
                }}
            >
                <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                    HyzenPro Verdict on {toolName}
                </h2>

                <div
                    className="mt-6 space-y-5 text-[16px] leading-[1.85] text-[#374151]"
                    dangerouslySetInnerHTML={{ __html: verdictHtml }}
                />

                {bestFor.length > 0 && (
                    <div className="mt-8">
                        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                            Best for
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {bestFor.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full bg-black px-3 py-1.5 text-[13px] font-medium text-white"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {skipIf.length > 0 && (
                    <div className="mt-6 text-[15px] leading-[1.8] text-[#374151]">
                        <span className="font-semibold text-[#0F0F0F]">Skip if:</span>{' '}
                        {skipIf.join(' or ')}.
                    </div>
                )}

                <div className="mt-8">
                    <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] bg-black px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
                    >
                        Try {toolName} Free
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
