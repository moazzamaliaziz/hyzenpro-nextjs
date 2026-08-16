import { z } from 'zod';

const PainPointSchema = z.object({
    icon: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
});

const WorkflowStepSchema = z.object({
    step: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().optional(),
    tool: z.string().optional(),
});

const StarterKitItemSchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
});

const FaqItemSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
});

export const PersonaPageCreateSchema = z.object({
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
    status: z.enum(['draft', 'published', 'archived']),
    heroTitle: z.string().max(200).optional(),
    heroSubtitle: z.string().max(500).optional(),
    heroImage: z.string().optional(),
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    ogTitle: z.string().max(70).optional(),
    ogDescription: z.string().max(160).optional(),
    ogImage: z.string().optional(),
    focusKeyword: z.string().optional(),
    painPoints: z.array(PainPointSchema).default([]),
    workflowSteps: z.array(WorkflowStepSchema).default([]),
    starterKit: z.array(StarterKitItemSchema).default([]),
    faq: z.array(FaqItemSchema).default([]),
    internalLinks: z.array(z.object({
        label: z.string(),
        url: z.string(),
    })).default([]),
    crossLinks: z.array(z.object({
        label: z.string(),
        slug: z.string(),
    })).default([]),
    ctaText: z.string().optional(),
    ctaUrl: z.string().optional(),
    sortOrder: z.number().int().default(0),
    toolSlugs: z.array(z.string()).default([]),
});

export type PersonaPageCreateInput = z.infer<typeof PersonaPageCreateSchema>;
