'use client';

import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES, PRICING_META, type StepProps } from './model';

export default function StepReview({ data, errors, update, jump }: StepProps & { jump: (i: number) => void }) {
    const categoryLabel = CATEGORIES.find((c) => c.slug === data.category)?.label || data.category || '—';
    const faqCount = data.faqs.filter((f) => f.question.trim() && f.answer.trim()).length;
    const rows: { label: string; value: React.ReactNode; step: number }[] = [
        { label: 'Name',      value: data.name || '—', step: 0 },
        { label: 'Tagline',   value: data.tagline || '—', step: 0 },
        { label: 'Website',   value: data.website || '—', step: 0 },
        { label: 'Category',  value: categoryLabel, step: 1 },
        { label: 'Audiences', value: data.audiences.join(', ') || '—', step: 1 },
        { label: 'Pros',      value: data.pros.filter(Boolean).join('; ') || '—', step: 1 },
        { label: 'Cons',      value: data.cons.filter(Boolean).join('; ') || '—', step: 1 },
        { label: 'Pricing',   value: `${data.pricing}${PRICING_META[data.pricing].needsPrice ? ` · ${data.startingPrice || '—'}` : ''}`, step: 2 },
        { label: 'FAQs',      value: `${faqCount} question(s) answered`, step: 3 },
        { label: 'Media',     value: `${data.screenshots.length} screenshot(s)${data.demoVideo ? ' · demo' : ''}`, step: 4 },
        { label: 'Contact',   value: `${data.submitterName || '—'} · ${data.submitterEmail || '—'}`, step: 5 },
    ];

    return (
        <div className="grid gap-6">
            <div className="overflow-hidden rounded-2xl border border-foreground/10">
                {rows.map((r, i) => (
                    <div key={r.label}
                        className={['flex items-center justify-between gap-3 px-4 py-3 text-sm',
                            i > 0 ? 'border-t border-foreground/10' : '',
                            'bg-background/60'].join(' ')}>
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">{r.label}</span>
                            <span className="min-w-0 truncate text-foreground/85">{r.value}</span>
                        </div>
                        <button type="button" onClick={() => jump(r.step)}
                            className="text-[12px] text-foreground/60 hover:text-foreground hover:underline transition-colors shrink-0">
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid gap-2 rounded-2xl border border-foreground/10 bg-cream/60 p-4 text-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input id="agree-guidelines" name="agreeGuidelines" type="checkbox" required checked={data.agreeGuidelines}
                        onChange={(e) => update('agreeGuidelines', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-foreground" />
                    <span className="text-foreground/80">
                        I&apos;ve read and agree to the editorial guidelines. The tool works as described and I&apos;m authorized to submit it.
                        <span className="ml-0.5 text-rose-600">*</span>
                    </span>
                </label>
                {errors.agreeGuidelines && <p className="pl-7 text-[12px] text-rose-600">{errors.agreeGuidelines}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.agreeContact}
                        onChange={(e) => update('agreeContact', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-foreground" />
                    <span className="text-foreground/80">
                        You may contact me with review feedback and one launch-week email. No newsletter enrollment.
                    </span>
                </label>
            </div>
        </div>
    );
}
