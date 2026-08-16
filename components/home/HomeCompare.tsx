'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolLogo from '@/components/ui/ToolLogo';
import { ArrowRight, Trophy, Star } from 'lucide-react';

interface Tool {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
    logo?: string | null;
    pricingType: string;
    rating?: number | null;
    primaryCategory?: string | null;
    features?: string[];
}

interface HomeCompareProps {
    tools: Tool[];
}

export default function HomeCompare({ tools }: HomeCompareProps) {
    const [toolAIdx, setToolAIdx] = useState(0);
    const [toolBIdx, setToolBIdx] = useState(1);

    const toolA = tools[toolAIdx] || tools[0];
    const toolB = tools[toolBIdx] || tools[1];

    const winner = !toolA || !toolB ? null
        : (toolA.rating || 0) === (toolB.rating || 0) ? null
        : (toolA.rating || 0) > (toolB.rating || 0) ? 'a' : 'b';

    if (!toolA || !toolB) return null;

    return (
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/50">Side-by-side</p>
                <h2 className="mt-2 font-serif text-4xl md:text-6xl">Two tools.<br /><span className="italic opacity-70">One honest verdict.</span></h2>
                <p className="mt-5 max-w-md text-primary-foreground/70">
                    Pick any two tools from our index. We&apos;ll surface pricing, free tier, key features, and what each one is best for.
                </p>
                <div className="mt-8 grid gap-3">
                    <div>
                        <p className="mb-1.5 text-xs uppercase tracking-wider text-primary-foreground/50">Tool A</p>
                        <select
                            value={toolAIdx}
                            onChange={(e) => setToolAIdx(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-primary-foreground outline-none focus:border-white/40"
                            aria-label="Select first tool to compare"
                        >
                            {tools.map((t, i) => (
                                <option key={t.id} value={i}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="mb-1.5 text-xs uppercase tracking-wider text-primary-foreground/50">Tool B</p>
                        <select
                            value={toolBIdx}
                            onChange={(e) => setToolBIdx(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-primary-foreground outline-none focus:border-white/40"
                            aria-label="Select second tool to compare"
                        >
                            {tools.map((t, i) => (
                                <option key={t.id} value={i}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <p className="mt-4 text-xs text-primary-foreground/50">Tip: this comparison URL is shareable.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Tool A Card */}
                <div className={`relative rounded-3xl bg-card p-5 text-foreground ${winner === 'a' ? 'translate-y-6' : ''}`}>
                    {winner === 'a' && (
                        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                            <Trophy className="h-3 w-3" /> Top pick
                        </span>
                    )}
                    <div className="flex h-24 items-center justify-center">
                        <ToolLogo logo={toolA.logo} name={toolA.name} size="lg" />
                    </div>
                    <p className="mt-4 font-semibold">{toolA.name}</p>
                    <p className="text-xs text-foreground/60">{toolA.primaryCategory?.replace(/-/g, ' ').replace('ai ', '')}</p>
                </div>

                {/* Tool B Card */}
                <div className={`relative rounded-3xl bg-card p-5 text-foreground ${winner === 'b' ? 'translate-y-6' : ''}`}>
                    {winner === 'b' && (
                        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                            <Trophy className="h-3 w-3" /> Top pick
                        </span>
                    )}
                    <div className="flex h-24 items-center justify-center">
                        <ToolLogo logo={toolB.logo} name={toolB.name} size="lg" />
                    </div>
                    <p className="mt-4 font-semibold">{toolB.name}</p>
                    <p className="text-xs text-foreground/60">{toolB.primaryCategory?.replace(/-/g, ' ').replace('ai ', '')}</p>
                </div>

                {/* Comparison Row */}
                <div className="col-span-2 mt-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
                    {[
                        { label: 'Rating', a: toolA.rating?.toFixed(1) || '—', b: toolB.rating?.toFixed(1) || '—' },
                        { label: 'Pricing', a: toolA.pricingType || '—', b: toolB.pricingType || '—' },
                        { label: 'Category', a: toolA.primaryCategory?.replace(/-/g, ' ') || '—', b: toolB.primaryCategory?.replace(/-/g, ' ') || '—' },
                    ].map((row) => (
                        <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-white/10 py-2.5 first:border-t-0">
                            <span className="text-right text-primary-foreground/90">{row.a}</span>
                            <span className="text-[11px] uppercase tracking-wider text-primary-foreground/40">{row.label}</span>
                            <span className="text-left text-primary-foreground/90">{row.b}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
