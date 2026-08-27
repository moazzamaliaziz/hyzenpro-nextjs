'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, Plus, X } from 'lucide-react';
import { BILLING_PERIODS, DEFAULT_CURRENCIES, PRICING_META, PRICING_ORDER, createEmptyTier, type PricingTierForm, type StepProps } from './model';
import { Field, TextInput, TextArea } from './shared';

export default function StepPricing({ data, errors, update }: StepProps) {
    const tiers = data.pricingTiers;

    function updateTier(i: number, patch: Partial<PricingTierForm>) {
        const next = [...tiers];
        next[i] = { ...next[i], ...patch };
        update('pricingTiers', next);
    }

    function addTier() {
        update('pricingTiers', [...tiers, createEmptyTier()]);
    }

    function removeTier(i: number) {
        update('pricingTiers', tiers.filter((_, idx) => idx !== i));
    }

    function moveTier(from: number, to: number) {
        if (to < 0 || to >= tiers.length) return;
        const next = [...tiers];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        update('pricingTiers', next);
    }

    function addFeatureToTier(i: number, value: string) {
        const v = value.trim();
        if (!v || tiers[i].features.includes(v)) return;
        updateTier(i, { features: [...tiers[i].features, v] });
    }

    function removeFeatureFromTier(i: number, fi: number) {
        updateTier(i, { features: tiers[i].features.filter((_, idx) => idx !== fi) });
    }

    function addLimitationToTier(i: number, value: string) {
        const v = value.trim();
        if (!v || tiers[i].limitations.includes(v)) return;
        updateTier(i, { limitations: [...tiers[i].limitations, v] });
    }

    function removeLimitationFromTier(i: number, li: number) {
        updateTier(i, { limitations: tiers[i].limitations.filter((_, idx) => idx !== li) });
    }

    const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({});
    const [limitInputs, setLimitInputs] = useState<Record<number, string>>({});

    return (
        <div className="grid gap-6">
            <Field label="Pricing model" required fieldId="pricing-group">
                <div className="grid gap-2 sm:grid-cols-2">
                    {PRICING_ORDER.map((p) => {
                        const meta = PRICING_META[p];
                        const active = data.pricing === p;
                        return (
                            <button key={p} type="button" onClick={() => update('pricing', p)}
                                aria-pressed={active}
                                className={[
                                    'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                                    active ? 'border-foreground bg-foreground/5' : 'border-foreground/12 bg-background/60 hover:border-foreground/25',
                                ].join(' ')}>
                                <span className={['grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                                    active ? 'bg-foreground text-primary-foreground' : 'bg-foreground/5 text-foreground/70'].join(' ')}>
                                    <DollarSign className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">{meta.label}</span>
                                    <span className="block text-[12px] text-foreground/55">{meta.hint}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Field>

            {PRICING_META[data.pricing].needsPrice && (
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Starting price" required error={errors.startingPrice} htmlFor="starting-price"
                        hint="Cheapest paid tier, per user, monthly.">
                        <TextInput id="starting-price" name="startingPrice" maxLength={80} placeholder="e.g. $19/mo" value={data.startingPrice}
                            onChange={(e) => update('startingPrice', e.target.value)} invalid={!!errors.startingPrice} />
                    </Field>
                    <Field label="Free tier available?">
                        <label className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/80 px-3.5 py-2.5 cursor-pointer">
                            <input type="checkbox" checked={data.hasFreeTier}
                                onChange={(e) => update('hasFreeTier', e.target.checked)}
                                className="h-4 w-4 rounded border-foreground/30 accent-foreground" />
                            <span className="text-sm text-foreground/80">Yes, there&apos;s a free tier or trial credit.</span>
                        </label>
                    </Field>
                </div>
            )}

            <div className="border-t border-foreground/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-heading text-lg">Pricing Plans</h3>
                        <p className="text-sm text-foreground/55">Add detailed pricing tiers for a professional comparison table.</p>
                    </div>
                    <button type="button" onClick={addTier}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/15 bg-background/80 px-3 py-1.5 text-sm font-medium hover:border-foreground/30 transition">
                        <Plus className="h-3.5 w-3.5" /> Add plan
                    </button>
                </div>

                {tiers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-foreground/15 bg-background/40 p-8 text-center">
                        <DollarSign className="mx-auto mb-3 h-8 w-8 text-foreground/25" />
                        <p className="text-sm text-foreground/55">No pricing plans yet. Click &quot;Add plan&quot; to create one.</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {tiers.map((tier, i) => (
                        <div key={i} className="rounded-2xl border border-foreground/12 bg-background/60 p-4 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <button type="button" onClick={() => moveTier(i, i - 1)} disabled={i === 0} aria-label={`Move pricing plan ${i + 1} up`}
                                            className="rounded p-0.5 text-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronLeft className="h-3 w-3 -rotate-90" /></button>
                                        <button type="button" onClick={() => moveTier(i, i + 1)} disabled={i === tiers.length - 1} aria-label={`Move pricing plan ${i + 1} down`}
                                            className="rounded p-0.5 text-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronRight className="h-3 w-3 -rotate-90" /></button>
                                    </div>
                                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-foreground/5 text-xs font-semibold text-foreground/60">{i + 1}</span>
                                </div>
                                <button type="button" onClick={() => removeTier(i)} aria-label={`Remove pricing plan ${i + 1}`}
                                    className="rounded-lg p-1.5 text-foreground/40 hover:text-red-600 hover:bg-red-50 transition"><X className="h-4 w-4" /></button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Plan name" htmlFor={`tier-${i}-name`} error={errors[`tier.${i}.name`]} hint="e.g. Starter, Pro, Enterprise">
                                    <TextInput placeholder="e.g. Pro" id={`tier-${i}-name`} name={`pricingTiers.${i}.name`} maxLength={120} value={tier.name}
                                        onChange={(e) => updateTier(i, { name: e.target.value })} />
                                </Field>
                                <Field label="Badge" htmlFor={`tier-${i}-badge`} error={errors[`tier.${i}.badge`]} hint="Optional — e.g. Most Popular, Best Value">
                                    <TextInput placeholder="e.g. Most Popular" id={`tier-${i}-badge`} name={`pricingTiers.${i}.badge`} maxLength={60} value={tier.badge}
                                        onChange={(e) => updateTier(i, { badge: e.target.value })} />
                                </Field>
                            </div>

                            <Field label="Description" htmlFor={`tier-${i}-description`} error={errors[`tier.${i}.description`]} hint="One-liner for this tier.">
                                <TextInput placeholder="e.g. For professionals and small teams" id={`tier-${i}-description`} name={`pricingTiers.${i}.description`} maxLength={300} value={tier.description}
                                    onChange={(e) => updateTier(i, { description: e.target.value })} />
                            </Field>

                            <div className="grid gap-3 sm:grid-cols-4">
                                <Field label="Monthly price" htmlFor={`tier-${i}-monthlyPrice`} error={errors[`tier.${i}.monthlyPrice`]} >
                                    <TextInput placeholder="e.g. 29" id={`tier-${i}-monthlyPrice`} name={`pricingTiers.${i}.monthlyPrice`} inputMode="decimal" maxLength={24} value={tier.monthlyPrice}
                                        onChange={(e) => updateTier(i, { monthlyPrice: e.target.value })} />
                                </Field>
                                <Field label="Annual price" htmlFor={`tier-${i}-annualPrice`} error={errors[`tier.${i}.annualPrice`]} >
                                    <TextInput placeholder="e.g. 290" id={`tier-${i}-annualPrice`} name={`pricingTiers.${i}.annualPrice`} inputMode="decimal" maxLength={24} value={tier.annualPrice}
                                        onChange={(e) => updateTier(i, { annualPrice: e.target.value })} />
                                </Field>
                                <Field label="Currency" htmlFor={`tier-${i}-currency`}>
                                    <select id={`tier-${i}-currency`} name={`pricingTiers.${i}.currency`} value={tier.currency}
                                        onChange={(e) => updateTier(i, { currency: e.target.value })}
                                        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2.5 text-sm"
                                        aria-label="Currency"
                                    >
                                        {DEFAULT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Billing period" htmlFor={`tier-${i}-billingPeriod`}>
                                    <select id={`tier-${i}-billingPeriod`} name={`pricingTiers.${i}.billingPeriod`} value={tier.billingPeriod}
                                        onChange={(e) => updateTier(i, { billingPeriod: e.target.value })}
                                        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2.5 text-sm"
                                        aria-label="Billing period"
                                    >
                                        {BILLING_PERIODS.map((bp) => <option key={bp} value={bp}>{bp}</option>)}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="CTA label" htmlFor={`tier-${i}-ctaLabel`} error={errors[`tier.${i}.ctaLabel`]} hint="Button text, e.g. Get Started">
                                    <TextInput placeholder="e.g. Get Started" id={`tier-${i}-ctaLabel`} name={`pricingTiers.${i}.ctaLabel`} maxLength={60} value={tier.ctaLabel}
                                        onChange={(e) => updateTier(i, { ctaLabel: e.target.value })} />
                                </Field>
                                <Field label="CTA URL" htmlFor={`tier-${i}-ctaUrl`} error={errors[`tier.${i}.ctaUrl`]} hint="Link to pricing page or signup">
                                    <TextInput placeholder="https://..." id={`tier-${i}-ctaUrl`} name={`pricingTiers.${i}.ctaUrl`} type="url" inputMode="url" maxLength={2048} value={tier.ctaUrl}
                                        onChange={(e) => updateTier(i, { ctaUrl: e.target.value })} />
                                </Field>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Free trial" hint="e.g. 14-day, 100 credits">
                                    <TextInput placeholder="e.g. 14-day free trial" value={tier.freeTrial}
                                        onChange={(e) => updateTier(i, { freeTrial: e.target.value })} />
                                </Field>
                                <Field label="Money-back guarantee" hint="e.g. 30-day">
                                    <TextInput placeholder="e.g. 30-day" value={tier.moneyBackGuarantee}
                                        onChange={(e) => updateTier(i, { moneyBackGuarantee: e.target.value })} />
                                </Field>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/80 px-3.5 py-2.5 cursor-pointer w-full">
                                        <input type="checkbox" checked={tier.isPopular}
                                            onChange={(e) => updateTier(i, { isPopular: e.target.checked })}
                                            className="h-4 w-4 rounded border-foreground/30 accent-foreground" />
                                        <span className="text-sm text-foreground/80">Mark as popular</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Features" hint="Press Enter to add each feature.">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tier.features.map((f, fi) => (
                                            <span key={fi} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-foreground/70">
                                                {f}
                                                <button type="button" onClick={() => removeFeatureFromTier(i, fi)} aria-label={`Remove pricing plan ${i + 1} feature ${fi + 1}`} className="text-foreground/40 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input type="text"
                                        value={featureInputs[i] || ''}
                                        onChange={(e) => setFeatureInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addFeatureToTier(i, featureInputs[i] || '');
                                                setFeatureInputs((prev) => ({ ...prev, [i]: '' }));
                                            }
                                        }}
                                        placeholder={tier.features.length ? 'Add another feature…' : 'e.g. Unlimited projects'}
                                        className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                                </Field>
                                <Field label="Limitations" hint="Press Enter to add each limitation.">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tier.limitations.map((l, li) => (
                                            <span key={li} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600/80">
                                                {l}
                                                <button type="button" onClick={() => removeLimitationFromTier(i, li)} aria-label={`Remove pricing plan ${i + 1} limitation ${li + 1}`} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input type="text"
                                        value={limitInputs[i] || ''}
                                        onChange={(e) => setLimitInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLimitationToTier(i, limitInputs[i] || '');
                                                setLimitInputs((prev) => ({ ...prev, [i]: '' }));
                                            }
                                        }}
                                        placeholder={tier.limitations.length ? 'Add another limitation…' : 'e.g. 5 GB storage'}
                                        className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                                </Field>
                            </div>

                            <Field label="Notes" hint="Internal notes for the review team (not shown publicly).">
                                <TextArea rows={2} placeholder="e.g. Price increased from $19 in Jan 2026…"
                                    value={tier.notes} onChange={(e) => updateTier(i, { notes: e.target.value })} />
                            </Field>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
