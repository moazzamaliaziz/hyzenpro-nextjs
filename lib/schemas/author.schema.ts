import { z } from 'zod';

export const AuthorCreateSchema = z.object({
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
    role: z.string().max(100).optional(),
    bio: z.string().max(2000).optional(),
    image: z.string().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
});

export type AuthorCreateInput = z.infer<typeof AuthorCreateSchema>;
