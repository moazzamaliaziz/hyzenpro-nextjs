import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';

export const metadata = { title: 'Edit Post - Admin' };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let post;
    try {
        post = await prisma.post.findUnique({ where: { id } });
    } catch {
        notFound();
    }

    if (!post) notFound();

    return <PostForm initialData={JSON.parse(JSON.stringify(post))} isEditing />;
}
