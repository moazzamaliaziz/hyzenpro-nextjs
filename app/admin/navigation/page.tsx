'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface NavLink {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
}

interface FooterLinks {
    [category: string]: { href: string; label: string }[];
}

export default function AdminNavigationPage() {
    const [headerLinks, setHeaderLinks] = useState<NavLink[]>([]);
    const [footerLinks, setFooterLinks] = useState<FooterLinks>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/homepage').then(res => res.json())
        ]).then(([sections]) => {
            if (Array.isArray(sections)) {
                const header = sections.find(s => s.sectionId === 'header-nav');
                const footer = sections.find(s => s.sectionId === 'footer-nav');

                if (header?.content?.links) setHeaderLinks(header.content.links);
                if (footer?.content?.links) setFooterLinks(footer.content.links);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const saveSection = async (sectionId: string, links: any) => {
        setSaving(sectionId);
        try {
            await fetch('/api/admin/homepage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId,
                    content: { links }
                }),
            });
        } catch (e) {
            console.error('Save failed:', e);
        }
        setSaving(null);
    };

    // Header Editor Functions
    const addHeaderLink = () => setHeaderLinks([...headerLinks, { label: '', href: '' }]);
    const updateHeaderLink = (i: number, field: string, value: string) => {
        const newLinks = [...headerLinks];
        (newLinks[i] as any)[field] = value;
        setHeaderLinks(newLinks);
    };
    const removeHeaderLink = (i: number) => setHeaderLinks(headerLinks.filter((_, idx) => idx !== i));
    const addHeaderSublink = (i: number) => {
        const newLinks = [...headerLinks];
        if (!newLinks[i].children) newLinks[i].children = [];
        newLinks[i].children!.push({ label: '', href: '' });
        setHeaderLinks(newLinks);
    };
    const updateHeaderSublink = (parentIdx: number, subIdx: number, field: string, value: string) => {
        const newLinks = [...headerLinks];
        (newLinks[parentIdx].children![subIdx] as any)[field] = value;
        setHeaderLinks(newLinks);
    };
    const removeHeaderSublink = (parentIdx: number, subIdx: number) => {
        const newLinks = [...headerLinks];
        newLinks[parentIdx].children = newLinks[parentIdx].children!.filter((_, idx) => idx !== subIdx);
        setHeaderLinks(newLinks);
    };
    const moveHeaderLink = (idx: number, dir: -1 | 1) => {
        if (idx + dir < 0 || idx + dir >= headerLinks.length) return;
        const newLinks = [...headerLinks];
        const temp = newLinks[idx];
        newLinks[idx] = newLinks[idx + dir];
        newLinks[idx + dir] = temp;
        setHeaderLinks(newLinks);
    };

    // Footer Editor Functions
    const addFooterCategory = () => setFooterLinks({ ...footerLinks, ['New Category']: [] });
    const renameFooterCategory = (oldName: string, newName: string) => {
        if (oldName === newName || footerLinks[newName]) return;
        const newLinks = { ...footerLinks };
        newLinks[newName] = newLinks[oldName];
        delete newLinks[oldName];
        setFooterLinks(newLinks);
    };
    const removeFooterCategory = (cat: string) => {
        const newLinks = { ...footerLinks };
        delete newLinks[cat];
        setFooterLinks(newLinks);
    };
    const addFooterLink = (cat: string) => {
        setFooterLinks({ ...footerLinks, [cat]: [...footerLinks[cat], { label: '', href: '' }] });
    };
    const updateFooterLink = (cat: string, i: number, field: string, value: string) => {
        const newLinks = { ...footerLinks };
        (newLinks[cat][i] as any)[field] = value;
        setFooterLinks(newLinks);
    };
    const removeFooterLink = (cat: string, i: number) => {
        const newLinks = { ...footerLinks };
        newLinks[cat] = newLinks[cat].filter((_, idx) => idx !== i);
        setFooterLinks(newLinks);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Navigation Editing</h1>
                <p className="text-gray-500">Manage the menus shown in the Header and Footer of the site. Changes update immediately.</p>
            </div>

            {/* HEADER NAVIGATION */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Header Navigation</h2>
                    <div className="flex items-center gap-3">
                        <button onClick={addHeaderLink} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Link
                        </button>
                        <button onClick={() => saveSection('header-nav', headerLinks)} disabled={saving === 'header-nav'} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                            <Save className="w-4 h-4" /> {saving === 'header-nav' ? 'Saving...' : 'Save Header'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {headerLinks.map((link, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col gap-1 mt-1">
                                    <button onClick={() => moveHeaderLink(i, -1)} disabled={i === 0} className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveHeaderLink(i, 1)} disabled={i === headerLinks.length - 1} className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <input type="text" value={link.label} onChange={(e) => updateHeaderLink(i, 'label', e.target.value)} placeholder="Label (e.g. Home)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                    <input type="text" value={link.href} onChange={(e) => updateHeaderLink(i, 'href', e.target.value)} placeholder="URL (e.g. /)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <button onClick={() => addHeaderSublink(i)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Add Dropdown Link"><Plus className="w-4 h-4" /></button>
                                    <button onClick={() => removeHeaderLink(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Sub-links */}
                            {link.children && link.children.length > 0 && (
                                <div className="mt-4 pl-12 space-y-3 relative before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-gray-200">
                                    {link.children.map((sub, j) => (
                                        <div key={j} className="flex items-center gap-3 relative before:absolute before:top-1/2 before:-left-6 before:w-6 before:h-px before:bg-gray-200">
                                            <input type="text" value={sub.label} onChange={(e) => updateHeaderSublink(i, j, 'label', e.target.value)} placeholder="Dropdown Label" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                                            <input type="text" value={sub.href} onChange={(e) => updateHeaderSublink(i, j, 'href', e.target.value)} placeholder="URL" className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                                            <button onClick={() => removeHeaderSublink(i, j)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {headerLinks.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No header links configured.</p>}
                </div>
            </div>

            {/* FOOTER NAVIGATION */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Footer Columns</h2>
                    <div className="flex items-center gap-3">
                        <button onClick={addFooterCategory} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Column
                        </button>
                        <button onClick={() => saveSection('footer-nav', footerLinks)} disabled={saving === 'footer-nav'} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                            <Save className="w-4 h-4" /> {saving === 'footer-nav' ? 'Saving...' : 'Save Footer'}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(footerLinks).map(([cat, links]) => (
                        <div key={cat} className="border border-gray-100 rounded-xl p-5 bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="text"
                                    defaultValue={cat}
                                    onBlur={(e) => renameFooterCategory(cat, e.target.value)}
                                    className="flex-1 font-heading text-lg bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-1"
                                />
                                <button onClick={() => addFooterLink(cat)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => removeFooterCategory(cat)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>

                            <div className="space-y-3">
                                {links.map((link, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="text" value={link.label} onChange={(e) => updateFooterLink(cat, i, 'label', e.target.value)} placeholder="Label" className="w-1/2 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:border-black" />
                                        <input type="text" value={link.href} onChange={(e) => updateFooterLink(cat, i, 'href', e.target.value)} placeholder="URL" className="w-1/2 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:border-black" />
                                        <button onClick={() => removeFooterLink(cat, i)} className="p-1 text-red-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(footerLinks).length === 0 && <p className="col-span-2 text-center py-6 text-gray-400 text-sm">No footer columns configured.</p>}
                </div>
            </div>
        </div>
    );
}
