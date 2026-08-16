import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';

export const metadata = { title: 'Edit Post - Admin' };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!isAdminSession(session)) redirect('/admin');

    const { id } = await params;

    let post;
    try {
        post = await prisma.post.findUnique({ where: { id } });
    } catch (error) {
        console.error('[Admin] Failed to fetch post:', error);
        notFound();
    }

    if (!post) notFound();

    return <PostForm initialData={JSON.parse(JSON.stringify(post))} isEditing />;
}
