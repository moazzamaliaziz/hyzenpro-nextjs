'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, Tags, FileText, Settings, LogOut, MessageSquare, Home, Menu as MenuIcon, Users, Megaphone, BarChart3, Images, Target, Sparkles, FileText as FileTextIcon } from 'lucide-react';
import { signOutAction } from '@/app/actions/auth';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/homepage', label: 'Homepage', icon: Home },
    { href: '/admin/navigation', label: 'Navigation', icon: MenuIcon },
    { href: '/admin/matchers', label: 'Matchers', icon: Sparkles },
    { href: '/admin/matcher-analytics', label: 'Matcher Analytics', icon: BarChart3 },
    { href: '/admin/tools', label: 'AI Tools', icon: Box },
    { href: '/admin/persona-pages', label: 'Persona Pages', icon: FileTextIcon },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/posts', label: 'Blog Posts', icon: FileText },
    { href: '/admin/media', label: 'Media Library', icon: Images },
    { href: '/admin/ads', label: 'Ad Management', icon: Megaphone },
    { href: '/admin/authors', label: 'Authors', icon: Users },
    { href: '/admin/ctas', label: 'CTAs', icon: Target },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/admin/directory', label: 'Directory SEO', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0 left-0 bg-black/95 backdrop-blur z-50">
            <div className="p-6 border-b border-white/10">
                <Link href="/admin" className="font-heading text-2xl tracking-wider text-white hover:text-accent transition-colors">
                    HyzenPro Admin
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && <span className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <form action={signOutAction}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}