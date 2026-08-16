'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';

interface Tweet {
    tweetId?: string;
    embedHtml?: string;
    sourceInput?: string;
    tweetUrl?: string;
    name?: string;
    handle?: string;
    text?: string;
    date?: string;
}

interface SectionData {
    sectionId: string;
    title: string;
    subtitle: string;
    content: any;
    enabled: boolean;
}

export default function AdminHomepagePage() {
    const [sections, setSections] = useState<SectionData[]>([
        { sectionId: 'hero', title: 'Simplifying AI for Everyone', subtitle: 'Browse, compare, and choose the best AI tools with expert reviews, real comparisons, and practical guides — built for creators, marketers, and teams.', content: {}, enabled: true },
        { sectionId: 'about', title: 'About HyzenPro', subtitle: 'Your Trusted AI Resource', content: { p1: 'HyzenPro is an AI tools directory and review platform built to make smart choices easier. We research, test, and explain AI software using real use cases, not marketing hype. Each AI tool we review has a dedicated page with clear features, pricing insights, pros, cons, and practical guidance for real users.', p2: 'Alongside tool pages, HyzenPro publishes in-depth blogs and comparison articles covering AI video editors, caption generators, content tools, and emerging AI SaaS platforms. Everything is written for creators, founders, and marketers who want reliable information, clear answers, and AI recommendations without wasting time or money.' }, enabled: true },
        { sectionId: 'social-proof', title: 'Trusted by the Community', subtitle: 'Real feedback from creators, developers, and marketers.', content: { tweets: [] }, enabled: true },
        { sectionId: 'cta', title: 'Build with the Best.', subtitle: 'Are you building the next generation of AI tools? Index your platform on HyzenPro to reach creators, marketers, and research-driven buyers.', content: {}, enabled: true },
        { sectionId: 'directory-cta', title: 'Looking for a Specific AI Tool?', subtitle: 'Use our advanced comparison engine to evaluate features, pricing, and authentic user reviews side-by-side.', content: { buttonText: 'Go to Compare Engine', buttonUrl: '/compare' }, enabled: true },
        { sectionId: 'directory-seo', title: '', subtitle: '', content: { html: '' }, enabled: true },
    ]);
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/homepage')
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
            const response = await fetch('/api/admin/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
            if (response.ok) {
                const updated = await response.json();
                setSections(prev => prev.map(s => (s.sectionId === updated.sectionId ? { ...s, ...updated } : s)));
            } else {
                const error = await response.json().catch(() => null);
                console.error('Save failed:', error);
            }
        } catch (e) {
            console.error('Save failed:', e);
        }
        setSaving(null);
    };

    const getTweets = (): Tweet[] => {
        const social = sections.find(s => s.sectionId === 'social-proof');
        return social?.content?.tweets || [];
    };

    const addTweet = () => {
        const tweets = [...getTweets()];
        tweets.push({ sourceInput: '' });
        updateSection('social-proof', 'content', { tweets });
    };

    const updateTweet = (index: number, field: string, value: any) => {
        const tweets = [...getTweets()];
        tweets[index] = { ...tweets[index], [field]: value };
        updateSection('social-proof', 'content', { tweets });
    };

    const removeTweet = (index: number) => {
        const tweets = getTweets().filter((_, i) => i !== index);
        updateSection('social-proof', 'content', { tweets });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Content Editor</h1>
                <p className="text-gray-500">Edit Homepage sections + AI Tools Directory content. Changes are saved per-section.</p>
            </div>

            {/* Hero Section Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">🏠 Hero Section</h2>
                    <button
                        onClick={() => saveSection(sections.find(s => s.sectionId === 'hero')!)}
                        disabled={saving === 'hero'}
                        className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> {saving === 'hero' ? 'Saving...' : 'Save Hero'}
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={sections.find(s => s.sectionId === 'hero')?.title || ''}
                            onChange={(e) => updateSection('hero', 'title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                        <textarea
                            rows={3}
                            value={sections.find(s => s.sectionId === 'hero')?.subtitle || ''}
                            onChange={(e) => updateSection('hero', 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* About Section Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">📖 About Section</h2>
                    <button
                        onClick={() => saveSection(sections.find(s => s.sectionId === 'about')!)}
                        disabled={saving === 'about'}
                        className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> {saving === 'about' ? 'Saving...' : 'Save About'}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'about')?.title || ''}
                                onChange={(e) => updateSection('about', 'title', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Badge</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'about')?.subtitle || ''}
                                onChange={(e) => updateSection('about', 'subtitle', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 1</label>
                        <textarea
                            rows={4}
                            value={sections.find(s => s.sectionId === 'about')?.content?.p1 || ''}
                            onChange={(e) => updateSection('about', 'content', { ...sections.find(s => s.sectionId === 'about')?.content, p1: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2</label>
                        <textarea
                            rows={4}
                            value={sections.find(s => s.sectionId === 'about')?.content?.p2 || ''}
                            onChange={(e) => updateSection('about', 'content', { ...sections.find(s => s.sectionId === 'about')?.content, p2: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Social Proof Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">𝕏 Social Proof Tweets</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={addTweet}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Tweet
                        </button>
                        <button
                            onClick={() => saveSection(sections.find(s => s.sectionId === 'social-proof')!)}
                            disabled={saving === 'social-proof'}
                            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {saving === 'social-proof' ? 'Saving...' : 'Save Tweets'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {getTweets().map((tweet, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-6 relative group">
                            <button
                                onClick={() => removeTweet(i)}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Official X embed code or tweet URL</label>
                                <textarea
                                    rows={5}
                                    value={tweet.sourceInput || tweet.embedHtml || tweet.tweetUrl || ''}
                                    onChange={(e) => updateTweet(i, 'sourceInput', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none resize-y"
                                    placeholder='Paste the full X embed code here, for example: <blockquote class="twitter-tweet">...</blockquote>'
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    This field now accepts the official X embed snippet directly. Plain tweet URLs also still work.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 md:grid-cols-2 xl:grid-cols-5">
                                <div className="xl:col-span-2">
                                    <div className="font-medium text-gray-700">Tweet URL</div>
                                    <div className="break-all">{tweet.tweetUrl || '-'}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Tweet ID</div>
                                    <div>{tweet.tweetId || '-'}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Name</div>
                                    <div>{tweet.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Handle</div>
                                    <div>{tweet.handle ? `@${tweet.handle}` : '-'}</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">Date</div>
                                    <div>{tweet.date || '-'}</div>
                                </div>
                            </div>
                            {tweet.text ? (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm text-gray-700">
                                    {tweet.text}
                                </div>
                            ) : null}
                        </div>
                    ))}

                    {getTweets().length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            No tweets yet. Click &quot;Add Tweet&quot; to create social proof cards.
                        </div>
                    )}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                        Published tweets: <span className="font-semibold">{getTweets().filter(t => (t.tweetId || '').trim().length > 0).length}</span>
                    </div>
                </div>
            </div>

            {/* CTA Section Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">🚀 CTA Section</h2>
                    <button
                        onClick={() => saveSection(sections.find(s => s.sectionId === 'cta')!)}
                        disabled={saving === 'cta'}
                        className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> {saving === 'cta' ? 'Saving...' : 'Save CTA'}
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                        <input
                            type="text"
                            value={sections.find(s => s.sectionId === 'cta')?.title || ''}
                            onChange={(e) => updateSection('cta', 'title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CTA Subtitle</label>
                        <textarea
                            rows={3}
                            value={sections.find(s => s.sectionId === 'cta')?.subtitle || ''}
                            onChange={(e) => updateSection('cta', 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* AI TOOLS DIRECTORY PAGE SECTIONS           */}
            {/* ========================================== */}
            <div className="border-t border-gray-300 pt-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">AI Tools Directory Page</h2>
                <p className="text-gray-500 text-sm mb-8">Manage the CTA block and bottom SEO text on the Directory page.</p>
            </div>

            {/* Directory CTA Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">🎯 Directory CTA Block</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sections.find(s => s.sectionId === 'directory-cta')?.enabled || false}
                                onChange={(e) => updateSection('directory-cta', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Enabled</span>
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
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                        <input
                            type="text"
                            value={sections.find(s => s.sectionId === 'directory-cta')?.title || ''}
                            onChange={(e) => updateSection('directory-cta', 'title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                        <textarea
                            rows={2}
                            value={sections.find(s => s.sectionId === 'directory-cta')?.subtitle || ''}
                            onChange={(e) => updateSection('directory-cta', 'subtitle', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'directory-cta')?.content?.buttonText || ''}
                                onChange={(e) => updateSection('directory-cta', 'content', { ...sections.find(s => s.sectionId === 'directory-cta')?.content, buttonText: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                            <input
                                type="text"
                                value={sections.find(s => s.sectionId === 'directory-cta')?.content?.buttonUrl || ''}
                                onChange={(e) => updateSection('directory-cta', 'content', { ...sections.find(s => s.sectionId === 'directory-cta')?.content, buttonUrl: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors"
                                placeholder="/compare"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Directory SEO Content Editor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">📝 Directory SEO Text Block</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sections.find(s => s.sectionId === 'directory-seo')?.enabled || false}
                                onChange={(e) => updateSection('directory-seo', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                        <button
                            onClick={() => saveSection(sections.find(s => s.sectionId === 'directory-seo')!)}
                            disabled={saving === 'directory-seo'}
                            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> {saving === 'directory-seo' ? 'Saving...' : 'Save SEO'}
                        </button>
                    </div>
                </div>
                <div>
                    <div className="mb-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
                        <strong>Tip:</strong> Use HTML tags like <code>&lt;h2&gt;</code>, <code>&lt;h3&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code> for proper SEO structure.
                    </div>
                    <textarea
                        rows={14}
                        value={sections.find(s => s.sectionId === 'directory-seo')?.content?.html || ''}
                        onChange={(e) => updateSection('directory-seo', 'content', { ...sections.find(s => s.sectionId === 'directory-seo')?.content, html: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors leading-relaxed"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
