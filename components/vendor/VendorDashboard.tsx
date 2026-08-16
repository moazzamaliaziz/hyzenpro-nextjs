'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Package, Eye, Star, Clock, ExternalLink,
    BarChart3, Send, ArrowLeft, CheckCircle2, AlertCircle, Loader2, X,
} from 'lucide-react';
import ToolLogo from '@/components/ui/ToolLogo';
import { buildAdminLoginUrl } from '@/lib/admin';
import { buildToolCanonicalPath } from '@/lib/tool-paths';
import VendorReviewNotice from '@/components/site/VendorReviewNotice';
import TurnstileWidget from '@/components/vendor/TurnstileWidget';

interface VendorTool {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    logo?: string | null;
    pricingType: string;
    status: string;
    views: number;
    rating?: number | null;
    primaryCategory?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface CategoryOption {
    id: string;
    name: string;
    slug: string;
}

function listField(
    items: string[],
    setItems: (v: string[]) => void,
    placeholder: string,
    label: string
) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                                const next = [...items];
                                next[i] = e.target.value;
                                setItems(next);
                            }}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-black"
                        />
                        {items.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                                className="p-2 text-gray-400 hover:text-red-600"
                                aria-label={`Remove ${label}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => setItems([...items, ''])}
                    className="text-xs font-semibold text-black hover:underline"
                >
                    + Add {label.toLowerCase()}
                </button>
            </div>
        </div>
    );
}

export default function VendorDashboard() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [tools, setTools] = useState<VendorTool[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');

    const [formName, setFormName] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [formLogo, setFormLogo] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formLongDescription, setFormLongDescription] = useState('');
    const [formPricing, setFormPricing] = useState('freemium');
    const [formCategory, setFormCategory] = useState('');
    const [formSecondaryCategories, setFormSecondaryCategories] = useState<string[]>([]);
    const [formFounder, setFormFounder] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formFeatures, setFormFeatures] = useState(['']);
    const [formPros, setFormPros] = useState(['']);
    const [formCons, setFormCons] = useState(['']);
    const [socialTwitter, setSocialTwitter] = useState('');
    const [socialLinkedin, setSocialLinkedin] = useState('');
    const [socialGithub, setSocialGithub] = useState('');
    const [socialYoutube, setSocialYoutube] = useState('');
    const [socialDiscord, setSocialDiscord] = useState('');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push(buildAdminLoginUrl('/vendor'));
        }
    }, [authStatus, router]);

    const fetchTools = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vendor/tools');
            if (res.ok) {
                setTools(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchTools();
            fetch('/api/vendor/categories')
                .then((r) => (r.ok ? r.json() : []))
                .then((data) => setCategories(data))
                .catch(() => setCategories([]));
        }
    }, [authStatus, fetchTools]);

    const resetForm = () => {
        setFormName('');
        setFormUrl('');
        setFormLogo('');
        setFormDescription('');
        setFormLongDescription('');
        setFormPricing('freemium');
        setFormCategory('');
        setFormSecondaryCategories([]);
        setFormFounder('');
        setFormCompany('');
        setFormNotes('');
        setFormFeatures(['']);
        setFormPros(['']);
        setFormCons(['']);
        setSocialTwitter('');
        setSocialLinkedin('');
        setSocialGithub('');
        setSocialYoutube('');
        setSocialDiscord('');
        setTurnstileToken('');
    };

    const openSubmitForm = () => {
        setShowReviewModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const res = await fetch('/api/vendor/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    websiteUrl: formUrl,
                    logo: formLogo,
                    shortDescription: formDescription,
                    longDescription: formLongDescription || formDescription,
                    pricingType: formPricing,
                    primaryCategory: formCategory,
                    secondaryCategories: formSecondaryCategories,
                    founderName: formFounder,
                    companyName: formCompany,
                    reviewNotes: formNotes,
                    features: formFeatures.filter(Boolean),
                    pros: formPros.filter(Boolean),
                    cons: formCons.filter(Boolean),
                    socialLinks: {
                        twitter: socialTwitter,
                        linkedin: socialLinkedin,
                        github: socialGithub,
                        youtube: socialYoutube,
                        discord: socialDiscord,
                        website: formUrl,
                    },
                    turnstileToken,
                }),
            });

            if (res.ok) {
                setSubmitSuccess(true);
                resetForm();
                fetchTools();
                setTimeout(() => {
                    setShowForm(false);
                    setSubmitSuccess(false);
                }, 3000);
            } else {
                const data = await res.json();
                setSubmitError(data.error || 'Failed to submit tool');
            }
        } catch {
            setSubmitError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (authStatus === 'unauthenticated') return null;

    const totalViews = tools.reduce((sum, t) => sum + (t.views || 0), 0);
    const publishedCount = tools.filter((t) => t.status === 'published').length;
    const draftCount = tools.filter((t) => t.status === 'draft').length;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {showReviewModal && (
                <VendorReviewNotice
                    variant="modal"
                    onAcknowledge={() => {
                        setShowReviewModal(false);
                        setShowForm(true);
                    }}
                />
            )}

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-3">
                                <ArrowLeft className="w-4 h-4" /> Back to HyzenPro
                            </Link>
                            <h1 className="font-heading text-3xl text-black">Vendor Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Welcome{session?.user?.email ? `, ${session.user.email}` : ''}. Submit and track your AI tool listings.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openSubmitForm}
                            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Submit New Tool
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Package, label: 'Total Tools', value: tools.length },
                        { icon: CheckCircle2, label: 'Published', value: publishedCount, color: 'text-green-600' },
                        { icon: Clock, label: 'In Review', value: draftCount, color: 'text-amber-500' },
                        { icon: Eye, label: 'Total Views', value: totalViews.toLocaleString() },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                                <stat.icon className="w-3.5 h-3.5" /> {stat.label}
                            </div>
                            <div className={`font-heading text-3xl text-black ${stat.color || ''}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                        <h2 className="font-heading text-xl text-black mb-2">Submit a New AI Tool</h2>
                        <VendorReviewNotice variant="banner" />

                        {submitSuccess && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6">
                                <CheckCircle2 className="w-4 h-4" /> Submitted for review. We typically publish approved tools within 3–4 business days.
                            </div>
                        )}
                        {submitError && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                                <AlertCircle className="w-4 h-4" /> {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tool Name *</label>
                                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" placeholder="e.g. Manus AI" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Website URL *</label>
                                    <input type="url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" placeholder="https://example.com" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Logo / Icon URL</label>
                                    <input type="url" value={formLogo} onChange={(e) => setFormLogo(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" placeholder="https://.../logo.png" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Founder or contact name</label>
                                    <input type="text" value={formFounder} onChange={(e) => setFormFounder(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Short Description *</label>
                                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} required rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black resize-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Long Description</label>
                                <textarea value={formLongDescription} onChange={(e) => setFormLongDescription(e.target.value)} rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black resize-none"
                                    placeholder="Features, use cases, and what makes your tool different..." />
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Category *</label>
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black"
                                        aria-label="Primary category">
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pricing Type</label>
                                    <select value={formPricing} onChange={(e) => setFormPricing(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black"
                                        aria-label="Pricing type">
                                        <option value="free">Free</option>
                                        <option value="freemium">Freemium</option>
                                        <option value="paid">Paid</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <label key={cat.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm cursor-pointer hover:border-black">
                                                <input
                                                    type="checkbox"
                                                    checked={formSecondaryCategories.includes(cat.slug)}
                                                    disabled={formCategory === cat.slug}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormSecondaryCategories([...formSecondaryCategories, cat.slug]);
                                                        } else {
                                                            setFormSecondaryCategories(formSecondaryCategories.filter((s) => s !== cat.slug));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                {cat.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {listField(formFeatures, setFormFeatures, 'Key feature', 'Features')}
                            {listField(formPros, setFormPros, 'Advantage', 'Pros')}
                            {listField(formCons, setFormCons, 'Limitation', 'Cons')}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Social & links</label>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Twitter / X', value: socialTwitter, set: setSocialTwitter },
                                        { label: 'LinkedIn', value: socialLinkedin, set: setSocialLinkedin },
                                        { label: 'GitHub', value: socialGithub, set: setSocialGithub },
                                        { label: 'YouTube', value: socialYoutube, set: setSocialYoutube },
                                        { label: 'Discord', value: socialDiscord, set: setSocialDiscord },
                                    ].map((field) => (
                                        <input key={field.label} type="url" value={field.value} onChange={(e) => field.set(e.target.value)}
                                            placeholder={`${field.label} URL`}
                                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" />
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Company name</label>
                                    <input type="text" value={formCompany} onChange={(e) => setFormCompany(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notes for reviewers</label>
                                    <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black"
                                        placeholder="Pricing page, demo access, etc." />
                                </div>
                            </div>

                            <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

                            <div className="flex items-center gap-3 pt-2">
                                <button type="submit" disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? 'Submitting...' : 'Submit for Review'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm text-gray-500 hover:text-black">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-heading text-lg text-black">Your Submitted Tools</h2>
                        <BarChart3 className="w-4 h-4 text-gray-300" />
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Loading your tools...</p>
                        </div>
                    ) : tools.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm mb-4">You haven&apos;t submitted any tools yet.</p>
                            <button type="button" onClick={openSubmitForm}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl">
                                <Plus className="w-4 h-4" /> Submit Your First Tool
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tools.map((tool) => (
                                <div key={tool.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl border flex items-center justify-center overflow-hidden shrink-0">
                                        <ToolLogo logo={tool.logo} name={tool.name} size="sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-sm text-black truncate">{tool.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tool.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {tool.status === 'published' ? 'Live' : 'In Review'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{tool.shortDescription}</p>
                                    </div>
                                    {tool.status === 'published' && (
                                        <Link href={buildToolCanonicalPath(tool.primaryCategory, tool.slug)} target="_blank" className="p-2 text-gray-400 hover:text-black" title="View live page">
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
