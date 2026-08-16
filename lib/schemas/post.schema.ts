import { z } from 'zod';

export const VALID_POST_STATUSES = ['draft', 'published', 'scheduled', 'trash'] as const;

export const PostCreateSchema = z.object({
    title: z.string().min(1).max(300),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(300),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    status: z.enum(VALID_POST_STATUSES).default('draft'),
    author: z.string().max(200).optional(),
    authorId: z.string().optional(),
    postType: z.string().max(50).optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    seo: z.record(z.string(), z.unknown()).optional(),
    scheduledAt: z.string().datetime().optional(),
    readingTime: z.number().int().positive().optional(),
    publishedAt: z.string().datetime().optional(),
    focusKeyword: z.string().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
});

export const PostUpdateSchema = PostCreateSchema.partial().extend({
    allowSlugChange: z.boolean().optional(),
});

export const RevisionCreateSchema = z.object({
    title: z.string().max(300).optional(),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    reason: z.string().max(500).optional(),
    wordCount: z.number().int().positive().optional(),
});

export const AutosaveSchema = z.object({
    title: z.string().max(300).optional(),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    reason: z.string().max(500).optional(),
});

export type PostCreateInput = z.infer<typeof PostCreateSchema>;
export type PostUpdateInput = z.infer<typeof PostUpdateSchema>;
export type RevisionCreateInput = z.infer<typeof RevisionCreateSchema>;
export type AutosaveInput = z.infer<typeof AutosaveSchema>;
