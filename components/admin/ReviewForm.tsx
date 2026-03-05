'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X, Star } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SEOFields from '@/components/admin/SEOFields';
import SlugInput from '@/components/admin/SlugInput';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface ReviewFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ReviewForm({ initialData, isEditing }: ReviewFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [toolSlug, setToolSlug] = useState(initialData?.toolSlug || '');
    const [toolName, setToolName] = useState(initialData?.toolName || '');
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [rating, setRating] = useState(initialData?.rating?.toString() || '4.0');
    const [pros, setPros] = useState<string[]>(initialData?.pros || ['']);
    const [cons, setCons] = useState<string[]>(initialData?.cons || ['']);
    const [verdict, setVerdict] = useState(initialData?.verdict || '');
    const [status, setStatus] = useState(initialData?.status || 'draft');
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
                toolSlug, toolName, title, slug, content, rating,
                pros: pros.filter(Boolean),
                cons: cons.filter(Boolean),
                verdict, status,
                author: 'HyzenPro Team',
                seo: Object.keys(seo).length > 0 ? seo : undefined,
            };

            const url = isEditing ? `/api/reviews/${initialData.id}` : '/api/reviews';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save review');
            }

            router.push('/admin/reviews');
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
                        <input type="text" value={item} onChange={(e) => updateItem(items, setItems, i, e.target.value)}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder={placeholder} />
                        {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(items, setItems, i)} className="p-2 text-red-400 hover:text-red-300">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={() => addItem(items, setItems)} className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors">
                    <Plus className="w-4 h-4" /> Add item
                </button>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/reviews" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-heading text-3xl text-white">{isEditing ? 'Edit Review' : 'Write Review'}</h1>
                </div>
                <div className="flex gap-3">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Review'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Tool Name *</label>
                                <input type="text" value={toolName} onChange={(e) => setToolName(e.target.value)} required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. ChatGPT" />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Tool Slug *</label>
                                <input type="text" value={toolSlug} onChange={(e) => setToolSlug(e.target.value)} required
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="e.g. chatgpt" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Review Title *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-lg focus:border-accent/50 focus:outline-none" placeholder="e.g. ChatGPT Review 2025: Is It Still the Best?" />
                        </div>
                        <SlugInput value={slug} onChange={setSlug} sourceValue={title} prefix="/review/" />
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <label className="block text-sm text-white/60 mb-3">Review Content</label>
                        <RichTextEditor value={content} onChange={setContent} placeholder="Write your in-depth review..." />
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
                        <ListEditor items={pros} setItems={setPros} label="Pros" placeholder="What's great about this tool" />
                        <ListEditor items={cons} setItems={setCons} label="Cons" placeholder="Where it falls short" />
                    </div>

                    <SEOFields seo={seo} onChange={setSeo} />
                </div>

                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-2">Rating</label>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setRating(star.toString())}
                                            className={`transition-colors ${parseFloat(rating) >= star ? 'text-yellow-400' : 'text-white/20'}`}>
                                            <Star className="w-6 h-6 fill-current" />
                                        </button>
                                    ))}
                                </div>
                                <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)}
                                    className="w-16 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Verdict</label>
                            <textarea value={verdict} onChange={(e) => setVerdict(e.target.value)} rows={4}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none resize-none" placeholder="Final verdict summary..." />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
