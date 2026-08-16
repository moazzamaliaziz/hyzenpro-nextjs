import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, Trash2, ExternalLink, Plus, Star } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { isAdminSession } from '@/lib/admin';

export const metadata = {
    title: 'Manage Reviews - Admin',
};

async function getReviews() {
    try {
        return await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
        });
    } catch {
        return [];
    }
}

export default async function AdminReviewsPage() {
    const session = await auth();
    if (!isAdminSession(session)) redirect('/admin');

    const reviews = await getReviews();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Reviews</h1>
                    <p className="text-white/40">Manage tool reviews ({reviews.length} total)</p>
                </div>
                <Link
                    href="/admin/reviews/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all"
                >
                    <Plus className="w-4 h-4" /> Write Review
                </Link>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Review Title</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Tool</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review: any) => (
                                    <tr key={review.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white truncate max-w-[250px]">{review.title}</div>
                                            <div className="text-xs text-white/30 truncate max-w-[250px]">/review/{review.slug}/</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {review.toolName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm text-white/80">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${review.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {formatDateShort(review.publishedAt || review.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/review/${review.slug}/`} target="_blank" className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/admin/reviews/${review.id}`} className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
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
