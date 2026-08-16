import { z } from 'zod';

export const VALID_REVIEW_STATUSES = ['draft', 'published', 'archived'] as const;

export const ReviewCreateSchema = z.object({
    toolSlug: z.string().min(1).max(200),
    toolName: z.string().min(1).max(200),
    title: z.string().min(1).max(300),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(300),
    content: z.string().optional(),
    rating: z.number().min(0).max(10).optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    verdict: z.string().optional(),
    author: z.string().optional(),
    status: z.enum(VALID_REVIEW_STATUSES).default('draft'),
    seo: z.record(z.string(), z.unknown()).optional(),
});

export const ReviewUpdateSchema = ReviewCreateSchema.extend({
    publishedAt: z.string().datetime().optional(),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof ReviewUpdateSchema>;
