import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Trash2, Edit, ExternalLink, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function PersonaPagesListPage() {
    const pages = await prisma.personaPage.findMany({
        include: {
            tools: {
                select: { id: true },
            },
        },
        orderBy: { sortOrder: 'asc' },
    });

    const statusColors = {
        published: 'bg-green-100 text-green-800',
        draft: 'bg-gray-100 text-gray-800',
        scheduled: 'bg-blue-100 text-blue-800',
    } as Record<string, string>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-serif font-bold">Persona Pages</h1>
                <Link
                    href="/admin/persona-pages/new"
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Page
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Slug</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Tools</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Published</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{page.name}</td>
                                <td className="p-4 text-sm text-gray-500 font-mono">{page.slug}</td>
                                <td className="p-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[page.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {page.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{page.tools.length}</td>
                                <td className="p-4 text-sm text-gray-500">
                                    {page.publishedAt
                                        ? new Date(page.publishedAt).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/persona-pages/${page.id}`}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/ai-tools-for/${page.slug}/`}
                                            target="_blank"
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                                            title="View Live"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <form
                                            action={async (formData: FormData) => {
                                                'use server';
                                                const id = formData.get('id') as string;
                                                await prisma.personaPage.delete({ where: { id } });
                                                redirect('/admin/persona-pages');
                                            }}
                                        >
                                            <input type="hidden" name="id" value={page.id} />
                                            <button
                                                type="submit"
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Delete"
                                                onClick={() => confirm('Delete this page?') || false}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No persona pages yet. <Link href="/admin/persona-pages/new" className="text-black underline">Create one</Link>.
                </div>
            )}
        </div>
    );
}