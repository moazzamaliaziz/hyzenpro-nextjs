import { auth, signOut } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Users, Box, FileText, MessageSquare, TrendingUp, Eye, Star, Clock, LockKeyhole, ShieldAlert, LogOut, Images } from 'lucide-react';
import Link from 'next/link';
import LoginForm from '@/app/portal-auth/LoginForm';
import { isAdminUser } from '@/lib/admin';
import { needsAdminSecuritySetup } from '@/lib/admin-security';
import { normalizeAdSettings } from '@/lib/ads';
import PasswordSettingsClient from './settings/security/PasswordSettingsClient';
import SecuritySettingsClient from './settings/security/SecuritySettingsClient';

export const metadata = {
    title: 'Dashboard - Admin',
};

async function getStats() {
    try {
        const [toolsCount, postsCount, categoriesCount, reviewsCount, mediaCount, adSettings, publishedTools, totalViews, topTools, recentTools, recentPosts] = await Promise.all([
            prisma.tool.count(),
            prisma.post.count(),
            prisma.category.count(),
            prisma.review.count(),
            prisma.mediaAsset.count(),
            prisma.siteContent.findUnique({ where: { sectionId: 'ad-management' }, select: { content: true } }),
            prisma.tool.count({ where: { status: 'published' } }),
            prisma.tool.aggregate({ _sum: { views: true } }),
            prisma.tool.findMany({ orderBy: { views: 'desc' }, take: 5, select: { name: true, slug: true, views: true, primaryCategory: true, rating: true } }),
            prisma.tool.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, slug: true, createdAt: true, status: true } }),
            prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, slug: true, createdAt: true, status: true } }),
        ]);
        const adEnabledCount = Object.values(normalizeAdSettings(adSettings?.content).slots).filter((slot) => slot.enabled && slot.code).length;
        return { toolsCount, postsCount, categoriesCount, reviewsCount, mediaCount, adEnabledCount, publishedTools, totalViews: totalViews._sum.views || 0, topTools, recentTools, recentPosts };
    } catch (error) {
        console.error('[Admin] Failed to fetch dashboard stats:', error);
        return { toolsCount: 0, postsCount: 0, categoriesCount: 0, reviewsCount: 0, mediaCount: 0, adEnabledCount: 0, publishedTools: 0, totalViews: 0, topTools: [], recentTools: [], recentPosts: [] };
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

function AdminLoginScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,242,255,0.14),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_35%)] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-[0.22em] text-white/50 mb-5">
                        <LockKeyhole className="w-3.5 h-3.5" />
                        Secure Admin Access
                    </div>
                    <h1 className="font-heading text-4xl text-white mb-2">HyzenPro Admin</h1>
                    <p className="text-white/40">Sign in to access the protected admin workspace.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

