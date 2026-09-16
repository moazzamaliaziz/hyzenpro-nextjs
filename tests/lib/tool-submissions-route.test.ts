import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
    mediaFindUnique: vi.fn(),
    personaFindMany: vi.fn(),
    toolCreate: vi.fn(),
    createUniqueSlug: vi.fn(),
    syncToolCategoryRelations: vi.fn(),
    consumeRateLimit: vi.fn(),
    verifyTurnstileToken: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        mediaAsset: { findUnique: mocks.mediaFindUnique },
        personaPage: { findMany: mocks.personaFindMany },
        tool: {
            create: mocks.toolCreate,
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
    prisma: {
        mediaAsset: { findUnique: mocks.mediaFindUnique },
        personaPage: { findMany: mocks.personaFindMany },
        tool: { create: mocks.toolCreate },
    },
}));

vi.mock('@/lib/rate-limit', () => ({
    getClientIp: vi.fn(() => '127.0.0.1'),
    consumeRateLimit: mocks.consumeRateLimit,
}));

vi.mock('@/lib/tool-publish', () => ({
    createUniqueSlug: mocks.createUniqueSlug,
    syncToolCategoryRelations: mocks.syncToolCategoryRelations,
}));

vi.mock('@/lib/turnstile', () => ({
    verifyTurnstileToken: mocks.verifyTurnstileToken,
}));

import { POST } from '@/app/api/tool-submissions/route';

const { personaFindMany, toolCreate, createUniqueSlug, syncToolCategoryRelations, consumeRateLimit } = mocks;

function makeRequest(body: unknown) {
    return {
        headers: new Headers(),
        json: async () => body,
    } as unknown as NextRequest;
}

function validBody(overrides: Record<string, unknown> = {}) {
    return {
        name: 'Example Tool',
        tagline: 'A concise tagline for the tool',
        websiteUrl: 'https://example.com',
        description: 'A'.repeat(120),
        category: 'ai-writing-tools',
        audiences: ['Founders & Small Teams'],
        keyFeatures: ['One', 'Two', 'Three'],
        pros: ['Fast'],
        cons: ['Paid plan'],
        pricing: 'Free',
        faqs: [
            { question: 'Is there a free plan?', answer: 'Yes, forever free.' },
            { question: 'Does it integrate?', answer: 'Yes, with 20+ tools.' },
            { question: 'What languages?', answer: 'Over 30 languages.' },
        ],
        screenshots: [],
        submitterName: 'Ada Lovelace',
        submitterEmail: 'ada@example.com',
        submitterRole: 'Founder / maker',
        agreeGuidelines: true,
        ...overrides,
    };
}

async function post(body: unknown) {
    const response = await POST(makeRequest(body));
    const json = await response.json();
    return { response, json };
}

describe('POST /api/tool-submissions server-side validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        consumeRateLimit.mockReturnValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
        createUniqueSlug.mockResolvedValue('example-tool');
        personaFindMany.mockResolvedValue([]);
        toolCreate.mockResolvedValue({ id: 'tool_1' });
        syncToolCategoryRelations.mockResolvedValue([]);
    });

    it('accepts a complete payload and creates a draft tool (201)', async () => {
        const { response, json } = await post(validBody());

        expect(response.status).toBe(201);
        expect(json).toMatchObject({ success: true, id: 'tool_1' });
        expect(toolCreate).toHaveBeenCalledTimes(1);
        expect(syncToolCategoryRelations).toHaveBeenCalledWith('tool_1', 'ai-writing-tools', []);
    });

    it('rejects a description longer than 600 characters (400)', async () => {
        const { response, json } = await post(validBody({ description: 'A'.repeat(601) }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/600/);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects a category outside the allowlist (400)', async () => {
        const { response, json } = await post(validBody({ category: 'not-a-real-category' }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/category/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects an empty audiences list (400)', async () => {
        const { response, json } = await post(validBody({ audiences: [] }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/audience/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects fewer than 3 key features (400)', async () => {
        const { response, json } = await post(validBody({ keyFeatures: ['One', 'Two'] }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/3 standout features/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects an invalid logo URL (400)', async () => {
        const { response, json } = await post(validBody({ logoUrl: 'not-a-url' }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/logo/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects an invalid demo video URL (400)', async () => {
        const { response, json } = await post(validBody({ demoVideo: 'ftp://example.com/demo.mp4' }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/demo video/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects an invalid social URL (400)', async () => {
        const { response, json } = await post(validBody({ socials: { twitter: 'not-a-url' } }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/social/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects more than 6 screenshots (400)', async () => {
        const screenshots = Array.from({ length: 7 }, (_, i) => `https://example.com/shot-${i}.png`);
        const { response, json } = await post(validBody({ screenshots }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/6 screenshots/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects an invalid submitter role (400)', async () => {
        const { response, json } = await post(validBody({ submitterRole: 'Wizard' }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/submitter role/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('rejects a missing required field before any database work (400)', async () => {
        const { response, json } = await post(validBody({ name: '' }));

        expect(response.status).toBe(400);
        expect(json.error).toMatch(/required/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('short-circuits the honeypot without writing to the database (201)', async () => {
        const { response, json } = await post(validBody({ companyWebsite: 'https://spam.example.com' }));

        expect(response.status).toBe(201);
        expect(json.success).toBe(true);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('returns 429 when the rate limiter blocks the request', async () => {
        consumeRateLimit.mockReturnValueOnce({ allowed: false, remaining: 0, retryAfterMs: 60_000 });

        const { response, json } = await post(validBody());

        expect(response.status).toBe(429);
        expect(json.error).toMatch(/too many/i);
        expect(toolCreate).not.toHaveBeenCalled();
    });

    it('returns 400 for a malformed JSON payload', async () => {
        const request = {
            headers: new Headers(),
            json: async () => {
                throw new Error('bad json');
            },
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});