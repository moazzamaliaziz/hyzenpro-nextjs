'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
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

    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
    const [categories, setCategories] = useState<string[]>(initialData?.categories || ['Blog']);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [postType, setPostType] = useState(initialData?.postType || 'post');
    const [seo, setSeo] = useState(initialData?.seo || {});
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const body = {
                title, slug, excerpt, content, featuredImage,
                categories, tags, status, postType,
                author: 'HyzenPro Team',
                seo: Object.keys(seo).length > 0 ? seo : undefined,
            };

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

            router.push('/admin/posts');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts" className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-heading text-3xl text-white">{isEditing ? 'Edit Post' : 'New Blog Post'}</h1>
                </div>
                <div className="flex gap-3">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Title *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-lg focus:border-accent/50 focus:outline-none" placeholder="Post title" />
                        </div>
                        <SlugInput value={slug} onChange={setSlug} sourceValue={title} prefix="/" />
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Excerpt</label>
                            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none resize-none" placeholder="Brief summary for listings and SEO" />
                        </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <label className="block text-sm text-white/60 mb-3">Content</label>
                        <RichTextEditor value={content} onChange={setContent} placeholder="Write your blog post here..." />
                    </div>

                    <SEOFields seo={seo} onChange={setSeo} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Post Type</label>
                            <select value={postType} onChange={(e) => setPostType(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                                <option value="post">Blog Post</option>
                                <option value="review">Review</option>
                                <option value="comparison">Comparison</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="page">Page</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Featured Image URL</label>
                            <input type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="https://..." />
                            {featuredImage && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                                    <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Category</label>
                            <input type="text" value={categories[0] || ''} onChange={(e) => setCategories([e.target.value])}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none" placeholder="Blog" />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <label className="block text-sm text-white/60 mb-2">Tags</label>
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
