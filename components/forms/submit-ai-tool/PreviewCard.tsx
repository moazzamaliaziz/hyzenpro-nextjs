'use client';

import { ArrowUpRight, Star } from 'lucide-react';
import { CATEGORIES, PRICING_META, isValidHttpUrl, type FormData } from './model';

export default function PreviewCard({ data }: { data: FormData }) {
    const initials = (data.name || '??').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    const categoryLabel = CATEGORIES.find((c) => c.slug === data.category)?.label || 'Category';
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_20px_60px_-40px_rgb(0,0,0,0.15)]">
            <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                    {categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-foreground/50">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> New
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/10 to-foreground/5 text-sm font-semibold text-foreground">
                    {data.logoUrl && isValidHttpUrl(data.logoUrl)
                        ? <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
                        : <span>{initials}</span>}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg leading-tight">{data.name || 'Your tool name'}</h3>
                    <p className="mt-0.5 truncate text-[12px] text-foreground/55">
                        {data.pricing}{PRICING_META[data.pricing].needsPrice && data.startingPrice ? ` · ${data.startingPrice}` : ''}
                    </p>
                </div>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-foreground/70">
                {data.tagline || 'A one-line pitch will appear here as you type.'}
            </p>

            {data.audiences.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {data.audiences.slice(0, 3).map((a) => (
                        <span key={a} className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] text-foreground/60">{a.split(' ')[0]}</span>
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                <span className="text-[11px] text-foreground/50">
                    {data.keyFeatures.filter(Boolean).length} feature{data.keyFeatures.filter(Boolean).length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    Visit <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
            </div>
        </article>
    );
}
