import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ToolForm from '@/components/admin/ToolForm';

export const metadata = { title: 'Edit Tool - Admin' };

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let tool;
    try {
        tool = await prisma.tool.findUnique({ where: { id } });
    } catch {
        notFound();
    }

    if (!tool) notFound();

    return <ToolForm initialData={JSON.parse(JSON.stringify(tool))} isEditing />;
}
