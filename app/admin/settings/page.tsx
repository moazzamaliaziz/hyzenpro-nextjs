'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { DEFAULT_SITE_LOGO_URL } from '@/lib/branding';
import MediaLibraryLink from '@/components/admin/MediaLibraryLink';

interface GlobalSettings {
    siteName: string;
    logoUrl: string;
    faviconUrl: string;
}

interface NavLink {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('branding');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
        siteName: 'HyzenPro',
        logoUrl: DEFAULT_SITE_LOGO_URL,
        faviconUrl: '/favicon.png',
    });

    const [headerLinks, setHeaderLinks] = useState<NavLink[]>([]);
    
    // For footer, we store sections as key-value pairs (e.g. { "Company": [{ label, href }] })
    const [footerLinks, setFooterLinks] = useState<Record<string, NavLink[]>>({});
    const [newFooterCategory, setNewFooterCategory] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                
                if (data.globalSettings) setGlobalSettings(data.globalSettings);
                if (data.headerNav?.links) setHeaderLinks(data.headerNav.links);
                if (data.footerNav?.links) setFooterLinks(data.footerNav.links);
            } catch (err) {
                setError('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalSettings,
                    headerNav: { links: headerLinks },
                    footerNav: { links: footerLinks },
                }),
            });

            if (!res.ok) throw new Error('Failed to save settings');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // --- Header Nav Managment ---
    const addHeaderLink = () => {
        setHeaderLinks([...headerLinks, { label: 'New Link', href: '/' }]);
    };
    const updateHeaderLink = (index: number, field: keyof NavLink, value: string) => {
        const updated = [...headerLinks];
        updated[index] = { ...updated[index], [field]: value };
        setHeaderLinks(updated);
    };
    const removeHeaderLink = (index: number) => {
        setHeaderLinks(headerLinks.filter((_, i) => i !== index));
    };

    // Sub-menus
    const addHeaderSubLink = (parentIndex: number) => {
        const updated = [...headerLinks];
        if (!updated[parentIndex].children) updated[parentIndex].children = [];
        updated[parentIndex].children!.push({ label: 'Sub Link', href: '/' });
        setHeaderLinks(updated);
    };
    const updateHeaderSubLink = (parentIndex: number, subIndex: number, field: string, value: string) => {
        const updated = [...headerLinks];
        updated[parentIndex].children![subIndex] = { ...updated[parentIndex].children![subIndex], [field]: value };
        setHeaderLinks(updated);
    };
    const removeHeaderSubLink = (parentIndex: number, subIndex: number) => {
        const updated = [...headerLinks];
        updated[parentIndex].children = updated[parentIndex].children!.filter((_, i) => i !== subIndex);
        if (updated[parentIndex].children!.length === 0) delete updated[parentIndex].children;
        setHeaderLinks(updated);
    };

    // --- Footer Nav Managment ---
    const addFooterCategory = () => {
        if (!newFooterCategory || footerLinks[newFooterCategory]) return;
        setFooterLinks({ ...footerLinks, [newFooterCategory]: [] });
        setNewFooterCategory('');
    };
    const removeFooterCategory = (cat: string) => {
        const updated = { ...footerLinks };
        delete updated[cat];
        setFooterLinks(updated);
    };
    const addFooterLink = (cat: string) => {
        const updated = { ...footerLinks };
        updated[cat] = [...updated[cat], { label: 'New Link', href: '/' }];
        setFooterLinks(updated);
    };
    const updateFooterLink = (cat: string, index: number, field: string, value: string) => {
        const updated = { ...footerLinks };
        updated[cat][index] = { ...updated[cat][index], [field]: value };
        setFooterLinks(updated);
    };
    const removeFooterLink = (cat: string, index: number) => {
        const updated = { ...footerLinks };
        updated[cat] = updated[cat].filter((_, i) => i !== index);
        setFooterLinks(updated);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Platform Settings</h1>
                    <p className="text-white/40">Manage global branding, header menus, and footer links</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">{error}</div>}
            {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl animate-pulse">Settings saved successfully! Layout changes will propagate immediately.</div>}

            <div className="flex gap-2 mb-6 border-b border-white/[0.06] pb-3">
                {['branding', 'header', 'footer'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === tab
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB: BRANDING */}
            {activeTab === 'branding' && (
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="font-heading text-xl text-white mb-6">Global Branding</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Site Name</label>
                                <input 
                                    type="text" 
                                    value={globalSettings.siteName} 
                                    onChange={(e) => setGlobalSettings({...globalSettings, siteName: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent/50 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Logo URL (Absolute or relative path)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={globalSettings.logoUrl || DEFAULT_SITE_LOGO_URL} alt="Logo Preview" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.src = DEFAULT_SITE_LOGO_URL)} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={globalSettings.logoUrl} 
                                        onChange={(e) => setGlobalSettings({...globalSettings, logoUrl: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent/50 focus:outline-none"
                                        placeholder={DEFAULT_SITE_LOGO_URL}
                                    />
                                </div>
                                <MediaLibraryLink helperText="Upload your brand assets in the Media Library, then paste the generated URL here." />
                                <p className="text-xs text-white/30 mt-2">Recommended size: 256x256 PNG or SVG with transparent background.</p>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Favicon URL
                                </label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center p-2 shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={globalSettings.faviconUrl || '/favicon.png'} alt="Favicon Preview" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={globalSettings.faviconUrl} 
                                        onChange={(e) => setGlobalSettings({...globalSettings, faviconUrl: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent/50 focus:outline-none"
                                        placeholder="/favicon.png"
                                    />
                                </div>
                                <MediaLibraryLink helperText="Favicon-sized PNGs can live in the Media Library too. Paste the generated URL or keep a static favicon path." />
                                <p className="text-xs text-white/30 mt-2">Standard .ico, .png, or .svg icon path (used in browser tabs).</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: HEADER NAV */}
            {activeTab === 'header' && (
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-heading text-xl text-white">Header Menu Builder</h3>
                            <button onClick={addHeaderLink} className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Main Link
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {headerLinks.map((link, idx) => (
                                <div key={idx} className="border border-white/10 bg-white/[0.01] rounded-xl overflow-hidden">
                                    {/* Main Link Row */}
                                    <div className="flex items-center gap-3 p-4 bg-white/[0.02]">
                                        <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
                                        <input type="text" value={link.label} onChange={(e) => updateHeaderLink(idx, 'label', e.target.value)} placeholder="Label" className="w-1/3 bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-white text-sm" />
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                            <input type="text" value={link.href} onChange={(e) => updateHeaderLink(idx, 'href', e.target.value)} placeholder="/path" className="w-full bg-white/[0.03] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-white text-sm" />
                                        </div>
                                        <button onClick={() => addHeaderSubLink(idx)} title="Add Dropdown Submenu" className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeHeaderLink(idx)} className="p-1.5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Sub Links */}
                                    {link.children && link.children.length > 0 && (
                                        <div className="p-4 pt-1 border-t border-white/5 pl-12 space-y-2">
                                            {link.children.map((child, subIdx) => (
                                                <div key={subIdx} className="flex items-center gap-3">
                                                    <div className="w-4 border-l-2 border-b-2 border-white/10 h-4 rounded-bl" />
                                                    <input type="text" value={child.label} onChange={(e) => updateHeaderSubLink(idx, subIdx, 'label', e.target.value)} placeholder="Sub Label" className="w-1/3 bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-white text-sm" />
                                                    <input type="text" value={child.href}  onChange={(e) => updateHeaderSubLink(idx, subIdx, 'href', e.target.value)} placeholder="/path" className="flex-1 bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-white text-sm" />
                                                    <button onClick={() => removeHeaderSubLink(idx, subIdx)} className="p-1.5 text-red-500/50 hover:text-red-400">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: FOOTER NAV */}
            {activeTab === 'footer' && (
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-heading text-xl text-white">Footer Columns Builder</h3>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={newFooterCategory} 
                                    onChange={(e) => setNewFooterCategory(e.target.value)} 
                                    placeholder="New Category Name" 
                                    className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && addFooterCategory()}
                                />
                                <button onClick={addFooterCategory} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {Object.entries(footerLinks).map(([category, links]) => (
                                <div key={category} className="border border-white/10 bg-white/[0.01] rounded-xl overflow-hidden p-4">
                                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                        <h4 className="font-bold text-white uppercase tracking-wider text-sm">{category}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => addFooterLink(category)} className="p-1 text-white/40 hover:text-white" title="Add Link">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => removeFooterCategory(category)} className="p-1 text-red-500/50 hover:text-red-400" title="Delete Category">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {links.map((link, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input type="text" value={link.label} onChange={(e) => updateFooterLink(category, idx, 'label', e.target.value)} placeholder="Label" className="w-1/2 bg-white/[0.03] border border-white/10 rounded-md px-2 py-1.5 text-white text-xs" />
                                                <input type="text" value={link.href}  onChange={(e) => updateFooterLink(category, idx, 'href', e.target.value)} placeholder="/path" className="w-1/2 bg-white/[0.03] border border-white/10 rounded-md px-2 py-1.5 text-white text-xs" />
                                                <button onClick={() => removeFooterLink(category, idx)} className="p-1 text-red-500/50 hover:text-red-400">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {links.length === 0 && <div className="text-xs text-white/30 italic">No links added</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
