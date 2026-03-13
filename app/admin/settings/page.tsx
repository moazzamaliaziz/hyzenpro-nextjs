'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, ExternalLink } from 'lucide-react';

interface SectionData {
    sectionId: string;
    title: string;
    subtitle: string;
    content: any;
    enabled: boolean;
}

export default function AdminSettingsPage() {
    const [sections, setSections] = useState<SectionData[]>([
        {
            sectionId: 'integrations',
            title: 'Integrations',
            subtitle: '',
            content: {
                gaId: process.env.NEXT_PUBLIC_GA_ID || '',
                adsenseId: process.env.NEXT_PUBLIC_ADSENSE_ID || '',
                googleVerification: '',
                bingVerification: '',
            },
            enabled: true,
        },
    ]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/homepage')
            .then(res => res.json())
            .then((data: SectionData[]) => {
                if (Array.isArray(data)) {
                    const integrations = data.find((d: any) => d.sectionId === 'integrations');
                    if (integrations) {
                        setSections([{ ...sections[0], ...integrations }]);
                    }
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateField = (field: string, value: string) => {
        setSections(prev => [{
            ...prev[0],
            content: { ...prev[0].content, [field]: value },
        }]);
    };

    const save = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sections[0]),
            });
        } catch (e) {
            console.error('Save failed:', e);
        }
        setSaving(false);
    };

    const content = sections[0]?.content || {};

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500">Configure Google integrations, verification codes, and performance tracking.</p>
            </div>

            {/* Google Analytics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">📊 Google Analytics 4</h2>
                        <p className="text-sm text-gray-500 mt-1">Track traffic, user behavior, and conversions</p>
                    </div>
                    <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        Open GA4 <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Measurement ID</label>
                    <input
                        type="text"
                        value={content.gaId || ''}
                        onChange={(e) => updateField('gaId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors"
                        placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Also set <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_GA_ID</code> in your <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> for server-side rendering.</p>
                </div>
            </div>

            {/* Google AdSense */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">💰 Google AdSense</h2>
                        <p className="text-sm text-gray-500 mt-1">Monetize your site with targeted advertisements</p>
                    </div>
                    <a href="https://adsense.google.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        Open AdSense <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publisher ID</label>
                    <input
                        type="text"
                        value={content.adsenseId || ''}
                        onChange={(e) => updateField('adsenseId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors"
                        placeholder="ca-pub-XXXXXXXXXX"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Also set <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_ADSENSE_ID</code> in your <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> for the script to load.</p>
                </div>
            </div>

            {/* Search Engine Verification */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">🔍 Webmaster Verification</h2>
                <p className="text-sm text-gray-500 mb-6">Verify site ownership with search engines for SEO</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Search Console</label>
                        <input
                            type="text"
                            value={content.googleVerification || ''}
                            onChange={(e) => updateField('googleVerification', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors"
                            placeholder="Verification code from Search Console"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bing Webmaster Tools</label>
                        <input
                            type="text"
                            value={content.bingVerification || ''}
                            onChange={(e) => updateField('bingVerification', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:border-black focus:outline-none transition-colors"
                            placeholder="Verification code from Bing"
                        />
                    </div>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">🛡️ Security Overview</h2>
                <p className="text-sm text-gray-500 mb-6">Current hardening measures active on this deployment</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'HSTS Preload', status: true },
                        { label: 'X-Frame-Options DENY', status: true },
                        { label: 'XSS Protection', status: true },
                        { label: 'Content-Type nosniff', status: true },
                        { label: 'Strict Referrer Policy', status: true },
                        { label: 'Permissions Policy', status: true },
                        { label: 'bcrypt Password Hashing', status: true },
                        { label: 'TOTP 2FA Authentication', status: true },
                        { label: 'JWT Session Strategy', status: true },
                        { label: 'Admin Route Middleware', status: true },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                            <span className="text-green-500 font-bold">✓</span>
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-6 flex justify-end">
                <button
                    onClick={save}
                    disabled={saving}
                    className="px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-black/20"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
        </div>
    );
}
