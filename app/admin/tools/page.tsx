import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, ExternalLink, Plus } from 'lucide-react';
import DeleteToolButton from '@/components/admin/DeleteToolButton';

export const metadata = {
    title: 'Manage AI Tools - Admin',
};

async function getTools() {
    try {
        return await prisma.tool.findMany({
            orderBy: { createdAt: 'desc' },
            include: { categories: { select: { name: true } } },
        });
    } catch {
        return [];
    }
}

export default async function AdminToolsPage() {
    const session = await auth();
    if (!session?.user) redirect('/portal-auth');

    const tools = await getTools();

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">AI Tools</h1>
                    <p className="text-white/40">Manage directory listings ({tools.length} total)</p>
                </div>
                <Link
                    href="/admin/tools/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Tool
                </Link>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Tool Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {tools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                                        No tools found.
                                    </td>
                                </tr>
                            ) : (
                                tools.map((tool: any) => (
                                    <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{tool.name}</div>
                                            <div className="text-xs text-white/30 truncate max-w-[200px]">{tool.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${tool.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {tool.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60">
                                            {tool.categories.map((c: any) => c.name).join(', ') || 'None'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/60 capitalize">
                                            {tool.pricingType}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/ai-tools-directory/${tool.primaryCategory}/${tool.slug}/`} target="_blank" className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/admin/tools/${tool.id}`} className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <DeleteToolButton toolId={tool.id} toolName={tool.name} />
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
