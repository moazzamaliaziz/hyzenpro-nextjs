import { BadgePercent, Ticket } from 'lucide-react';
import type { ToolOffer } from '@/lib/tool-page-types';

interface ToolPageOfferCardProps {
    toolName: string;
    websiteUrl: string;
    offer?: ToolOffer;
    bestValueNote?: string;
}

export default function ToolPageOfferCard({
    toolName,
    websiteUrl,
    offer,
    bestValueNote,
}: ToolPageOfferCardProps) {
    if (!offer && !bestValueNote) {
        return null;
    }

    const ctaUrl = offer?.ctaUrl || websiteUrl;
    const ctaLabel = offer?.ctaLabel || `See ${toolName} offer`;

    return (
        <div className="rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA] p-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                Buying note
            </div>

            {offer && (
                <div className="mt-4 rounded-[8px] border border-[#E5E7EB] bg-white p-4">
                    {offer.badge && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4B5563]">
                            <BadgePercent className="h-3.5 w-3.5" />
                            {offer.badge}
                        </div>
                    )}
                    <div className="mt-3 text-[16px] font-semibold leading-[1.45] text-[#0F0F0F]">
                        {offer.headline}
                    </div>
                    {offer.detail && (
                        <p className="mt-2 text-[14px] leading-[1.7] text-[#4B5563]">
                            {offer.detail}
                        </p>
                    )}
                    {offer.couponCode && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-[6px] border border-dashed border-[#D1D5DB] px-3 py-2 text-[13px] font-medium text-[#0F0F0F]">
                            <Ticket className="h-4 w-4" />
                            Code: <span className="font-mono">{offer.couponCode}</span>
                        </div>
                    )}
                    {offer.expiresAt && (
                        <div className="mt-2 text-[12px] text-[#6B7280]">
                            Offer ends {offer.expiresAt}
                        </div>
                    )}
                    <a
                        href={ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-[6px] border border-black bg-black px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
                    >
                        {ctaLabel}
                    </a>
                </div>
            )}

            {bestValueNote && (
                <p className="mt-4 text-[14px] leading-[1.7] text-[#4B5563]">
                    {bestValueNote}
                </p>
            )}
        </div>
    );
}
