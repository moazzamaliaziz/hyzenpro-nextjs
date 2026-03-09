import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, Trash2, ExternalLink, Plus } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

export const metadata = {
    title: 'Manage Blog Posts - Admin',
};

async function getPosts() {
    try {
        return await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch {
        return [];
    }
}

export default async function AdminPostsPage() {
    const session = await auth();
    if (!session?.user) redirect('/portal-auth');

    const posts = await getPosts();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Blog Posts</h1>
                    <p className="text-white/40">Manage reviews, tutorials, and articles ({posts.length} total)</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all"
                >
                    <Plus className="w-4 h-4" /> Write Post
                </Link>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Post Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Categories</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                                        No posts found.
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post: any) => (
                                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white truncate max-w-[300px]">{post.title}</div>
                                            <div className="text-xs text-white/30 truncate max-w-[300px]">/{post.slug}/</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {post.categories.join(', ') || 'None'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {formatDateShort(post.publishedAt || post.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/${post.slug}/`} target="_blank" className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/admin/posts/${post.id}`} className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
