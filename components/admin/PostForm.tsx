'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X, Calendar, Clock, Eye, Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SEOFields from '@/components/admin/SEOFields';
import SlugInput from '@/components/admin/SlugInput';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface PostFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function PostForm({ initialData, isEditing }: PostFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Core fields
    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
    const [categories, setCategories] = useState<string[]>(initialData?.categories || ['Blog']);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [postType, setPostType] = useState(initialData?.postType || 'post');
    const [authorId, setAuthorId] = useState(initialData?.authorId || '');
    const [seo, setSeo] = useState(initialData?.seo || {});
    const [tagInput, setTagInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [authors, setAuthors] = useState<any[]>([]);

    // Scheduled publishing
    const [scheduledAt, setScheduledAt] = useState(
        initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : ''
    );

    // Timestamps for display
    const publishedAt = initialData?.publishedAt;
    const createdAt = initialData?.createdAt;
    const updatedAt = initialData?.updatedAt;

    useEffect(() => {
        fetch('/api/admin/authors')
            .then(res => res.json())
            .then(data => setAuthors(data))
            .catch(err => console.error(err));
    }, []);

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const addCategory = () => {
        if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
            setCategories([...categories, categoryInput.trim()]);
            setCategoryInput('');
        }
    };

    const removeCategory = (cat: string) => {
        setCategories(categories.filter(c => c !== cat));
    };

    // Calculate reading time from content
    const calcReadingTime = (html: string) => {
        const text = html.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    const handleSubmit = async (e: React.FormEvent, overrideStatus?: string) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMsg('');

        const finalStatus = overrideStatus || status;

        try {
            const body: any = {
                title, slug, excerpt, content, featuredImage,
                categories, tags,
                status: finalStatus,
                postType,
                authorId: authorId || null,
                author: 'HyzenPro Team',
                seo: Object.keys(seo).length > 0 ? seo : undefined,
                readingTime: calcReadingTime(content),
            };

            // Handle scheduled publishing
            if (finalStatus === 'scheduled' && scheduledAt) {
                body.scheduledAt = new Date(scheduledAt).toISOString();
            }

            const url = isEditing ? `/api/posts/${initialData.id}` : '/api/posts';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save post');
            }

            setSuccessMsg(
                finalStatus === 'published' ? 'Post published!' :
                    finalStatus === 'scheduled' ? 'Post scheduled!' :
                        finalStatus === 'trash' ? 'Post moved to trash' :
                            'Post saved as draft'
            );

            setTimeout(() => {
                router.push('/admin/posts');
                router.refresh();
            }, 800);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTrash = async () => {
        if (!isEditing || !confirm('Move this post to trash?')) return;
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        await handleSubmit(fakeEvent, 'trash');
    };

    const handleRestore = async () => {
        if (!isEditing) return;
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        await handleSubmit(fakeEvent, 'draft');
    };

    const statusConfig: Record<string, { label: string; color: string }> = {
        draft: { label: 'Draft', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        published: { label: 'Published', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
        scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        trash: { label: 'Trash', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-heading text-3xl text-white">{isEditing ? 'Edit Post' : 'New Blog Post'}</h1>
                        {isEditing && (
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusConfig[status]?.color || statusConfig.draft.color}`}>
                                    {statusConfig[status]?.label || status}
                                </span>
                                {publishedAt && <span className="text-xs text-white/30">Published {new Date(publishedAt).toLocaleDateString()}</span>}
                                {updatedAt && updatedAt !== createdAt && <span className="text-xs text-white/30">· Updated {new Date(updatedAt).toLocaleDateString()}</span>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing && status !== 'trash' && (
                        <button type="button" onClick={handleTrash}
                            className="flex items-center gap-2 px-4 py-2.5 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors text-sm">
                            <Trash2 className="w-4 h-4" /> Trash
                        </button>
                    )}
                    {status === 'trash' && (
                        <button type="button" onClick={handleRestore}
                            className="flex items-center gap-2 px-4 py-2.5 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/10 transition-colors text-sm">
                            <RotateCcw className="w-4 h-4" /> Restore
                        </button>
                    )}
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{successMsg}</div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content — 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Slug */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Title *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white text-xl font-medium focus:border-accent/50 focus:outline-none" placeholder="Post title" />
                        </div>
                        <SlugInput value={slug} onChange={setSlug} sourceValue={title} prefix="/blog/" />
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Excerpt</label>
                            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none resize-none" placeholder="Brief summary for listings and SEO" />
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <label className="block text-sm text-white/60 mb-3">Content</label>
                        <RichTextEditor value={content} onChange={setContent} placeholder="Write your blog post here..." />
                    </div>

                    {/* SEO Fields */}
                    <SEOFields seo={seo} onChange={setSeo} title={title} slug={slug} />
                </div>

                {/* Sidebar — 1 column */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <h3 className="font-heading text-base text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" /> Publish Settings
                        </h3>

                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                <option value="draft">📝 Draft</option>
                                <option value="published">✅ Published</option>
                                <option value="scheduled">⏰ Scheduled</option>
                                <option value="trash">🗑️ Trash</option>
                            </select>
                        </div>

                        {/* Schedule date/time picker */}
                        {status === 'scheduled' && (
                            <div>
                                <label className="block text-sm text-white/60 mb-1.5">
                                    <Clock className="w-3.5 h-3.5 inline mr-1" /> Publish Date & Time
                                </label>
                                <input type="datetime-local" value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" />
                                {scheduledAt && (
                                    <p className="text-xs text-blue-400 mt-1.5">
                                        Will publish on {new Date(scheduledAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Post Type</label>
                            <select value={postType} onChange={(e) => setPostType(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                <option value="post">📄 Blog Post</option>
                                <option value="review">⭐ Review</option>
                                <option value="comparison">⚖️ Comparison</option>
                                <option value="tutorial">📚 Tutorial</option>
                                <option value="page">📃 Page</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Author</label>
                            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                <option value="">Default (HyzenPro Team)</option>
                                {authors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <h3 className="font-heading text-base text-white">🖼️ Featured Image</h3>
                        <input type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="https://..." />
                        {featuredImage && (
                            <div className="rounded-lg overflow-hidden border border-white/10">
                                <img src={featuredImage} alt="Preview" className="w-full h-40 object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="font-heading text-base text-white mb-3">📁 Categories</h3>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="Add category..." />
                            <button type="button" onClick={addCategory} className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <span key={cat} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs border border-blue-500/20">
                                    {cat}
                                    <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <h3 className="font-heading text-base text-white mb-3">🏷️ Tags</h3>
                        <div className="flex gap-2 mb-3">
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="Add tag..." />
                            <button type="button" onClick={addTag} className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
