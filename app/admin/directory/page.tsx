'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SectionData {
    sectionId: string;
    title: string;
    subtitle: string;
    content: any;
    enabled: boolean;
}

export default function AdminDirectoryHomePage() {
    const [sections, setSections] = useState<SectionData[]>([
        { 
            sectionId: 'directory-cta', 
            title: 'Looking for a Specific AI Tool?', 
            subtitle: 'Use our advanced comparison engine to evaluate features, pricing, and authentic user reviews side-by-side.', 
            content: { buttonText: 'Go to Compare Engine', buttonUrl: '/compare' }, 
            enabled: true 
        },
        { 
            sectionId: 'directory-seo', 
            title: '', 
            subtitle: '', 
            content: { 
                html: `
<h2 id="ultimate-guide-ai-tools">Your Ultimate Guide to the Best AI Tools in 2026</h2>
<p>
    Welcome to the <strong>HyzenPro AI Tools Directory</strong>, the internet's most comprehensive and constantly updated database for discovering the best artificial intelligence software. Whether you are a solo entrepreneur automating your workflows, a marketer generating high-converting copy, or an enterprise team scaling operations, choosing the right AI application is critical for staying competitive.
</p>
<p>
    The artificial intelligence landscape is evolving at a breakneck pace. From highly specialized natural language processors to generative image platforms and autonomous AI agents, keeping track of the latest innovations is nearly impossible without a centralized, curated index. Our directory solves this by providing verified reviews, detailed feature breakdowns, and real-time popularity metrics.
</p>

<h3 id="how-to-choose-ai">How to Choose the Right AI Software for Your Specific Needs</h3>
<p>
    With thousands of platforms claiming to revolutionize your productivity, selecting the right one requires careful evaluation. When browsing our AI software directory, we recommend applying three core criteria:
</p>
<ul>
    <li><strong>Primary Use Case:</strong> Ensure the tool is purpose-built for your exact problem. A generalized LLM might write decent code, but a dedicated AI coding assistant will offer native IDE integrations.</li>
    <li><strong>Data Privacy & Enterprise Security:</strong> If you are processing sensitive customer data, prioritize tools that offer SOC-2 compliance and zero-data-retention policies.</li>
    <li><strong>Integration Capabilities:</strong> Look for solutions that seamlessly connect with your existing tech stack—such as Slack, Zapier, Salesforce, or your custom CRM via REST APIs.</li>
</ul>

<h3 id="understanding-ai-pricing">Understanding AI Pricing Models (Free vs Freemium vs Paid)</h3>
<ul>
    <li><strong>Free AI Tools:</strong> Ideal for beginners or casual users. These offer full access to foundational models but may restrict output length or generation speed.</li>
    <li><strong>Freemium & Credit-Based:</strong> The most common SaaS model. You receive a monthly allowance of "credits" or "tokens." Generative tasks explicitly consume these credits.</li>
    <li><strong>Paid & Enterprise Tiers:</strong> Designed for power users and businesses. These subscriptions unlock priority access to frontier models, dedicated API endpoints, and robust multi-seat team management.</li>
</ul>
` 
            }, 
            enabled: true 
        },
    ]);
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/directory')
            .then(res => res.json())
            .then((data: SectionData[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setSections(prev => prev.map(defaultSec => {
                        const dbSec = data.find((d: any) => d.sectionId === defaultSec.sectionId);
                        return dbSec ? { ...defaultSec, ...dbSec } : defaultSec;
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateSection = (sectionId: string, field: string, value: any) => {
        setSections(prev => prev.map(s => s.sectionId === sectionId ? { ...s, [field]: value } : s));
    };

    const saveSection = async (section: SectionData) => {
        setSaving(section.sectionId);
        try {
            await fetch('/api/admin/directory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
        } catch (e) {
            console.error('Save failed:', e);
        }
        setSaving(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Directory Page Editor</h1>
                <p className="text-gray-500">Edit the CTA section and the bottom SEO content block of the AI Tools Directory. Changes are saved instantly to the database and affect the live layout.</p>
            </div>

            {/* CTA Section Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative">
                    <h2 className="text-xl font-bold text-gray-900">🎯 Call to Action (CTA) Block</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={sections.find(s => s.sectionId === 'directory-cta')?.enabled || false}
                                onChange={(e) => updateSection('directory-cta', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Section</span>
                        </label>
                        <button
                            onClick={() => saveSection(sections.find(s => s.sectionId === 'directory-cta')!)}
                            disabled={saving === 'directory-cta'}
                            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {saving === 'directory-cta' ? 'Saving...' : 'Save CTA'}
                        </button>
                    </div>
                </div>
                <div className="space-y-4 relative">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                        <input
                            type="text"
                            value={sections.find(s => s.sectionId === 'directory-cta')?.title || ''}
                            onChange={(e) => updateSection('directory-cta', 'title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                            placeholder="Looking for a Specific AI Tool?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Description</label>
                        <textarea
                            rows={2}
                            value={sections.find(s => s.sectionId === 'directory-cta')?.subtitle || ''}
                            onChange={(e) => updateSection('directory-cta', 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'directory-cta')?.content?.buttonText || ''}
                                onChange={(e) => updateSection('directory-cta', 'content', { ...sections.find(s => s.sectionId === 'directory-cta')?.content, buttonText: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button URL</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'directory-cta')?.content?.buttonUrl || ''}
                                onChange={(e) => updateSection('directory-cta', 'content', { ...sections.find(s => s.sectionId === 'directory-cta')?.content, buttonUrl: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors font-mono text-xs"
                                placeholder="/compare"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Section Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">📝 Bottom SEO Text Block</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={sections.find(s => s.sectionId === 'directory-seo')?.enabled || false}
                                onChange={(e) => updateSection('directory-seo', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Section</span>
                        </label>
                        <button
                            onClick={() => saveSection(sections.find(s => s.sectionId === 'directory-seo')!)}
                            disabled={saving === 'directory-seo'}
                            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {saving === 'directory-seo' ? 'Saving...' : 'Save SEO Block'}
                        </button>
                    </div>
                </div>
                <div>
                    <div className="mb-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
                        <strong>Developer Note:</strong> This field accepts raw HTML. Use standard tags like <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, and <code>&lt;ul&gt;</code> to formulate search engine semantic hierarchies.
                    </div>
                    <textarea
                        rows={16}
                        value={sections.find(s => s.sectionId === 'directory-seo')?.content?.html || ''}
                        onChange={(e) => updateSection('directory-seo', 'content', { ...sections.find(s => s.sectionId === 'directory-seo')?.content, html: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors font-mono leading-relaxed"
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>
    );
}
