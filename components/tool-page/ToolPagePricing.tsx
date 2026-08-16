'use client';

import { useMemo, useState } from 'react';
import { toolHeadingFont, toolMonoFont } from '@/lib/tool-page-fonts';
import type { PricingTier } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPagePricingProps {
    toolName: string;
    tiers: PricingTier[];
    accent: string;
    accentSoft: string;
    lastReviewedDate?: string;
    intro?: string;
}

function formatPrice(price: number | null, currency: string, billing: 'monthly' | 'annual') {
    if (price === null) {
        return { value: 'Custom', unit: billing === 'monthly' ? 'pricing' : 'annual plan' };
    }

    if (price === 0) {
        return { value: 'Free', unit: billing === 'monthly' ? 'per month' : 'per year' };
    }

    return {
        value: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(price),
        unit: billing === 'monthly' ? 'per month' : 'per year',
    };
}

export default function ToolPagePricing({
    toolName,
    tiers,
    accent,
    accentSoft,
    lastReviewedDate,
    intro,
}: ToolPagePricingProps) {
    const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

    const displayTiers = useMemo(
        () =>
            tiers.map((tier) => ({
                ...tier,
                displayPrice: formatPrice(
                    billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice,
                    tier.currency,
                    billing
                ),
            })),
        [billing, tiers]
    );

    if (tiers.length === 0) {
        return null;
    }

    return (
        <section id="pricing" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                        How Much Does {toolName} Cost?
                    </h2>
                    {intro && (
                        <p className="mt-4 text-[15px] leading-[1.75] text-[#4B5563]">
                            {intro}
                        </p>
                    )}
                </div>

                <div className="inline-flex rounded-[6px] border border-[#E5E7EB] bg-white p-1">
                    {(['monthly', 'annual'] as const).map((option) => {
                        const active = billing === option;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setBilling(option)}
                                className="min-h-[44px] rounded-[6px] px-4 text-[14px] font-medium transition-colors"
                                style={{
                                    backgroundColor: active ? '#111111' : '#FFFFFF',
                                    color: active ? '#FFFFFF' : '#4B5563',
                                }}
                            >
                                {option === 'monthly' ? 'Monthly' : 'Annual'}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                {displayTiers.map((tier) => (
                    <article
                        key={tier.name}
                        className="relative flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6"
                        style={{
                            borderColor: tier.isPopular ? '#111111' : '#E5E7EB',
                        }}
                    >
                        {(tier.isPopular || tier.badge) && (
                            <div className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-black px-3 py-1 text-[12px] font-semibold text-white">
                                {tier.badge || 'Most Popular'}
                            </div>
                        )}

                        <div className="text-[12px] uppercase tracking-[0.18em] text-[#6B7280]">
                            {tier.name}
                        </div>
                        <div className="mt-4 flex items-end gap-2">
                            <div className={cn(toolMonoFont.className, 'text-[32px] font-light leading-none text-[#0F0F0F]')}>
                                {tier.displayPrice.value}
                            </div>
                            <div className="pb-1 text-[13px] text-[#6B7280]">
                                {tier.displayPrice.unit}
                            </div>
                        </div>

                        {billing === 'annual' && tier.annualNote && (
                            <div className="mt-3 text-[13px] leading-[1.6] text-[#6B7280]">
                                {tier.annualNote}
                            </div>
                        )}

                        <p className="mt-4 text-[15px] italic leading-[1.75] text-[#4B5563]">
                            {tier.description}
                        </p>

                        <ul className="mt-6 space-y-3 text-[14px] leading-[1.7] text-[#374151]">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-4 w-4 flex-none items-center justify-center" aria-hidden="true">
                                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                                            <path d="M3 8.5L6.5 12L13 4.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {tier.limitations && tier.limitations.length > 0 && (
                            <ul className="mt-4 space-y-2 text-[13px] leading-[1.6] text-[#9CA3AF]">
                                {tier.limitations.map((limitation) => (
                                    <li key={limitation} className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-4 w-4 flex-none items-center justify-center" aria-hidden="true">
                                            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                                                <path d="M4 4L12 12M4 12L12 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                        <span>{limitation}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {(tier.freeTrial || tier.moneyBackGuarantee) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tier.freeTrial && (
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
                                        {tier.freeTrial}
                                    </span>
                                )}
                                {tier.moneyBackGuarantee && (
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-700">
                                        {tier.moneyBackGuarantee} guarantee
                                    </span>
                                )}
                            </div>
                        )}

                        <a
                            href={tier.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-[6px] px-4 py-3 text-[14px] font-semibold transition-colors"
                            style={{
                                border: tier.isPopular ? '1px solid #111111' : '1px solid #E5E7EB',
                                backgroundColor: tier.isPopular ? '#111111' : '#FFFFFF',
                                color: tier.isPopular ? '#FFFFFF' : '#0F0F0F',
                            }}
                        >
                            {tier.ctaLabel}
                        </a>
                    </article>
                ))}
            </div>

            <p className="mt-6 text-[13px] leading-[1.7] text-[#6B7280]">
                Prices verified {lastReviewedDate || 'recently'}. Check the official site for the latest pricing.
            </p>
        </section>
    );
}