function AdminAccessDenied({ email }: { email?: string | null }) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 md:p-10 text-white">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
                    <ShieldAlert className="w-7 h-7" />
                </div>
                <h1 className="font-heading text-3xl mb-3">Admin Access Required</h1>
                <p className="text-white/55 leading-relaxed mb-4">
                    This panel is restricted to authorized HyzenPro administrators only.
                </p>
                {email && (
                    <p className="text-sm text-white/35 mb-8">
                        Signed in as {email}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Return to Site
                    </Link>
                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/admin' });
                        }}
                        className="flex-1"
                    >
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AdminSecuritySetupScreen({
    email,
    isTwoFactorEnabled,
    mustChangePassword,
}: {
    email?: string | null;
    isTwoFactorEnabled: boolean;
    mustChangePassword: boolean;
}) {
    const completedSteps = Number(!mustChangePassword) + Number(isTwoFactorEnabled);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,242,255,0.14),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_35%)] pointer-events-none" />

            <div className="w-full max-w-5xl relative z-10 space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-5">
                        <LockKeyhole className="w-3.5 h-3.5" />
                        Complete Security Setup
                    </div>
                    <h1 className="font-heading text-4xl text-white mb-2">Secure the admin account before continuing</h1>
                    <p className="text-white/50 max-w-2xl mx-auto">
                        Finish both steps below to unlock the HyzenPro admin workspace. The password change and the
                        authenticator step are enforced on the server, not just in the browser.
                    </p>
                    {email && (
                        <p className="text-sm text-white/35 mt-4">Signed in as {email}</p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className={`rounded-2xl border px-5 py-4 ${mustChangePassword ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
                        <div className="text-xs font-bold uppercase tracking-[0.22em]">Step 1</div>
                        <div className="mt-2 font-semibold">Set a strong password</div>
                    </div>
                    <div className={`rounded-2xl border px-5 py-4 ${isTwoFactorEnabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}>
                        <div className="text-xs font-bold uppercase tracking-[0.22em]">Step 2</div>
                        <div className="mt-2 font-semibold">Enable authenticator-based 2FA</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/55">
                    Progress: {completedSteps}/2 complete. Google Authenticator, Microsoft Authenticator, and Authy all
                    work here, and the setup stays fully free.
                </div>

                <div className="grid xl:grid-cols-2 gap-8">
                    <PasswordSettingsClient requiresChange={mustChangePassword} />
                    <SecuritySettingsClient
                        isTwoFactorEnabled={isTwoFactorEnabled}
                        mandatory
                        description={isTwoFactorEnabled
                            ? 'Authenticator-based 2FA is active. Keep your device safe, because this step is required for every admin sign-in.'
                            : 'Scan the QR code with a free authenticator app and verify the 6-digit code to finish admin protection.'}
                    />
                </div>
            </div>
        </div>
    );
}

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return <AdminLoginScreen />;
    }

    const user = session.user;

    if (!isAdminUser(user)) {
        return <AdminAccessDenied email={user.email} />;
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            email: true,
            role: true,
            isTwoFactorEnabled: true,
            mustChangePassword: true,
        },
    });

    if (!adminUser || adminUser.role !== 'admin') {
        return <AdminAccessDenied email={user.email} />;
    }

    if (needsAdminSecuritySetup(adminUser)) {
        return (
            <AdminSecuritySetupScreen
                email={adminUser.email}
                isTwoFactorEnabled={adminUser.isTwoFactorEnabled}
                mustChangePassword={adminUser.mustChangePassword}
            />
        );
    }

    const stats = await getStats();
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

    return (
        <div>
            <h1 className="font-heading text-4xl text-white mb-2">Dashboard</h1>
            <p className="text-white/40 mb-8">Welcome back, {user.name || user.email}</p>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                {[
                    { label: 'Total Tools', value: stats.toolsCount, icon: Box, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Blog Posts', value: stats.postsCount, icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Categories', value: stats.categoriesCount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'Reviews', value: stats.reviewsCount, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { label: 'Media Assets', value: stats.mediaCount, icon: Images, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
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
                            GA4 {gaId ? '✓' : 'œ—'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${stats.adEnabledCount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            AdSense {adsenseId ? '✓' : 'œ—'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-md font-bold ${adminUser.isTwoFactorEnabled ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            2FA {adminUser.isTwoFactorEnabled ? '✓' : 'œ—'}
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
                        <Link href="/admin/media" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            + Upload Media
                        </Link>
                        <Link href="/admin/ads" className="block px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium">
                            + Manage Ads
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
                                <span className={gaId ? 'text-green-400' : 'text-red-400'}>{gaId ? '✓' : 'œ—'}</span>
                                Google Analytics {gaId ? `(${gaId})` : '— Set NEXT_PUBLIC_GA_ID'}
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                                <span className={adsenseId ? 'text-green-400' : 'text-red-400'}>{adsenseId ? '✓' : 'œ—'}</span>
                                AdSense {adsenseId ? '✓ Active' : '— Set NEXT_PUBLIC_ADSENSE_CLIENT'}
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
