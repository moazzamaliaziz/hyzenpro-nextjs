import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
    buildDefaultToolSeo,
    buildToolCanonicalPath,
    normalizePrimaryCategorySlug,
    normalizeToolSlug,
} from '@/lib/tool-paths';

export {
    CATEGORY_SLUG_ALIASES,
    DEFAULT_PRIMARY_CATEGORY,
    normalizeToolSlug,
    normalizePrimaryCategorySlug,
    buildToolCanonicalPath,
    buildDefaultToolSeo,
} from '@/lib/tool-paths';

export async function resolveCategoryId(slug: string): Promise<string | null> {
    const normalized = normalizePrimaryCategorySlug(slug);
    const category = await prisma.category.findUnique({
        where: { slug: normalized },
        select: { id: true },
    });
    return category?.id || null;
}

/**
 * Generate a unique slug by appending -2, -3, etc. if the base slug already exists.
 */
export async function createUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = normalizeToolSlug(baseName);
    let slug = baseSlug;
    let attempt = 1;

    while (await prisma.tool.findUnique({ where: { slug } })) {
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
    }

    return slug;
}

export async function syncToolCategoryRelations(toolId: string, primaryCategory: string, extraCategoryIds: string[] = []) {
    const categoryId = await resolveCategoryId(primaryCategory);
    const ids = new Set(extraCategoryIds.filter(Boolean));
    if (categoryId) {
        ids.add(categoryId);
    }

    const categoryIds = Array.from(ids);
    await prisma.tool.update({
        where: { id: toolId },
        data: { categoryIds, primaryCategory: normalizePrimaryCategorySlug(primaryCategory) },
    });

    if (categoryId) {
        const tools = await prisma.tool.findMany({
            where: { categoryIds: { has: categoryId } },
            select: { id: true },
        });
        await prisma.category.update({
            where: { id: categoryId },
            data: {
                toolCount: tools.length,
                toolIds: tools.map((t) => t.id),
            },
        });
    }

    return categoryIds;
}

export type ToolPublishInput = {
    name: string;
    slug: string;
    shortDescription: string;
    longDescription: string;
    websiteUrl: string;
    pricingType: string;
    status: string;
    logo?: string | null;
    featured?: boolean;
    features?: string[];
    pros?: string[];
    cons?: string[];
    primaryCategory?: string | null;
    categoryIds?: string[];
    rating?: number | null;
    meta?: unknown;
    seo?: unknown;
};

export async function prepareToolForSave(input: ToolPublishInput): Promise<ToolPublishInput> {
    const slug = normalizeToolSlug(input.slug || input.name);
    const primaryCategory = normalizePrimaryCategorySlug(input.primaryCategory);
    const categoryId = await resolveCategoryId(primaryCategory);
    const categoryIds = Array.from(
        new Set([...(input.categoryIds || []), ...(categoryId ? [categoryId] : [])])
    );

    let seo = input.seo as Record<string, unknown> | undefined;
    if (!seo || !seo.canonicalUrl) {
        seo = {
            ...buildDefaultToolSeo(input.name, slug, primaryCategory, input.shortDescription),
            ...(seo || {}),
        };
    }

    const meta = (input.meta && typeof input.meta === 'object' ? input.meta : {}) as Record<string, unknown>;
    const logo = input.logo || (typeof meta.displayLogo === 'string' ? meta.displayLogo : null);

    return {
        ...input,
        slug,
        primaryCategory,
        categoryIds,
        logo,
        seo,
        meta: Object.keys(meta).length ? meta : input.meta,
    };
}

export function revalidateToolPaths(primaryCategory: string | null | undefined, slug: string) {
    const path = buildToolCanonicalPath(primaryCategory, slug);
    revalidatePath(path);
    revalidatePath('/ai-tools-directory/');
    revalidatePath(`/ai-tools-directory/${normalizePrimaryCategorySlug(primaryCategory)}/`);
    revalidatePath('/sitemap.xml');
}
