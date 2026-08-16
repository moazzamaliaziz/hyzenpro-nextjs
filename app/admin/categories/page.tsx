import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, Plus } from 'lucide-react';
import { isAdminSession } from '@/lib/admin';

export const metadata = {
    title: 'Manage Categories - Admin',
};

async function getCategories() {
    try {
        return await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    } catch {
        return [];
    }
}

export default async function AdminCategoriesPage() {
    const session = await auth();
    if (!isAdminSession(session)) redirect('/admin');

    const categories = await getCategories();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Categories</h1>
                    <p className="text-white/40">Manage AI tool categories ({categories.length} total)</p>
                </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Slug</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Tools</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Icon</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Preview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat: any) => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{cat.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/40 font-mono">{cat.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-md">
                                                {cat.toolCount} tools
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/40">
                                            {cat.icon || cat.iconClass || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/ai-tools-directory/${cat.slug}/`}
                                                target="_blank"
                                                className="text-xs text-white/30 hover:text-white transition-colors"
                                            >
                                                View →
                                            </Link>
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
