import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-auth';

const LEGACY_AUTHOR_MAP: Record<string, string> = {
    'HyzenPro Team': 'Ali Malik',
    'HyzenPro Editorial': 'Ali Malik',
    'Ariel R.': 'Ali Malik',
};

const ALI_MALIK_AUTHOR_ID = 'ali-malik';

export const POST = withAdminAuth(async () => {
    let fixed = 0;
    let skipped = 0;

    for (const [oldName, newName] of Object.entries(LEGACY_AUTHOR_MAP)) {
        const result = await prisma.post.updateMany({
            where: { author: oldName },
            data: { author: newName },
        });
        fixed += result.count;
    }

    const aliAuthor = await prisma.author.findUnique({ where: { slug: ALI_MALIK_AUTHOR_ID } });
    if (aliAuthor) {
        const unlinked = await prisma.post.updateMany({
            where: { authorId: null, author: { in: Object.values(LEGACY_AUTHOR_MAP) } },
            data: { authorId: aliAuthor.id },
        });
        fixed += unlinked.count;
    }

    const remaining = await prisma.post.findMany({
        where: { author: { in: Object.keys(LEGACY_AUTHOR_MAP) } },
        select: { slug: true, author: true },
    });
    skipped = remaining.length;

    return NextResponse.json({ fixed, skipped, remaining });
});
