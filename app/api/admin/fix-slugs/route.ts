import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-auth';
import { revalidatePath } from 'next/cache';

const SUGGESTED_FIXES: Array<{ oldSlug: string; newSlug: string; category?: string }> = [
    { oldSlug: 'submajic', newSlug: 'submagic', category: 'ai-video-tools' },
];

export const GET = withAdminAuth(async () => {
    const results: Array<{
        oldSlug: string;
        newSlug: string;
        status: 'fixed' | 'skipped' | 'missing';
        reason?: string;
    }> = [];

    for (const fix of SUGGESTED_FIXES) {
        const existing = await prisma.tool.findUnique({
            where: { slug: fix.oldSlug },
            select: { id: true, slug: true, name: true },
        });

        if (!existing) {
            results.push({ oldSlug: fix.oldSlug, newSlug: fix.newSlug, status: 'missing', reason: 'Tool not found in DB' });
            continue;
        }

        const conflict = await prisma.tool.findUnique({
            where: { slug: fix.newSlug },
            select: { slug: true },
        });

        if (conflict) {
            results.push({ oldSlug: fix.oldSlug, newSlug: fix.newSlug, status: 'skipped', reason: 'Target slug already exists' });
            continue;
        }

        await prisma.tool.update({
            where: { id: existing.id },
            data: { slug: fix.newSlug },
        });

        if (fix.category) {
            revalidatePath(`/ai-tools-directory/${fix.category}/${fix.oldSlug}/`);
            revalidatePath(`/ai-tools-directory/${fix.category}/${fix.newSlug}/`);
        }

        results.push({ oldSlug: fix.oldSlug, newSlug: fix.newSlug, status: 'fixed' });
    }

    return NextResponse.json({ results });
});