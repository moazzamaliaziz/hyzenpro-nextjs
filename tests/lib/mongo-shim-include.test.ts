import { describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { createModelRepository } from '@/lib/mongo/repository';

type Call = { collection: string; op: string; filter: any; opts: any };

// MongoDB inclusion projection: naming any field returns only those fields
// (plus _id unless excluded). Applying it here is what makes these tests prove
// behaviour rather than just which arguments the shim passed.
function project(doc: any, projection: Record<string, number> | undefined): any {
    if (!projection) return doc;
    const out: any = {};
    if (projection._id !== 0) out._id = doc._id;
    for (const key of Object.keys(projection)) {
        if (key !== '_id' && doc[key] !== undefined) out[key] = doc[key];
    }
    return out;
}

// Minimal Db stand-in: records every query so we can assert how many round
// trips a hydration costs, and honours projections like the real driver.
function fakeDb(data: Record<string, any[]>) {
    const calls: Call[] = [];
    const db = {
        calls,
        collection(name: string) {
            const docs = data[name] ?? [];
            return {
                findOne: async (filter: any, opts: any) => {
                    calls.push({ collection: name, op: 'findOne', filter, opts });
                    return docs[0] ? project(docs[0], opts?.projection) : null;
                },
                find: (filter: any, opts: any) => {
                    calls.push({ collection: name, op: 'find', filter, opts });
                    return { toArray: async () => docs.map((d) => project(d, opts?.projection)) };
                },
                countDocuments: async () => docs.length,
            };
        },
    };
    return db as any;
}

const CATEGORY_ID = '6a2b05b8c161dcd69643f5bf';

function toolDoc(overrides: Record<string, unknown> = {}) {
    return {
        _id: new ObjectId('6a2b07db75855914dca04179'),
        name: 'Claude 4.6 Sonnet',
        slug: 'claude-4-6-sonnet',
        status: 'published',
        pricingType: 'freemium',
        primaryCategory: 'ai-coding-tools',
        categoryIds: [new ObjectId(CATEGORY_ID)],
        ...overrides,
    };
}

function categoryDocs() {
    return [{ _id: new ObjectId(CATEGORY_ID), name: 'AI Coding Tools', slug: 'ai-coding-tools' }];
}

describe('mongo shim: include must not project away scalar fields', () => {
    it('findUnique with include returns every scalar field, like Prisma', async () => {
        const db = fakeDb({ Tool: [toolDoc()], Category: categoryDocs() });
        const tool = await createModelRepository('tool', () => db).findUnique({
            where: { slug: 'claude-4-6-sonnet' },
            include: { categories: true },
        });

        // The regression: these came back undefined, so ToolPageContent's
        // `tool.status !== 'published'` check sent every tool page to notFound().
        expect(tool.status).toBe('published');
        expect(tool.name).toBe('Claude 4.6 Sonnet');
        expect(tool.pricingType).toBe('freemium');
        expect(tool.primaryCategory).toBe('ai-coding-tools');
        expect(tool.categories).toHaveLength(1);
    });

    it('sends no projection to Mongo for an include-only query', async () => {
        const db = fakeDb({ Tool: [toolDoc()], Category: categoryDocs() });
        await createModelRepository('tool', () => db).findUnique({
            where: { slug: 'claude-4-6-sonnet' },
            include: { categories: true },
        });

        const toolQuery = db.calls.find((c: Call) => c.collection === 'Tool');
        expect(toolQuery.opts.projection).toBeUndefined();
    });

    it('still projects for an explicit select', async () => {
        const db = fakeDb({ Tool: [toolDoc()], Category: categoryDocs() });
        await createModelRepository('tool', () => db).findMany({
            select: { id: true, name: true },
        });

        const toolQuery = db.calls.find((c: Call) => c.collection === 'Tool');
        expect(toolQuery.opts.projection).toEqual({ _id: 1, name: 1 });
    });

    it('findMany with include keeps scalars on every row', async () => {
        const db = fakeDb({
            Tool: [toolDoc(), toolDoc({ _id: new ObjectId(), slug: 'other', name: 'Other' })],
            Category: categoryDocs(),
        });
        const tools = await createModelRepository('tool', () => db).findMany({
            include: { categories: { select: { name: true } } },
        });

        expect(tools.map((t: any) => t.name)).toEqual(['Claude 4.6 Sonnet', 'Other']);
        expect(tools.every((t: any) => t.status === 'published')).toBe(true);
    });
});

describe('mongo shim: relation hydration is batched', () => {
    it('hydrates an id-list relation for N rows in a single query', async () => {
        const rows = Array.from({ length: 25 }, (_, i) =>
            toolDoc({ _id: new ObjectId(), slug: `tool-${i}`, name: `Tool ${i}` })
        );
        const db = fakeDb({ Tool: rows, Category: categoryDocs() });

        await createModelRepository('tool', () => db).findMany({
            include: { categories: true },
        });

        // One query for the 25 tools, one for the categories they share —
        // not one category query per tool (the admin list's N+1).
        const categoryQueries = db.calls.filter((c: Call) => c.collection === 'Category');
        expect(categoryQueries).toHaveLength(1);
    });
});
