import Link from 'next/link';
import { LayoutDashboard, Box, Tags, FileText, Settings, LogOut, MessageSquare } from 'lucide-react';
import { signOut } from '@/lib/auth';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/tools', label: 'AI Tools', icon: Box },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/posts', label: 'Blog Posts', icon: FileText },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0 left-0 bg-black/95 backdrop-blur z-50">
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="font-heading text-2xl tracking-wider text-white hover:text-accent transition-colors">
                        HyzenPro Admin
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/admin/login' });
                        }}
                    >
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

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen bg-black">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
