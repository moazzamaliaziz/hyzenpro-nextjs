import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReviewForm from '@/components/admin/ReviewForm';

export const metadata = { title: 'Edit Review - Admin' };

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let review;
    try {
        review = await prisma.review.findUnique({ where: { id } });
    } catch {
        notFound();
    }

    if (!review) notFound();

    return <ReviewForm initialData={JSON.parse(JSON.stringify(review))} isEditing />;
}
