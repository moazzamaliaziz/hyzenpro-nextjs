'use client';

import { useState } from 'react';
import { Check, CircleAlert, X, Zap } from 'lucide-react';
import { AUDIENCES, CATEGORIES, type Audience, type StepProps } from './model';
import { Counter, Field, TextArea } from './shared';

export default function StepDetails({ data, errors, update }: StepProps) {
    const [feat, setFeat] = useState('');
    const [pro, setPro] = useState('');
    const [con, setCon] = useState('');

    function addFeature(v: string) {
        const t = v.trim();
        if (!t) return;
        update('keyFeatures', [...data.keyFeatures, t].slice(0, 8));
        setFeat('');
    }

    function addToList(field: 'pros' | 'cons', value: string, setter: (v: string) => void) {
        const t = value.trim();
        if (!t) return;
        update(field, [...data[field], t].slice(0, 8));
        setter('');
    }

    function TagInput({ items, onAdd, onRemove, placeholder, error }: {
        items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
        placeholder: string; error?: string;
    }) {
        const [val, setVal] = useState('');
        return (
            <div>
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-foreground/15 bg-background/80 p-2">
                    {items.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground">
                            {f}
                            <button type="button" aria-label={`Remove ${f}`} onClick={() => onRemove(i)}
                                className="ml-0.5 rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input value={val} onChange={(e) => setVal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAdd(val); setVal(''); }
                        }}
                        placeholder={items.length ? 'Add another…' : placeholder}
                        className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                </div>
                {error && <p className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-600"><CircleAlert className="h-3 w-3 shrink-0" /> {error}</p>}
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Field label="Primary category" required error={errors.category} fieldId="category-group">
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => {
                        const active = data.category === c.slug;
                        return (
                            <button key={c.slug} type="button" onClick={() => update('category', c.slug)}
                                aria-pressed={active}
                                className={[
                                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                                    active ? 'bg-foreground text-primary-foreground'
                                           : 'border border-foreground/15 bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground',
                                ].join(' ')}>
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Who is it for?" required error={errors.audiences} fieldId="audience-group"
                hint="Pick every audience where you&apos;d expect real traction.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {AUDIENCES.map((a) => {
                        const active = data.audiences.includes(a.key);
                        return (
                            <button key={a.key} type="button"
                                onClick={() => {
                                    const s = new Set(data.audiences);
                                    s.has(a.key) ? s.delete(a.key) : s.add(a.key);
                                    update('audiences', Array.from(s) as Audience[]);
                                }}
                                aria-pressed={active}
                                className={[
                                    'group relative flex items-start gap-3 rounded-2xl border p-3 text-left transition',
                                    active ? 'border-foreground bg-foreground/5' : 'border-foreground/12 bg-background/60 hover:border-foreground/25',
                                ].join(' ')}>
                                <span className={['mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                                    active ? 'border-foreground bg-foreground text-primary-foreground' : 'border-foreground/25 bg-background'].join(' ')}>
                                    {active && <Check className="h-3 w-3" />}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-foreground">{a.key}</span>
                                    <span className="block text-[12px] text-foreground/55">{a.blurb}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Description" required error={errors.description} htmlFor="description"
                right={<Counter value={data.description.length} max={600} />}
                hint="What does it actually do? Skip marketing fluff — describe the outcome and how it gets there.">
                <TextArea id="description" name="description" minLength={80} maxLength={600} rows={5} placeholder="Submajic auto-captions video with speaker-aware timing…"
                    value={data.description} onChange={(e) => update('description', e.target.value)} invalid={!!errors.description} />
            </Field>

            <Field label="Key features (min 3)" required error={errors.keyFeatures} fieldId="key-features-group"
                hint="Type a feature and press Enter. Keep them concrete, not slogans.">
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-foreground/15 bg-background/80 p-2">
                    {data.keyFeatures.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground">
                            <Zap className="h-3 w-3 text-foreground/50" /> {f}
                            <button type="button" aria-label={`Remove ${f}`}
                                onClick={() => update('keyFeatures', data.keyFeatures.filter((_, idx) => idx !== i))}
                                className="ml-0.5 rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        id="key-features" name="keyFeatures" aria-describedby={errors.keyFeatures ? 'submit-key-features-group-hint submit-key-features-group-error' : 'submit-key-features-group-hint'} value={feat}
                        onChange={(e) => setFeat(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addFeature(feat);
                            }
                        }}
                        placeholder={data.keyFeatures.length ? 'Add another…' : 'e.g. Speaker diarization'}
                        className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35"
                    />
                </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Pros (min 1)" fieldId="pros-group" error={errors.pros} hint="What makes this tool stand out? Press Enter to add.">
                    <TagInput items={data.pros} placeholder="e.g. Real-time collaboration"
                        onAdd={(v) => addToList('pros', v, setPro)}
                        onRemove={(i) => update('pros', data.pros.filter((_, idx) => idx !== i))} />
                </Field>
                <Field label="Cons (min 1)" fieldId="cons-group" error={errors.cons} hint="Honest limitations help readers. Press Enter to add.">
                    <TagInput items={data.cons} placeholder="e.g. Steep learning curve"
                        onAdd={(v) => addToList('cons', v, setCon)}
                        onRemove={(i) => update('cons', data.cons.filter((_, idx) => idx !== i))} />
                </Field>
            </div>

            <Field label="Notes for the review team" fieldId="review-notes"
                hint="Optional. Launch context, differentiators, or anything the HyzenPro editors should know.">
                <TextArea rows={3} placeholder="We're launching on Product Hunt next Tuesday…"
                    id="review-notes" name="reviewNotes" maxLength={1000} value={data.reviewNotes} onChange={(e) => update('reviewNotes', e.target.value)} />
            </Field>
        </div>
    );
}
