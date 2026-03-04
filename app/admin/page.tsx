import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Users, Box, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Dashboard - Admin',
};

async function getStats() {
    try {
        const [toolsCount, postsCount, categoriesCount, reviewsCount] = await Promise.all([
            prisma.tool.count(),
            prisma.post.count(),
            prisma.category.count(),
            prisma.review.count(),
        ]);
        return { toolsCount, postsCount, categoriesCount, reviewsCount };
    } catch {
        return { toolsCount: 0, postsCount: 0, categoriesCount: 0, reviewsCount: 0 };
    }
}

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/admin/login');
    }

    const stats = await getStats();

    return (
        <div>
            <h1 className="font-heading text-4xl text-white mb-2">Dashboard</h1>
            <p className="text-white/40 mb-8">Welcome back, {session.user.name || session.user.email}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <h2 className="font-heading text-xl text-white mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/tools/new" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors">
                            + Add New Tool
                        </Link>
                        <Link href="/admin/posts/new" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors">
                            + Write Blog Post
                        </Link>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                    <h2 className="font-heading text-xl text-white mb-6">Recent Activity</h2>
                    <p className="text-white/40">No recent activity.</p>
                </div>
            </div>
        </div>
    );
}
