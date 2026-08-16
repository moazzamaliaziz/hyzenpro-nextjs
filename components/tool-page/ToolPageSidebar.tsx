import { ExternalLink } from 'lucide-react';
import ToolPageOfferCard from '@/components/tool-page/ToolPageOfferCard';
import ToolPageTableOfContents from '@/components/tool-page/ToolPageTableOfContents';
import { getSocialIcon } from '@/components/tool-page/ToolPageIcons';
import type { SocialLink, ToolOffer } from '@/lib/tool-page-types';

interface SectionLink {
    id: string;
    label: string;
}

interface ToolPageSidebarProps {
    sections: SectionLink[];
    accent: string;
    toolName: string;
    websiteUrl: string;
    socialLinks: SocialLink[];
    currentDeal?: ToolOffer;
    bestValueNote?: string;
}

export default function ToolPageSidebar({
    sections,
    accent,
    toolName,
    websiteUrl,
    socialLinks,
    currentDeal,
    bestValueNote,
}: ToolPageSidebarProps) {
    return (
        <div className="sticky top-28 space-y-6">
            <ToolPageTableOfContents sections={sections} accent={accent} />

            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                    Quick Action
                </div>
                <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[6px] bg-black px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
                >
                    Try {toolName} Free
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>

            <ToolPageOfferCard
                toolName={toolName}
                websiteUrl={websiteUrl}
                offer={currentDeal}
                bestValueNote={bestValueNote}
            />

            {socialLinks.length > 0 && (
                <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-5">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                        Official Links
                    </div>
                    <div className="mt-4 space-y-2">
                        {socialLinks.map((link) => {
                            const Icon = getSocialIcon(link.platform);

                            return (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-[44px] items-center gap-3 rounded-[6px] border border-[#E5E7EB] px-4 py-3 text-[14px] text-[#0F0F0F] transition-colors hover:bg-[#F9FAFB]"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="capitalize">{link.platform}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
