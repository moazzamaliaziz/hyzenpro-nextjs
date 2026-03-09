'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';

interface Tweet {
    avatar: string;
    name: string;
    handle: string;
    text: string;
    date: string;
    likes: number;
    retweets: number;
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
        { sectionId: 'cta', title: 'Build with the Best.', subtitle: 'Are you building the next generation of AI tools? Index your platform on HyzenPro to reach thousands of decision-makers and developers daily.', content: {}, enabled: true },
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
            await fetch('/api/admin/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(section),
            });
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
        const tweets = getTweets();
        tweets.push({ avatar: '', name: '', handle: '', text: '', date: '', likes: 0, retweets: 0 });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Homepage Editor</h1>
                <p className="text-gray-500">Edit the landing page sections. Changes are saved per-section.</p>
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
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                                    <input type="text" value={tweet.name} onChange={(e) => updateTweet(i, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">@handle</label>
                                    <input type="text" value={tweet.handle} onChange={(e) => updateTweet(i, 'handle', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tweet Text</label>
                                <textarea rows={2} value={tweet.text} onChange={(e) => updateTweet(i, 'text', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                    <input type="text" value={tweet.date} onChange={(e) => updateTweet(i, 'date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" placeholder="Mar 5, 2026" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Likes</label>
                                    <input type="number" value={tweet.likes} onChange={(e) => updateTweet(i, 'likes', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Retweets</label>
                                    <input type="number" value={tweet.retweets} onChange={(e) => updateTweet(i, 'retweets', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Avatar URL</label>
                                    <input type="text" value={tweet.avatar} onChange={(e) => updateTweet(i, 'avatar', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:outline-none" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    ))}

                    {getTweets().length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            No tweets yet. Click &quot;Add Tweet&quot; to create social proof cards.
                        </div>
                    )}
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
        </div>
    );
}
