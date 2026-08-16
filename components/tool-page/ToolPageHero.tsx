import Link from 'next/link';
import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import ToolPageLogo from '@/components/tool-page/ToolPageLogo';
import { toolHeadingFont, toolMonoFont } from '@/lib/tool-page-fonts';
import type { ToolHeroStat } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface CategoryLink {
    name: string;
    href: string;
}

interface ToolPageHeroProps {
    toolName: string;
    tagline: string;
    logo?: string | null;
    categoryLinks: CategoryLink[];
    overallRating: number;
    reviewCount?: number;
    verified: boolean;
    lastReviewedDate?: string;
    websiteUrl: string;
    stats: ToolHeroStat[];
    accent: string;
    accentSoft: string;
}

function RatingStars() {
    return (
        <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
            ))}
        </div>
    );
}

export default function ToolPageHero({
    toolName,
    tagline,
    logo,
    categoryLinks,
    overallRating,
    reviewCount,
    verified,
    lastReviewedDate,
    websiteUrl,
    stats,
    accent,
    accentSoft,
}: ToolPageHeroProps) {
    return (
        <section className="border-b border-[#F3F4F6] pb-10 pt-4 sm:pb-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
                <div className="space-y-6">
                    <div className="flex items-start gap-5">
                        <ToolPageLogo logo={logo} name={toolName} accent={accent} />
                        <div className="min-w-0 flex-1">
                            <h1 className={cn(toolHeadingFont.className, 'text-[28px] leading-[1.15] text-[#0F0F0F] sm:text-[36px]')}>
                                {toolName}
                            </h1>
                            <p className="mt-3 max-w-3xl text-[15px] leading-[1.75] text-[#4B5563]">
                                {tagline}
                            </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                                {categoryLinks.map((category) => (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-1.5 text-[13px] leading-6 text-[#4B5563] transition-colors hover:bg-white"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#0F0F0F]">
                        <div className="flex items-center gap-2 text-black">
                            <RatingStars />
                        </div>
                        <div className={cn(toolMonoFont.className, 'text-[14px] text-[#0F0F0F]')}>
                            {overallRating.toFixed(1)} {reviewCount ? `- ${reviewCount} reviews` : '- editorial review'}
                        </div>

                        {verified && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-[13px] font-medium text-white">
                                <BadgeCheck className="h-4 w-4" />
                                HyzenPro Verified
                            </div>
                        )}

                        {lastReviewedDate && (
                            <div className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[13px] text-[#4B5563]">
                                Last reviewed {lastReviewedDate}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] bg-black px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
                        >
                            Try {toolName} Free
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <a
                            href="#overview"
                            className="inline-flex min-h-[44px] items-center justify-center rounded-[6px] border border-black px-5 py-3 text-[14px] font-semibold text-[#0F0F0F] transition-colors hover:bg-black hover:text-white"
                        >
                            Read Full Review
                        </a>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#E5E5E5]">
                    <div className="grid grid-cols-2 gap-px sm:grid-cols-4 lg:grid-cols-2">
                        {stats.slice(0, 4).map((stat, index) => (
                            <div
                                key={stat.label}
                                className="bg-[#FAFAFA] px-5 py-5"
                            >
                                <div className="text-[12px] uppercase tracking-[0.18em] text-[#6B7280]">
                                    {stat.label}
                                </div>
                                <div className={cn(toolMonoFont.className, 'mt-3 text-[18px] font-medium leading-[1.2] text-[#0F0F0F]')}>
                                    {stat.value}
                                </div>
                                {stat.detail && (
                                    <div className="mt-2 text-[13px] leading-[1.6] text-[#6B7280]">
                                        {stat.detail}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
