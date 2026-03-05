'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SEOFields from '@/components/admin/SEOFields';
import SlugInput from '@/components/admin/SlugInput';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface ToolFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ToolForm({ initialData, isEditing }: ToolFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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

        try {
            const body = {
                name, slug, shortDescription, longDescription, websiteUrl,
                pricingType, status, logo, featured, primaryCategory, rating,
                features: features.filter(Boolean),
                pros: pros.filter(Boolean),
                cons: cons.filter(Boolean),
                seo: Object.keys(seo).length > 0 ? seo : undefined,
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

                    {/* SEO */}
                    <SEOFields seo={seo} onChange={setSeo} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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
                            <label className="block text-sm text-white/60 mb-1.5">Primary Category</label>
                            <input type="text" value={primaryCategory} onChange={(e) => setPrimaryCategory(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="ai-coding-tools" />
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
                </div>
            </div>
        </form>
    );
}
