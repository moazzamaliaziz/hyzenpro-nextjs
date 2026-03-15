'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, ExternalLink, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import SlugInput from '@/components/admin/SlugInput';

interface CTA {
    id: string;
    name: string;
    slug: string;
    headline?: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    style: string;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
}

export default function AdminCTAsPage() {
    const [ctas, setCtas] = useState<CTA[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCta, setEditingCta] = useState<CTA | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');
    const [style, setStyle] = useState('default');

    useEffect(() => {
        fetchCtas();
    }, []);

    const fetchCtas = async () => {
        try {
            const res = await fetch('/api/admin/ctas');
            const data = await res.json();
            setCtas(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingCta(null);
        setName('');
        setSlug('');
        setHeadline('');
        setDescription('');
        setButtonText('');
        setButtonUrl('');
        setStyle('default');
        setError('');
        setShowModal(true);
    };

    const openEdit = (cta: CTA) => {
        setEditingCta(cta);
        setName(cta.name);
        setSlug(cta.slug);
        setHeadline(cta.headline || '');
        setDescription(cta.description || '');
        setButtonText(cta.buttonText);
        setButtonUrl(cta.buttonUrl);
        setStyle(cta.style);
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const body = { name, slug, headline, description, buttonText, buttonUrl, style };
            const url = editingCta ? `/api/admin/ctas/${editingCta.id}` : '/api/admin/ctas';
            const method = editingCta ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save CTA');
            }

            setShowModal(false);
            fetchCtas();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this CTA permanently?')) return;
        try {
            await fetch(`/api/admin/ctas/${id}`, { method: 'DELETE' });
            fetchCtas();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleActive = async (cta: CTA) => {
        try {
            await fetch(`/api/admin/ctas/${cta.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...cta, isActive: !cta.isActive }),
            });
            fetchCtas();
        } catch (err) {
            console.error(err);
        }
    };

    const stylePreview: Record<string, string> = {
        default: 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20',
        highlight: 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20',
        banner: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-blue-500/20',
        minimal: 'bg-white/[0.02] border-white/10',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">CTA Manager</h1>
                    <p className="text-white/40">Create and manage reusable Call-to-Action blocks for blog posts ({ctas.length} total)</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all">
                    <Plus className="w-4 h-4" /> New CTA
                </button>
            </div>

            {/* CTA Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                </div>
            ) : ctas.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                    <p className="text-lg mb-2">No CTAs created yet</p>
                    <p className="text-sm">Create your first Call-to-Action to use in blog posts</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {ctas.map((cta) => (
                        <div key={cta.id} className={`border rounded-2xl p-6 transition-all ${stylePreview[cta.style] || stylePreview.default} ${!cta.isActive ? 'opacity-50' : ''}`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{cta.name}</h3>
                                    <p className="text-xs text-white/30 mt-0.5">Shortcode: <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent">{cta.slug}</code></p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleActive(cta)} title={cta.isActive ? 'Deactivate' : 'Activate'}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                        {cta.isActive ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-white/30" />}
                                    </button>
                                    <button onClick={() => openEdit(cta)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-accent transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(cta.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-white/[0.03] rounded-xl p-4 mb-3">
                                {cta.headline && <p className="font-semibold text-white mb-1">{cta.headline}</p>}
                                {cta.description && <p className="text-sm text-white/60 mb-3">{cta.description}</p>}
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-2 bg-accent text-black font-bold text-sm rounded-lg">
                                        {cta.buttonText}
                                    </span>
                                    <span className="text-xs text-white/30 truncate">{cta.buttonUrl}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-white/30">
                                <span className="px-2 py-0.5 bg-white/5 rounded">{cta.style}</span>
                                {!cta.isActive && <span className="text-red-400">Inactive</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="font-heading text-xl text-white">{editingCta ? 'Edit CTA' : 'Create CTA'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
                            )}

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Name *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                                    placeholder="e.g. Midjourney CTA" />
                            </div>

                            <SlugInput value={slug} onChange={setSlug} sourceValue={name} prefix="cta-" />

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Headline</label>
                                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                                    placeholder="e.g. Try Midjourney Free for 25 Images" />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none resize-none"
                                    placeholder="Brief description to appear above the button" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1.5">Button Text *</label>
                                    <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                                        placeholder="Try Free" />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1.5">Style</label>
                                    <select value={style} onChange={(e) => setStyle(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                        <option value="default">Default</option>
                                        <option value="highlight">Highlight</option>
                                        <option value="banner">Banner</option>
                                        <option value="minimal">Minimal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">Button URL *</label>
                                <input type="url" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                                    placeholder="https://..." />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-white/60 hover:text-white transition-colors text-sm">Cancel</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 text-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save CTA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
