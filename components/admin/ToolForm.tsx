'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SEOFields from '@/components/admin/SEOFields';
import SlugInput from '@/components/admin/SlugInput';
import MediaLibraryLink from '@/components/admin/MediaLibraryLink';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface ToolFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ToolForm({ initialData, isEditing }: ToolFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [metaError, setMetaError] = useState('');

    const [name, setName] = useState(initialData?.name || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
    const [longDescription, setLongDescription] = useState(initialData?.longDescription || '');
    const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || '');
    const [pricingType, setPricingType] = useState(initialData?.pricingType || 'freemium');
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [logo, setLogo] = useState(initialData?.logo || '');
    const [featured, setFeatured] = useState(initialData?.featured || false);
    const [primaryCategory, setPrimaryCategory] = useState(initialData?.primaryCategory || '');
    const [rating, setRating] = useState(initialData?.rating?.toString() || '');
    const [features, setFeatures] = useState<string[]>(initialData?.features || ['']);
    const [pros, setPros] = useState<string[]>(initialData?.pros || ['']);
    const [cons, setCons] = useState<string[]>(initialData?.cons || ['']);
    const [seo, setSeo] = useState(initialData?.seo || {});
    const [metaJson, setMetaJson] = useState(() =>
        initialData?.meta ? JSON.stringify(initialData.meta, null, 2) : ''
    );
    const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [personaPages, setPersonaPages] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [selectedPersonaPages, setSelectedPersonaPages] = useState<string[]>(initialData?.personaPageIds || []);
    const [pricingTiers, setPricingTiers] = useState<Array<{
        name: string; monthlyPrice: string; annualPrice: string; currency: string;
        billingPeriod: string; description: string; features: string[]; limitations: string[];
        isPopular: boolean; badge: string; ctaLabel: string; ctaUrl: string;
        freeTrial: string; moneyBackGuarantee: string; notes: string;
    }>>(() => {
        const meta = initialData?.meta;
        if (meta?.pricingTiers && Array.isArray(meta.pricingTiers)) {
            return meta.pricingTiers.map((t: any) => ({
                name: t.name || '',
                monthlyPrice: t.monthlyPrice?.toString() || '',
                annualPrice: t.annualPrice?.toString() || '',
                currency: t.currency || 'USD',
                billingPeriod: t.billingPeriod || 'monthly',
                description: t.description || '',
                features: Array.isArray(t.features) ? t.features : [],
                limitations: Array.isArray(t.limitations) ? t.limitations : [],
                isPopular: Boolean(t.isPopular),
                badge: t.badge || '',
                ctaLabel: t.ctaLabel || 'Get Started',
                ctaUrl: t.ctaUrl || '',
                freeTrial: t.freeTrial || '',
                moneyBackGuarantee: t.moneyBackGuarantee || '',
                notes: t.notes || '',
            }));
        }
        return [];
    });

    useEffect(() => {
        setMetaJson(initialData?.meta ? JSON.stringify(initialData.meta, null, 2) : '');
    }, [initialData?.meta]);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/categories').then((r) => (r.ok ? r.json() : [])),
            fetch('/api/admin/persona-pages').then((r) => (r.ok ? r.json() : [])),
        ])
            .then(([cats, pages]) => {
                setCategories(cats);
                setPersonaPages(pages);
            })
            .catch(() => {});
    }, []);

    const addItem = (list: string[], setter: (v: string[]) => void) => setter([...list, '']);
    const removeItem = (list: string[], setter: (v: string[]) => void, index: number) => setter(list.filter((_, i) => i !== index));
    const updateItem = (list: string[], setter: (v: string[]) => void, index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMetaError('');

        try {
            let parsedMeta: Record<string, unknown> | null = null;

            if (metaJson.trim()) {
                try {
                    parsedMeta = JSON.parse(metaJson);
                } catch {
                    setMetaError('Tool page JSON is not valid. Please fix the formatting before saving.');
                    setSaving(false);
                    return;
                }
            }

            // Merge pricing tiers into meta
            const validTiers = pricingTiers.filter((t) => t.name.trim());
            if (validTiers.length > 0 || parsedMeta?.pricingTiers) {
                if (!parsedMeta) parsedMeta = {};
                parsedMeta.pricingTiers = validTiers.map((t) => ({
                    name: t.name,
                    monthlyPrice: t.monthlyPrice ? Number(t.monthlyPrice) || null : null,
                    annualPrice: t.annualPrice ? Number(t.annualPrice) || null : null,
                    currency: t.currency,
                    billingPeriod: t.billingPeriod,
                    description: t.description,
                    features: t.features,
                    limitations: t.limitations,
                    isPopular: t.isPopular,
                    badge: t.badge,
                    ctaLabel: t.ctaLabel,
                    ctaUrl: t.ctaUrl,
                    annualNote: null,
                    freeTrial: t.freeTrial || null,
                    moneyBackGuarantee: t.moneyBackGuarantee || null,
                    notes: t.notes || null,
                }));
            }

            const body = {
                name, slug, shortDescription, longDescription, websiteUrl,
                pricingType, status, logo, featured, primaryCategory, rating,
                features: features.filter(Boolean),
                pros: pros.filter(Boolean),
                cons: cons.filter(Boolean),
                meta: parsedMeta || undefined,
                seo: Object.keys(seo).length > 0 ? seo : undefined,
                personaPageIds: selectedPersonaPages,
            };

            const url = isEditing ? `/api/tools/${initialData.id}` : '/api/tools';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save tool');
            }

            router.push('/admin/tools');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const ListEditor = ({ items, setItems, label, placeholder }: { items: string[], setItems: (v: string[]) => void, label: string, placeholder: string }) => (
        <div>
            <label className="block text-sm text-white/60 mb-2">{label}</label>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => updateItem(items, setItems, i, e.target.value)}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                            placeholder={placeholder}
                        />
                        {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(items, setItems, i)} className="p-2 text-red-400 hover:text-red-300">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addItem(items, setItems)} className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors">
                    <Plus className="w-4 h-4" /> Add {label.toLowerCase().replace('s', '')}
                </button>
            </div>
        </div>
    );

    const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];
    const BILLING_PERIODS = ['monthly', 'yearly', 'one-time', 'usage-based', 'custom'];

    function createEmptyTier() {
        return {
            name: '', monthlyPrice: '', annualPrice: '', currency: 'USD',
            billingPeriod: 'monthly', description: '', features: [] as string[],
            limitations: [] as string[], isPopular: false, badge: '',
            ctaLabel: 'Get Started', ctaUrl: '', freeTrial: '',
            moneyBackGuarantee: '', notes: '',
        };
    }

    function updateTier(i: number, patch: Partial<typeof pricingTiers[number]>) {
        setPricingTiers((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], ...patch };
            return next;
        });
    }

    function moveTier(from: number, to: number) {
        if (to < 0 || to >= pricingTiers.length) return;
        setPricingTiers((prev) => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    }

    const PricingTierEditor = () => (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-xl text-white">Pricing Plans</h2>
                    <p className="mt-1 text-sm text-white/50">Define pricing tiers for the comparison table.</p>
                </div>
                <button type="button" onClick={() => setPricingTiers((prev) => [...prev, createEmptyTier()])}
                    className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-sm text-accent hover:bg-accent/25 transition-colors">
                    <Plus className="w-4 h-4" /> Add plan
                </button>
            </div>

            {pricingTiers.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                    <p className="text-sm text-white/40">No pricing plans defined. Click &quot;Add plan&quot; to create one.</p>
                </div>
            )}

            <div className="space-y-4">
                {pricingTiers.map((tier, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => moveTier(i, i - 1)} disabled={i === 0}
                                    className="p-1 text-white/40 hover:text-white disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                                <button type="button" onClick={() => moveTier(i, i + 1)} disabled={i === pricingTiers.length - 1}
                                    className="p-1 text-white/40 hover:text-white disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                                <span className="text-xs font-semibold text-white/50">#{i + 1}</span>
                            </div>
                            <button type="button" onClick={() => setPricingTiers((prev) => prev.filter((_, idx) => idx !== i))}
                                className="p-1 text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Plan name</label>
                                <input type="text" value={tier.name} onChange={(e) => updateTier(i, { name: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. Pro" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Badge</label>
                                <input type="text" value={tier.badge} onChange={(e) => updateTier(i, { badge: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. Most Popular" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 mb-1">Description</label>
                            <input type="text" value={tier.description} onChange={(e) => updateTier(i, { description: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="One-liner for this tier" />
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Monthly $</label>
                                <input type="text" value={tier.monthlyPrice} onChange={(e) => updateTier(i, { monthlyPrice: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="29" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Annual $</label>
                                <input type="text" value={tier.annualPrice} onChange={(e) => updateTier(i, { annualPrice: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="290" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Currency</label>
                                <select value={tier.currency} onChange={(e) => updateTier(i, { currency: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Billing</label>
                                <select value={tier.billingPeriod} onChange={(e) => updateTier(i, { billingPeriod: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                                    {BILLING_PERIODS.map((bp) => <option key={bp} value={bp}>{bp}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1">CTA label</label>
                                <input type="text" value={tier.ctaLabel} onChange={(e) => updateTier(i, { ctaLabel: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="Get Started" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">CTA URL</label>
                                <input type="text" value={tier.ctaUrl} onChange={(e) => updateTier(i, { ctaUrl: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Free trial</label>
                                <input type="text" value={tier.freeTrial} onChange={(e) => updateTier(i, { freeTrial: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. 14-day" />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1">Money-back</label>
                                <input type="text" value={tier.moneyBackGuarantee} onChange={(e) => updateTier(i, { moneyBackGuarantee: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. 30-day" />
                            </div>
                            <label className="flex items-end gap-2 cursor-pointer pb-2">
                                <input type="checkbox" checked={tier.isPopular} onChange={(e) => updateTier(i, { isPopular: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50" />
                                <span className="text-sm text-white/60">Popular</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 mb-1">Features (comma-separated)</label>
                            <input type="text" value={tier.features.join(', ')}
                                onChange={(e) => updateTier(i, { features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                                placeholder="Unlimited projects, Priority support, API access" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/40 mb-1">Limitations (comma-separated)</label>
                            <input type="text" value={tier.limitations.join(', ')}
                                onChange={(e) => updateTier(i, { limitations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none"
                                placeholder="5 GB storage, 100 API calls/day" />
                        </div>
                        <div>
                            <label className="block text-xs text-white/40 mb-1">Internal notes</label>
                            <textarea value={tier.notes} onChange={(e) => updateTier(i, { notes: e.target.value })} rows={2}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none resize-none"
                                placeholder="Internal notes for the review team" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tools" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-heading text-3xl text-white">{isEditing ? 'Edit Tool' : 'Add New Tool'}</h1>
                </div>
                <div className="flex gap-3">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Tool'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Tool Name *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. ChatGPT" />
                        </div>
                        <SlugInput value={slug} onChange={setSlug} sourceValue={name} prefix="/ai-tools-directory/" />
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Short Description *</label>
                            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required rows={3}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none resize-none" placeholder="Brief description for cards and listings" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Long Description</label>
                            <RichTextEditor value={longDescription} onChange={setLongDescription} placeholder="Detailed description of the AI tool..." />
                        </div>
                    </div>

                    {/* Features, Pros & Cons */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
                        <ListEditor items={features} setItems={setFeatures} label="Features" placeholder="Key feature of the tool" />
                        <ListEditor items={pros} setItems={setPros} label="Pros" placeholder="Advantage of this tool" />
                        <ListEditor items={cons} setItems={setCons} label="Cons" placeholder="Limitation or drawback" />
                    </div>

                    {/* Pricing Tiers */}
                    <PricingTierEditor />

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <h2 className="font-heading text-xl text-white">Single Tool Page Data</h2>
                            <p className="mt-2 text-sm leading-6 text-white/60">
                                Paste structured JSON here to control the richer review layout for this tool page:
                                pricing tiers, rating breakdown, gallery, videos, personas, FAQ, verdict, alternatives, and social links.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Tool Page JSON</label>
                            <textarea
                                value={metaJson}
                                onChange={(e) => setMetaJson(e.target.value)}
                                rows={24}
                                spellCheck={false}
                                className="w-full rounded-lg border border-white/10 bg-[#05070B] px-4 py-3 font-mono text-[13px] leading-6 text-white focus:border-accent/50 focus:outline-none"
                                placeholder={`{\n  "tagline": "Editorial hero tagline",\n  "currentDeal": {\n    "badge": "Current offer",\n    "headline": "Free tier is worth testing first",\n    "detail": "Add deal notes, coupon info, or trial context here",\n    "ctaLabel": "See pricing",\n    "ctaUrl": "https://example.com/pricing"\n  },\n  "bestValueNote": "Why a specific tier or plan is the best value.",\n  "pricingTiers": [],\n  "ratingBreakdown": [],\n  "faq": []\n}`}
                            />
                            <p className="mt-2 text-xs leading-5 text-white/40">
                                This saves directly into the tool&apos;s <code className="font-mono text-white/60">meta</code> field and overrides the default template content when present.
                            </p>
                            {metaError && (
                                <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                    {metaError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO */}
                    <SEOFields seo={seo} onChange={setSeo} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Submission Info card — visible for public submissions */}
                    {initialData?.meta?.submittedVia === 'public-submit-ai-tool-page' && (
                        <div className="bg-white/[0.03] border border-accent/20 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                                    Public submission
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                {initialData.meta.submitterName && (
                                    <div>
                                        <span className="text-white/40">Submitted by</span>
                                        <p className="text-white/85">{initialData.meta.submitterName}</p>
                                    </div>
                                )}
                                {initialData.meta.submitterEmail && (
                                    <div>
                                        <span className="text-white/40">Email</span>
                                        <p className="text-white/85">
                                            <a href={`mailto:${initialData.meta.submitterEmail}`} className="hover:underline">
                                                {initialData.meta.submitterEmail}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {initialData.meta.submitterRole && (
                                    <div>
                                        <span className="text-white/40">Role</span>
                                        <p className="text-white/85">{initialData.meta.submitterRole}</p>
                                    </div>
                                )}
                                {initialData.meta.submittedAt && (
                                    <div>
                                        <span className="text-white/40">Submitted</span>
                                        <p className="text-white/85">
                                            {new Date(initialData.meta.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {initialData.meta.audiences && initialData.meta.audiences.length > 0 && (
                                <div>
                                    <span className="text-[11px] text-white/40">Target audiences</span>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {initialData.meta.audiences.map((a: string) => (
                                            <span key={a} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {initialData.meta.socials && Object.values(initialData.meta.socials).some(Boolean) && (
                                <div>
                                    <span className="text-[11px] text-white/40">Socials</span>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                        {Object.entries(initialData.meta.socials).map(([platform, url]) =>
                                            url ? (
                                                <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70 hover:bg-white/10 transition-colors">
                                                    {platform}
                                                </a>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            )}

                            {initialData.meta.reviewNotes && (
                                <div>
                                    <span className="text-[11px] text-white/40">Review notes</span>
                                    <p className="mt-1 text-sm leading-6 text-white/75 bg-white/[0.03] rounded-lg p-3 whitespace-pre-wrap">
                                        {initialData.meta.reviewNotes}
                                    </p>
                                </div>
                            )}

                            {initialData.meta.screenshots && initialData.meta.screenshots.length > 0 && (
                                <div>
                                    <span className="text-[11px] text-white/40">Screenshots ({initialData.meta.screenshots.length})</span>
                                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                                        {initialData.meta.screenshots.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="block overflow-hidden rounded-lg border border-white/10 hover:border-white/25 transition-colors">
                                                <img src={url} alt="" loading="lazy" className="h-20 w-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {initialData.meta.demoVideo && (
                                <div>
                                    <span className="text-[11px] text-white/40">Demo video</span>
                                    <p className="mt-1">
                                        <a href={initialData.meta.demoVideo} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-accent hover:underline break-all">
                                            {initialData.meta.demoVideo}
                                        </a>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Website URL *</label>
                            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="https://example.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Logo URL</label>
                            <input type="url" value={logo} onChange={(e) => setLogo(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="https://..." />
                            <MediaLibraryLink helperText="Use the Media Library for tool logos and paste the generated image URL here." />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Pricing Type</label>
                            <select value={pricingType} onChange={(e) => setPricingType(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                <option value="free">Free</option>
                                <option value="freemium">Freemium</option>
                                <option value="paid">Paid</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Primary Category *</label>
                            <select
                                value={primaryCategory}
                                onChange={(e) => setPrimaryCategory(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-white/40">Required for live URL: /ai-tools-directory/[category]/[slug]/</p>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Rating (0-5)</label>
                            <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="4.5" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50" />
                            <span className="text-sm text-white/60">Featured Tool</span>
                        </label>
                    </div>

                    {/* Persona Pages Assignment */}
                    {personaPages.length > 0 && (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-3">
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Persona Pages</label>
                                <p className="text-xs text-white/40 mb-3">Assign this tool to persona directory pages.</p>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {personaPages.map((page) => (
                                    <label key={page.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedPersonaPages.includes(page.id)}
                                            onChange={(e) => {
                                                setSelectedPersonaPages(prev =>
                                                    e.target.checked
                                                        ? [...prev, page.id]
                                                        : prev.filter(id => id !== page.id)
                                                );
                                            }}
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
                                        />
                                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{page.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
