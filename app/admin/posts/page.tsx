import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, ExternalLink, Plus, Search, Clock, Eye, FileText } from 'lucide-react';
import DeletePostButton from '@/components/admin/DeletePostButton';
import { formatDateShort } from '@/lib/utils';

export const metadata = {
    title: 'Manage Blog Posts - Admin',
};

async function getPosts(status?: string, search?: string) {
    try {
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        } else {
            where.status = { not: 'trash' };
        }

        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        return await prisma.post.findMany({
            where,
            include: {
                authorModel: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    } catch {
        return [];
    }
}

async function getPostCounts() {
    try {
        const [all, published, draft, scheduled, trash] = await Promise.all([
            prisma.post.count({ where: { status: { not: 'trash' } } }),
            prisma.post.count({ where: { status: 'published' } }),
            prisma.post.count({ where: { status: 'draft' } }),
            prisma.post.count({ where: { status: 'scheduled' } }),
            prisma.post.count({ where: { status: 'trash' } }),
        ]);
        return { all, published, draft, scheduled, trash };
    } catch {
        return { all: 0, published: 0, draft: 0, scheduled: 0, trash: 0 };
    }
}

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string }>;
}) {
    const session = await auth();
    if (!session?.user) redirect('/portal-auth');

    const params = await searchParams;
    const currentStatus = params.status || 'all';
    const searchQuery = params.search || '';

    const [posts, counts] = await Promise.all([
        getPosts(currentStatus, searchQuery),
        getPostCounts(),
    ]);

    const statusTabs = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'published', label: 'Published', count: counts.published },
        { key: 'draft', label: 'Drafts', count: counts.draft },
        { key: 'scheduled', label: 'Scheduled', count: counts.scheduled },
        { key: 'trash', label: 'Trash', count: counts.trash },
    ];

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: 'bg-green-500/10 text-green-400 border-green-500/20',
            draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            trash: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return styles[status] || styles.draft;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Blog Posts</h1>
                    <p className="text-white/40">Manage articles, reviews, and tutorials ({counts.all} total)</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all"
                >
                    <Plus className="w-4 h-4" /> Write Post
                </Link>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 mb-4 border-b border-white/[0.06] pb-3">
                {statusTabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`/admin/posts?status=${tab.key}${searchQuery ? `&search=${searchQuery}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentStatus === tab.key
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-[11px] opacity-60">({tab.count})</span>
                    </Link>
                ))}
            </div>

            {/* Search Bar */}
            <form className="mb-6">
                <input type="hidden" name="status" value={currentStatus} />
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Search posts by title..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                </div>
            </form>

            {/* Posts Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                                        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>No posts found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post: any) => (
                                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white truncate max-w-[280px]">{post.title}</div>
                                            <div className="text-xs text-white/30 truncate max-w-[280px]">/blog/{post.slug}/</div>
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
                                                <Link href={`/admin/posts/${post.id}`} className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                {currentStatus === 'trash' && (
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
        </div>
    );
}
