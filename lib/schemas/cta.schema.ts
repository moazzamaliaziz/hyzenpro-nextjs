import { z } from 'zod';

export const CtaUpdateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
    headline: z.string().max(300).optional(),
    description: z.string().max(1000).optional(),
    buttonText: z.string().max(100).optional(),
    buttonUrl: z.string().url().optional().or(z.literal('')),
    style: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
});

export type CtaUpdateInput = z.infer<typeof CtaUpdateSchema>;
