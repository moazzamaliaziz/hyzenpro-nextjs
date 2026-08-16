'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, ExternalLink, Clock, Eye, Copy, Globe, Archive, Trash2, CheckSquare, Square, BookOpen } from 'lucide-react';
import DeletePostButton from '@/components/admin/DeletePostButton';
import { formatDateShort } from '@/lib/utils';

interface PostRow {
    id: string;
    title: string;
    slug: string;
    author: string;
    authorModel: { name: string | null } | null;
    status: string;
    categories: string[];
    tags: string[];
    views: number;
    readingTime: number | null;
    publishedAt: string | null;
    createdAt: string;
    scheduledAt: string | null;
    featuredImage: string | null;
    isDedicated?: boolean;
}

interface AdminPostsListClientProps {
    posts: string;
    currentStatus: string;
    searchQuery: string;
}

export default function AdminPostsListClient({ posts: postsJson, currentStatus, searchQuery }: AdminPostsListClientProps) {
    const router = useRouter();
    const posts: PostRow[] = JSON.parse(postsJson);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [duplicating, setDuplicating] = useState<string | null>(null);
    const [creatingDedicated, setCreatingDedicated] = useState<string | null>(null);

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: 'bg-green-500/10 text-green-400 border-green-500/20',
            draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            trash: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return styles[status] || styles.draft;
    };

    const allSelectableIds = posts.filter(p => !p.isDedicated).map(p => p.id);
    const allSelected = selectedIds.length > 0 && selectedIds.length === allSelectableIds.length;

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds([...allSelectableIds]);
        }
    }, [allSelectableIds, allSelected]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    const handleDuplicate = async (post: PostRow) => {
        if (post.isDedicated) return;
        setDuplicating(post.id);
        try {
            const res = await fetch(`/api/posts/${post.id}`);
            if (!res.ok) throw new Error('Failed to fetch post');
            const fullPost = await res.json();

            const dupRes = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `${fullPost.title} (Copy)`,
                    slug: `${fullPost.slug}-copy`,
                    excerpt: fullPost.excerpt || '',
                    content: fullPost.content || '',
                    featuredImage: fullPost.featuredImage || '',
                    categories: fullPost.categories || [],
                    tags: fullPost.tags || [],
                    author: fullPost.author || 'HyzenPro Team',
                    authorId: fullPost.authorId || null,
                    status: 'draft',
                    postType: fullPost.postType || 'post',
                    seo: fullPost.seo || undefined,
                }),
            });
            if (!dupRes.ok) {
                const data = await dupRes.json();
                throw new Error(data.error || 'Failed to duplicate');
            }
            router.refresh();
        } catch (err: any) {
            alert(err.message || 'Failed to duplicate post');
        } finally {
            setDuplicating(null);
        }
    };

    const handleEditDedicated = async (post: PostRow) => {
        if (!post.isDedicated) return;
        setCreatingDedicated(post.id);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: post.title,
                    slug: post.slug,
                    excerpt: '',
                    content: '',
                    featuredImage: post.featuredImage || '',
                    categories: post.categories || [],
                    tags: post.tags || [],
                    author: post.author || 'HyzenPro Team',
                    status: 'published',
                    postType: 'post',
                    publishedAt: post.publishedAt || new Date().toISOString(),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                if (data.error?.includes('already exists')) {
                    router.push(`/admin/posts?status=published&search=${encodeURIComponent(post.title)}`);
                    router.refresh();
                    return;
                }
                throw new Error(data.error || 'Failed to import post');
            }
            const created = await res.json();
            router.push(`/admin/posts/${created.id}`);
        } catch (err: any) {
            alert(err.message || 'Failed to import post');
        } finally {
            setCreatingDedicated(null);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedIds.length === 0) return;

        const confirmMsgs: Record<string, string> = {
            publish: `Publish ${selectedIds.length} post(s)?`,
            unpublish: `Move ${selectedIds.length} post(s) to draft?`,
            trash: `Move ${selectedIds.length} post(s) to trash?`,
            delete: `Permanently delete ${selectedIds.length} post(s)? This cannot be undone.`,
        };

        if (!confirm(confirmMsgs[action])) return;

        setBulkProcessing(true);
        try {
            if (action === 'delete') {
                await Promise.all(selectedIds.map(id => fetch(`/api/posts/${id}`, { method: 'DELETE' })));
            } else {
                const statusMap: Record<string, string> = { publish: 'published', unpublish: 'draft', trash: 'trash' };
                const newStatus = statusMap[action];
                await Promise.all(selectedIds.map(id =>
                    fetch(`/api/posts/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    })
                ));
            }
            setSelectedIds([]);
            router.refresh();
        } catch (err) {
            alert('Bulk action failed. Please try again.');
        } finally {
            setBulkProcessing(false);
        }
    };

    return (
        <>
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl">
                    <span className="text-sm text-accent font-medium">{selectedIds.length} selected</span>
                    <div className="flex items-center gap-2 ml-auto">
                        {currentStatus !== 'trash' && (
                            <>
                                <button
                                    onClick={() => handleBulkAction('publish')}
                                    disabled={bulkProcessing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                >
                                    <Globe className="w-3.5 h-3.5" /> Publish
                                </button>
                                <button
                                    onClick={() => handleBulkAction('unpublish')}
                                    disabled={bulkProcessing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                                >
                                    <Archive className="w-3.5 h-3.5" /> Unpublish
                                </button>
                                <button
                                    onClick={() => handleBulkAction('trash')}
                                    disabled={bulkProcessing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Trash
                                </button>
                            </>
                        )}
                        {currentStatus === 'trash' && (
                            <button
                                onClick={() => handleBulkAction('delete')}
                                disabled={bulkProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Posts Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                <th className="px-4 py-4 w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-white/30 hover:text-accent transition-colors"
                                        title={allSelected ? 'Deselect all' : 'Select all'}
                                    >
                                        {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Post Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Author</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Categories</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Stats</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-white/40">
                                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>No posts found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className={`hover:bg-white/[0.02] transition-colors ${selectedIds.includes(post.id) ? 'bg-accent/5' : ''}`}>
                                        <td className="px-4 py-4">
                                            {!post.isDedicated ? (
                                                <button
                                                    onClick={() => toggleSelect(post.id)}
                                                    className="text-white/30 hover:text-accent transition-colors"
                                                >
                                                    {selectedIds.includes(post.id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4" />}
                                                </button>
                                            ) : (
                                                <span className="text-white/10" title="Dedicated page — no checkbox">
                                                    <Globe className="w-4 h-4" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="truncate max-w-[280px]">
                                                    <div className="font-medium text-white truncate">{post.title}</div>
                                                    <div className="text-xs text-white/30 truncate">/blog/{post.slug}/</div>
                                                </div>
                                                {post.isDedicated && (
                                                    <span className="shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                        Dedicated
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {post.authorModel?.name || post.author || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusBadge(post.status)}`}>
                                                {post.status}
                                            </span>
                                            {post.status === 'scheduled' && post.scheduledAt && (
                                                <div className="text-[10px] text-blue-400/60 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(post.scheduledAt).toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            <div className="flex flex-wrap gap-1">
                                                {(post.categories || []).slice(0, 2).map((cat: string) => (
                                                    <span key={cat} className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-white/50">{cat}</span>
                                                ))}
                                                {(post.categories || []).length > 2 && (
                                                    <span className="text-[10px] text-white/30">+{post.categories.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 text-xs text-white/40">
                                                {post.views > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> {post.views}
                                                    </span>
                                                )}
                                                {post.readingTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {post.readingTime}m
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {formatDateShort(post.publishedAt || post.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {post.status === 'published' && (
                                                    <Link href={`/blog/${post.slug}/`} target="_blank" className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {post.isDedicated ? (
                                                    <button
                                                        onClick={() => handleEditDedicated(post)}
                                                        disabled={creatingDedicated === post.id}
                                                        className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Import to Prisma and edit"
                                                    >
                                                        {creatingDedicated === post.id ? (
                                                            <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                                                        ) : (
                                                            <Edit className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                ) : (
                                                    <Link href={`/admin/posts/${post.id}`} className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                {!post.isDedicated && currentStatus !== 'trash' && (
                                                    <button
                                                        onClick={() => handleDuplicate(post)}
                                                        disabled={duplicating === post.id}
                                                        className="p-2 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Duplicate as draft"
                                                    >
                                                        <Copy className={`w-4 h-4 ${duplicating === post.id ? 'animate-pulse' : ''}`} />
                                                    </button>
                                                )}
                                                {currentStatus === 'trash' && !post.isDedicated && (
                                                    <DeletePostButton postId={post.id} postTitle={post.title} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
