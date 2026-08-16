import { z } from 'zod';

export const ToolCreateSchema = z.object({
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
    shortDescription: z.string().min(1).max(500),
    longDescription: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    pricingType: z.enum(['free', 'freemium', 'paid', 'enterprise', 'open-source']),
    rating: z.number().min(0).max(10).optional(),
    status: z.enum(['draft', 'published', 'archived']),
    featured: z.boolean().default(false),
    primaryCategory: z.string().optional(),
    categoryIds: z.array(z.string()).default([]),
    features: z.array(z.string()).default([]),
    personaPageIds: z.array(z.string()).default([]),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
});

export type ToolCreateInput = z.infer<typeof ToolCreateSchema>;
