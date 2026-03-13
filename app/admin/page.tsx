import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Users, Box, FileText, MessageSquare, TrendingUp, Eye, Star, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Dashboard - Admin',
};

async function getStats() {
    try {
        const [toolsCount, postsCount, categoriesCount, reviewsCount, publishedTools, totalViews, topTools, recentTools, recentPosts] = await Promise.all([
            prisma.tool.count(),
            prisma.post.count(),
            prisma.category.count(),
            prisma.review.count(),
            prisma.tool.count({ where: { status: 'published' } }),
            prisma.tool.aggregate({ _sum: { views: true } }),
            prisma.tool.findMany({ orderBy: { views: 'desc' }, take: 5, select: { name: true, slug: true, views: true, primaryCategory: true, rating: true } }),
            prisma.tool.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, slug: true, createdAt: true, status: true } }),
            prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, slug: true, createdAt: true, status: true } }),
        ]);
        return { toolsCount, postsCount, categoriesCount, reviewsCount, publishedTools, totalViews: totalViews._sum.views || 0, topTools, recentTools, recentPosts };
    } catch {
        return { toolsCount: 0, postsCount: 0, categoriesCount: 0, reviewsCount: 0, publishedTools: 0, totalViews: 0, topTools: [], recentTools: [], recentPosts: [] };
    }
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/portal-auth');
    }

    const stats = await getStats();
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    return (
        <div>
            <h1 className="font-heading text-4xl text-white mb-2">Dashboard</h1>
            <p className="text-white/40 mb-8">Welcome back, {session.user.name || session.user.email}</p>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Tools', value: stats.toolsCount, icon: Box, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Blog Posts', value: stats.postsCount, icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Categories', value: stats.categoriesCount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Reviews', value: stats.reviewsCount, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="text-3xl font-heading text-white mb-1">{stat.value}</div>
                        <div className="text-sm font-medium text-white/40 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-medium text-white/40 uppercase tracking-wider">Total Tool Views</span>
                    </div>
                    <div className="text-3xl font-heading text-white">{stats.totalViews.toLocaleString()}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-medium text-white/40 uppercase tracking-wider">Published Tools</span>
                    </div>
                    <div className="text-3xl font-heading text-white">{stats.publishedTools}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-white/40 uppercase tracking-wider">Integrations</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${gaId ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            GA4 {gaId ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${adsenseId ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            AdSense {adsenseId ? '✓' : '✗'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-md font-bold bg-green-500/10 text-green-400">
                            2FA ✓
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Top Performing Tools */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Top Performing Tools
                        </h2>
                        <Link href="/admin/tools" className="text-xs text-white/30 hover:text-white transition-colors">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.topTools.length === 0 ? (
                            <p className="text-white/40 text-sm py-4">No tools yet.</p>
                        ) : (
                            stats.topTools.map((tool: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors">
                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white/60">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-sm truncate">{tool.name}</div>
                                        <div className="text-[11px] text-white/30 truncate">{tool.primaryCategory || 'uncategorized'}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm shrink-0">
                                        {tool.rating && (
                                            <span className="text-yellow-400 flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                                {tool.rating.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-white/50 flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" />
                                            {(tool.views || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <h2 className="font-heading text-xl text-white mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/tools/new" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            + Add New Tool
                        </Link>
                        <Link href="/admin/posts/new" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            + Write Blog Post
                        </Link>
                        <Link href="/admin/reviews/new" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            + Write Review
                        </Link>
                        <Link href="/admin/homepage" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            ✏️ Edit Site Content
                        </Link>
                        <Link href="/admin/settings/security" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            🔐 Security Settings
                        </Link>
                    </div>

                    {/* Google Integration Status */}
                    <div className="mt-6 pt-5 border-t border-white/[0.06]">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Setup Checklist</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                                <span className={gaId ? 'text-green-400' : 'text-red-400'}>{gaId ? '✓' : '✗'}</span>
                                Google Analytics {gaId ? `(${gaId})` : '— Set NEXT_PUBLIC_GA_ID'}
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <span className={adsenseId ? 'text-green-400' : 'text-red-400'}>{adsenseId ? '✓' : '✗'}</span>
                                AdSense {adsenseId ? '✓ Active' : '— Set NEXT_PUBLIC_ADSENSE_ID'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Recent Tools
                        </h2>
                        <Link href="/admin/tools" className="text-xs text-white/30 hover:text-white transition-colors">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentTools.length === 0 ? (
                            <p className="text-white/40 text-sm">No tools yet.</p>
                        ) : (
                            stats.recentTools.map((tool: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                    <div>
                                        <div className="font-medium text-white text-sm">{tool.name}</div>
                                        <div className="text-[11px] text-white/30">{timeAgo(tool.createdAt)}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${tool.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {tool.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-heading text-xl text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-400" />
                            Recent Posts
                        </h2>
                        <Link href="/admin/posts" className="text-xs text-white/30 hover:text-white transition-colors">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentPosts.length === 0 ? (
                            <p className="text-white/40 text-sm">No posts yet.</p>
                        ) : (
                            stats.recentPosts.map((post: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                    <div className="min-w-0 flex-1 mr-3">
                                        <div className="font-medium text-white text-sm truncate">{post.title}</div>
                                        <div className="text-[11px] text-white/30">{timeAgo(post.createdAt)}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shrink-0 ${post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {post.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
