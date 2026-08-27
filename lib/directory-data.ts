import type { Prisma } from '@prisma/client';

/**
 * Only fields required by directory filters, cards, and public collection schema.
 * Keeping this projection explicit prevents long editorial/admin fields from entering
 * the client RSC payload while preserving the underlying Tool records unchanged.
 */
export const directoryToolSelect = {
    id: true,
    name: true,
    slug: true,
    shortDescription: true,
    logo: true,
    pricingType: true,
    rating: true,
    primaryCategory: true,
    views: true,
    featured: true,
    categoryIds: true,
    features: true,
} satisfies Prisma.ToolSelect;

export const directoryCategorySelect = {
    id: true,
    name: true,
    slug: true,
    toolCount: true,
} satisfies Prisma.CategorySelect;

export type DirectoryTool = Prisma.ToolGetPayload<{ select: typeof directoryToolSelect }>;
export type DirectoryCategory = Prisma.CategoryGetPayload<{ select: typeof directoryCategorySelect }>;
