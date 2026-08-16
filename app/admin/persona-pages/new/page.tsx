'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Search, Save, X, ArrowLeft } from 'lucide-react';

const ICONS = ['AlertTriangle', 'Zap', 'DollarSign', 'Workflow', 'Search', 'Shield', 'BookOpen', 'Presentation', 'Layers', 'Lock', 'Users', 'FileText', 'BarChart3', 'Scissors', 'Image', 'Repeat', 'AlertTriangle', 'DollarSign', 'Zap', 'Shield'];

export default function PersonaPageCreateForm() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'draft',
        sortOrder: 0,
        heroTitle: '',
        heroSubtitle: '',
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        focusKeyword: '',
        painPoints: [{ title: '', description: '', icon: 'AlertTriangle' }],
        workflowSteps: [{ step: '01', title: '', description: '' }],
        starterKit: [{ toolId: '', note: '' }],
        faq: [{ question: '', answer: '' }],
        internalLinks: [{ label: '', href: '' }],
        crossLinks: [{ label: '', href: '', description: '' }],
        ctaText: '',
        ctaUrl: '',
        toolSlugs: [] as string[],
    });

    const [allTools, setAllTools] = useState<Array<{id: string; name: string; slug: string; category: string; rating?: number | null; pricingType: string}>>([]);
    const [toolSearch, setToolSearch] = useState('');
    const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);

    // Generate slug from name
    useEffect(() => {
        if (formData.name && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, ''),
            }));
        }
    }, [formData.name]);

    // Fetch all tools
    useEffect(() => {
        fetch('/api/admin/tools')
            .then(r => r.json())
            .then(data => setAllTools(data.filter((t: any) => t.status === 'published')));
    }, []);

    const filteredTools = allTools.filter(t =>
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.slug.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(toolSearch.toLowerCase())
    );

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value } as typeof prev));
    };

    const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: (prev[arrayName as keyof typeof prev] as any[]).map((item: any, i: number) =>
                i === index ? { ...item, [field]: value } : item
            ),
        } as typeof prev));
    };

    const addArrayItem = (arrayName: string, newItem: any) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...(prev[arrayName as keyof typeof prev] as any[]), newItem],
        } as typeof prev));
    };

    const removeArrayItem = (arrayName: string, index: number) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: (prev[arrayName as keyof typeof prev] as any[]).filter((_: any, i: number) => i !== index),
        } as typeof prev));
    };

    const toggleTool = (toolId: string) => {
        setSelectedToolIds(prev =>
            prev.includes(toolId)
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/admin/persona-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    toolSlugs: formData.toolSlugs,
                }),
            });

            if (!res.ok) throw new Error('Failed to create page');

            router.push('/admin/persona-pages');
            router.refresh();
        } catch (error) {
            alert('Error: ' + error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href="/admin/persona-pages" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </Link>
                <h1 className="text-3xl font-serif font-bold">Create Persona Page</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section: Basic Info */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => updateField('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => updateField('slug', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => updateField('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-black"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Hero */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hero Title (H1)</label>
                            <input
                                type="text"
                                value={formData.heroTitle}
                                onChange={e => updateField('heroTitle', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hero Subtitle (Body Content)</label>
                            <textarea
                                value={formData.heroSubtitle}
                                onChange={e => updateField('heroSubtitle', e.target.value)}
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black font-mono text-sm"
                                placeholder="~400 words. Markdown supported."
                            />
                        </div>
                    </div>
                </section>

                {/* Section: SEO */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">SEO Metadata</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Title (≤60 chars) <span className="text-gray-400">{formData.metaTitle.length}/60</span></label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={e => updateField('metaTitle', e.target.value)}
                                maxLength={60}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Meta Description (≤155 chars) <span className="text-gray-400">{formData.metaDescription.length}/155</span></label>
                            <input
                                type="text"
                                value={formData.metaDescription}
                                onChange={e => updateField('metaDescription', e.target.value)}
                                maxLength={155}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Canonical URL</label>
                            <input
                                type="text"
                                value={formData.canonicalUrl}
                                onChange={e => updateField('canonicalUrl', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">OG Image URL</label>
                            <input
                                type="text"
                                value={formData.ogImage}
                                onChange={e => updateField('ogImage', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">OG Title</label>
                            <input
                                type="text"
                                value={formData.ogTitle}
                                onChange={e => updateField('ogTitle', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">OG Description</label>
                            <textarea
                                value={formData.ogDescription}
                                onChange={e => updateField('ogDescription', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Focus Keyword</label>
                            <input
                                type="text"
                                value={formData.focusKeyword}
                                onChange={e => updateField('focusKeyword', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Pain Points */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Pain Points</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('painPoints', { title: '', description: '', icon: 'AlertTriangle' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Pain Point
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.painPoints.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-1">Icon</label>
                                    <select
                                        value={item.icon}
                                        onChange={e => updateArrayItem('painPoints', i, 'icon', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                                    >
                                        {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateArrayItem('painPoints', i, 'title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={item.description}
                                        onChange={e => updateArrayItem('painPoints', i, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('painPoints', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Workflow Steps */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Workflow Steps</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('workflowSteps', { step: String(formData.workflowSteps.length + 1).padStart(2, '0'), title: '', description: '' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Step
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.workflowSteps.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="w-20">
                                    <label className="block text-sm font-medium mb-1">Step</label>
                                    <input
                                        type="text"
                                        value={item.step}
                                        onChange={e => updateArrayItem('workflowSteps', i, 'step', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateArrayItem('workflowSteps', i, 'title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={item.description}
                                        onChange={e => updateArrayItem('workflowSteps', i, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('workflowSteps', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Starter Kit */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Starter Kit (Top 3 Tools)</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('starterKit', { toolId: '', note: '' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Tool
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.starterKit.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Tool (select by slug)</label>
                                    <select
                                        value={item.toolId}
                                        onChange={e => updateArrayItem('starterKit', i, 'toolId', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                                    >
                                        <option value="">Select tool...</option>
                                        {allTools.map(t => (
                                            <option key={t.id} value={t.slug}>
                                                {t.name} ({t.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Note</label>
                                    <textarea
                                        value={item.note}
                                        onChange={e => updateArrayItem('starterKit', i, 'note', e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        placeholder="Why this tool is in the starter kit..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('starterKit', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: FAQ */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">FAQ</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('faq', { question: '', answer: '' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Q&A
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.faq.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Question</label>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={e => updateArrayItem('faq', i, 'question', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Answer</label>
                                    <textarea
                                        value={item.answer}
                                        onChange={e => updateArrayItem('faq', i, 'answer', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('faq', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Internal Links */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Internal Links</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('internalLinks', { label: '', href: '' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Link
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.internalLinks.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={e => updateArrayItem('internalLinks', i, 'label', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Href</label>
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={e => updateArrayItem('internalLinks', i, 'href', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('internalLinks', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: Cross Links */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Cross Links (Other Persona Pages)</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem('crossLinks', { label: '', href: '', description: '' })}
                            className="text-sm text-black hover:underline"
                        >
                            + Add Link
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.crossLinks.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={e => updateArrayItem('crossLinks', i, 'label', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Href</label>
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={e => updateArrayItem('crossLinks', i, 'href', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={e => updateArrayItem('crossLinks', i, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('crossLinks', i)}
                                    className="mt-8 text-red-500 hover:text-red-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section: CTA */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">CTA</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">CTA Text</label>
                            <input
                                type="text"
                                value={formData.ctaText}
                                onChange={e => updateField('ctaText', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">CTA URL</label>
                            <input
                                type="text"
                                value={formData.ctaUrl}
                                onChange={e => updateField('ctaUrl', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </section>

                {/* Section: Tool Assignment */}
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Tool Assignment</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Search & Select Tools</label>
                        <input
                            type="text"
                            value={toolSearch}
                            onChange={e => setToolSearch(e.target.value)}
                            placeholder="Search tools by name, slug, or category..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                        {filteredTools.map(tool => (
                            <label key={tool.id} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${selectedToolIds.includes(tool.id) ? 'bg-black text-white border-black' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedToolIds.includes(tool.id)}
                                    onChange={() => toggleTool(tool.id)}
                                    className="w-4 h-4 accent-black"
                                />
                                <div>
                                    <div className="font-medium">{tool.name}</div>
                                    <div className="text-xs text-gray-500">{tool.category} • {tool.pricingType} • ★{tool.rating?.toFixed(1) || '—'}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-500">
                            {selectedToolIds.length} tools selected
                        </span>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Create Page'}
                    </button>
                    <Link
                        href="/admin/persona-pages"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}