'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Package, Eye, Star, Clock, ExternalLink,
    BarChart3, Send, ArrowLeft, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

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

export default function VendorDashboard() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [tools, setTools] = useState<VendorTool[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Form state
    const [formName, setFormName] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPricing, setFormPricing] = useState('freemium');
    const [formCategory, setFormCategory] = useState('');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/portal-auth');
        }
    }, [authStatus, router]);

    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchTools();
        }
    }, [authStatus]);

    const fetchTools = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/vendor/tools');
            if (res.ok) {
                const data = await res.json();
                setTools(data);
            }
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            setLoading(false);
        }
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
                    shortDescription: formDescription,
                    pricingType: formPricing,
                    primaryCategory: formCategory || null,
                }),
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setFormName('');
                setFormUrl('');
                setFormDescription('');
                setFormPricing('freemium');
                setFormCategory('');
                fetchTools();
                setTimeout(() => {
                    setShowForm(false);
                    setSubmitSuccess(false);
                }, 2000);
            } else {
                const data = await res.json();
                setSubmitError(data.error || 'Failed to submit tool');
            }
        } catch (error) {
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
    const publishedCount = tools.filter(t => t.status === 'published').length;
    const draftCount = tools.filter(t => t.status === 'draft').length;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors mb-3">
                                <ArrowLeft className="w-4 h-4" /> Back to HyzenPro
                            </Link>
                            <h1 className="font-heading text-3xl text-black">Vendor Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your AI tools, track performance, and submit new listings.</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Submit New Tool
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Package className="w-3.5 h-3.5" /> Total Tools
                        </div>
                        <div className="font-heading text-3xl text-black">{tools.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Published
                        </div>
                        <div className="font-heading text-3xl text-green-600">{publishedCount}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Clock className="w-3.5 h-3.5" /> In Review
                        </div>
                        <div className="font-heading text-3xl text-amber-500">{draftCount}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Eye className="w-3.5 h-3.5" /> Total Views
                        </div>
                        <div className="font-heading text-3xl text-black">{totalViews.toLocaleString()}</div>
                    </div>
                </div>

                {/* Submission Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                        <h2 className="font-heading text-xl text-black mb-6">Submit a New AI Tool</h2>

                        {submitSuccess && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6">
                                <CheckCircle2 className="w-4 h-4" /> Tool submitted successfully! It will be reviewed by our team.
                            </div>
                        )}

                        {submitError && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                                <AlertCircle className="w-4 h-4" /> {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tool Name *</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g. ChatGPT, Midjourney..."
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Website URL *</label>
                                    <input
                                        type="url"
                                        value={formUrl}
                                        onChange={(e) => setFormUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Short Description *</label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Briefly describe what this AI tool does..."
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pricing Type</label>
                                    <select
                                        value={formPricing}
                                        onChange={(e) => setFormPricing(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    >
                                        <option value="free">Free</option>
                                        <option value="freemium">Freemium</option>
                                        <option value="paid">Paid</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Primary Category</label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="ai-video-tools">Video Tools</option>
                                        <option value="ai-writing-tools">Writing Tools</option>
                                        <option value="ai-image-tools">Image Tools</option>
                                        <option value="ai-code-tools">Code Tools</option>
                                        <option value="ai-marketing-tools">Marketing Tools</option>
                                        <option value="ai-chatbot-tools">Chatbot Tools</option>
                                        <option value="ai-audio-tools">Audio & Voice</option>
                                        <option value="ai-seo-tools">SEO Tools</option>
                                        <option value="ai-automation-tools">Automation Tools</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? 'Submitting...' : 'Submit for Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tools List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-heading text-lg text-black">Your Submitted Tools</h2>
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
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Submit Your First Tool
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tools.map((tool) => (
                                <div key={tool.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {tool.logo ? (
                                            <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-heading text-gray-400">{tool.name.charAt(0)}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-bold text-sm text-black truncate">{tool.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${tool.status === 'published'
                                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                                }`}>
                                                {tool.status === 'published' ? 'Live' : 'In Review'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{tool.shortDescription}</p>
                                    </div>

                                    <div className="hidden md:flex items-center gap-6 text-xs text-gray-500 flex-shrink-0">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" /> {tool.views?.toLocaleString() || 0}
                                        </div>
                                        {tool.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-yellow-500" /> {tool.rating.toFixed(1)}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(tool.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {tool.status === 'published' && (
                                        <Link
                                            href={`/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}`}
                                            className="flex-shrink-0 p-2 text-gray-400 hover:text-black transition-colors"
                                            title="View Live Page"
                                        >
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
