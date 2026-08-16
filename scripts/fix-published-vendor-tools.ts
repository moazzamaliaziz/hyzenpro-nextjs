/**
 * One-time repair: normalize primaryCategory + categoryIds for vendor-submitted tools
 * so published listings resolve to valid /ai-tools-directory/{category}/{slug}/ URLs.
 *
 * Run: npx tsx scripts/fix-published-vendor-tools.ts
 */
import { PrismaClient } from '@prisma/client';
import { DEFAULT_PRIMARY_CATEGORY, normalizePrimaryCategorySlug } from '../lib/tool-paths';
import { syncToolCategoryRelations } from '../lib/tool-publish';

const prisma = new PrismaClient();

async function main() {
    const tools = await prisma.tool.findMany({
        where: {
            OR: [
                { primaryCategory: null },
                { primaryCategory: '' },
                { submittedById: { not: null } },
            ],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            primaryCategory: true,
            categoryIds: true,
        },
    });

    let updated = 0;

    for (const tool of tools) {
        const normalized = normalizePrimaryCategorySlug(tool.primaryCategory);
        const needsFix =
            !tool.primaryCategory ||
            tool.primaryCategory !== normalized ||
            tool.categoryIds.length === 0;

        if (!needsFix) {
            continue;
        }

        await prisma.tool.update({
            where: { id: tool.id },
            data: { primaryCategory: normalized || DEFAULT_PRIMARY_CATEGORY },
        });

        await syncToolCategoryRelations(tool.id, normalized || DEFAULT_PRIMARY_CATEGORY, tool.categoryIds);
        updated += 1;
        console.log(`Fixed: ${tool.name} (${tool.slug}) → ${normalized || DEFAULT_PRIMARY_CATEGORY} [${tool.status}]`);
    }

    console.log(`\nDone. Updated ${updated} of ${tools.length} scanned tools.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
