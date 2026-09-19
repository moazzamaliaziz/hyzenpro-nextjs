// Model repository: implements the Prisma model API (findMany, findUnique,
// create, update, ...) on top of a MongoDB collection. Deliberately boring:
// one explicit method per Prisma operation, `any` internally, no engine.

import type { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { PrismaClientKnownRequestError } from '@/lib/prisma-error';
import { getModelMeta, type ModelMeta, type RelationMeta } from './meta';
import {
    translateWhere,
    translateOrderBy,
    translateCreateData,
    translateUpdateData,
    mapDocToPrisma,
} from './translate';

const PRISMA_CLIENT_VERSION = '6.19.3';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function isDuplicateKeyError(err: unknown): boolean {
    return isRecord(err) && (err as { code?: unknown }).code === 11000;
}

function knownError(code: string, message: string) {
    return new PrismaClientKnownRequestError(message, {
        code,
        clientVersion: PRISMA_CLIENT_VERSION,
    });
}

function notFoundError(model: string, where: unknown) {
    return knownError(
        'P2025',
        `[mongo-shim] No ${model} record found for where ${JSON.stringify(where) ?? ''}`
    );
}

function uniqueViolationError(model: string) {
    return knownError(
        'P2002',
        `[mongo-shim] Unique constraint failed on ${model} (duplicate key)`
    );
}

type ShapeInfo = {
    projection: Record<string, 1> | null; // null -> fetch whole documents
    relations: Record<string, Record<string, any>>; // relation name -> nested args
    countRelations: string[] | null;
};

// select/include -> Mongo projection + list of relations to hydrate post-fetch.
function analyzeShape(model: string, select: any, include: any): ShapeInfo {
    const meta = getModelMeta(model);
    const shape = select || include;
    if (!shape) return { projection: null, relations: {}, countRelations: null };

    const projection: Record<string, 1> = {};
    const relations: Record<string, Record<string, any>> = {};
    let countRelations: string[] | null = null;

    for (const [key, value] of Object.entries(shape)) {
        if (value === undefined || value === false || value === null) continue;

        if (key === '_count') {
            if (value === true) {
                countRelations = Object.keys(meta.relations || {});
            } else if (isRecord(value) && isRecord((value as any).select)) {
                countRelations = Object.keys((value as any).select).filter(
                    (k) => (value as any).select[k] === true
                );
            }
            continue;
        }

        const rel = meta.relations?.[key];
        if (rel) {
            relations[key] = value === true ? {} : (value as Record<string, any>);
            // The linkage field must come back from Mongo so we can hydrate.
            const linkField = rel.kind === 'fkList' ? 'id' : rel.field;
            projection[linkField === 'id' ? '_id' : linkField] = 1;
            continue;
        }

        if (value === true) {
            projection[key === 'id' ? '_id' : key] = 1;
        } else {
            throw new Error(
                `[mongo-shim] Nested select on non-relation field ${model}.${key} is not supported.`
            );
        }
    }

    return {
        // Only `select` narrows the document. `include` means "all scalars PLUS
        // these relations" in Prisma, so projecting here would strip every field
        // the caller did not name — which is exactly what it does NOT ask for.
        projection: select && Object.keys(projection).length ? projection : null,
        relations,
        countRelations,
    };
}

// Copy only the selected keys off a hydrated doc (relations already attached).
function applySelect(model: string, mappedDoc: any, select: any): any {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(select || {})) {
        if (value === true || isRecord(value)) {
            out[key] = mappedDoc[key];
        }
    }
    return out;
}

// Map raw docs to the Prisma shape and hydrate their relations for the WHOLE
// batch at once. Hydrating per document is what turned every list query into
// one round trip per row.
async function finalizeMany(
    targetModel: string,
    rawDocs: any[],
    args: Record<string, any> | undefined,
    getDb: () => Db
): Promise<any[]> {
    const mapped = rawDocs.map((raw) => mapDocToPrisma(targetModel, raw));
    if (!mapped.length) return mapped;
    const info = analyzeShape(targetModel, args?.select, args?.include);
    await hydrateDocs(targetModel, mapped, info, getDb);
    return args?.select ? mapped.map((d) => applySelect(targetModel, d, args.select)) : mapped;
}

async function finalizeTarget(targetModel: string, rawDoc: any, args: Record<string, any>, getDb: () => Db): Promise<any> {
    const [only] = await finalizeMany(targetModel, [rawDoc], args, getDb);
    return only;
}

// Fetch related docs for an ObjectId[] linkage field, preserving id-list order
// (Prisma returns id-list relations in array order) unless nested
// where/orderBy/take/skip opts into query-order semantics.
async function fetchIdList(
    targetModel: string,
    ids: string[],
    args: Record<string, any>,
    getDb: () => Db
): Promise<any[]> {
    if (!ids.length) return [];
    const targetMeta = getModelMeta(targetModel);
    const coll = getDb().collection(targetMeta.collection);

    const uniqueIds = Array.from(new Set(ids));
    const filter: Record<string, any> = { _id: { $in: uniqueIds.map((v) => new ObjectId(String(v))) } };
    const nestedWhere = args?.where ? translateWhere(targetModel, args.where) : null;
    if (nestedWhere && Object.keys(nestedWhere).length) {
        Object.assign(filter, nestedWhere);
    }

    const sort = translateOrderBy(args?.orderBy);
    const opts: Record<string, any> = {};
    if (Object.keys(sort).length) opts.sort = sort;
    if (args?.skip) opts.skip = args.skip;
    if (args?.take) opts.limit = args.take;

    const raws = await coll.find(filter, opts).toArray();
    const hasListOps =
        Boolean(nestedWhere && Object.keys(nestedWhere).length) ||
        Object.keys(sort).length > 0 ||
        Boolean(args?.skip) ||
        Boolean(args?.take);

    if (hasListOps) {
        return finalizeMany(targetModel, raws, args, getDb);
    }
    const byId = new Map(raws.map((raw) => [String(raw._id), raw]));
    const ordered = ids.map((id) => byId.get(String(id))).filter((raw) => Boolean(raw));
    return finalizeMany(targetModel, ordered as any[], args, getDb);
}

// A nested relation arg that makes the result depend on the individual parent
// (a per-parent window), so the relation cannot be fetched for all parents at once.
function hasListArgs(args: Record<string, any> | undefined): boolean {
    return Boolean(args?.where || args?.orderBy || args?.take || args?.skip);
}

// One $in query for every parent's related ids, keyed by stringified _id.
async function fetchByIds(
    collection: string,
    ids: string[],
    getDb: () => Db
): Promise<Map<string, any>> {
    const byId = new Map<string, any>();
    if (!ids.length) return byId;
    const raws = await getDb().collection(collection)
        .find({ _id: { $in: ids.map((v) => new ObjectId(String(v))) } })
        .toArray();
    for (const raw of raws) byId.set(String(raw._id), raw);
    return byId;
}

async function hydrateDocs(
    model: string,
    docs: any[],
    info: ShapeInfo,
    getDb: () => Db
): Promise<void> {
    if (!docs.length) return;
    const meta = getModelMeta(model);

    for (const [name, args] of Object.entries(info.relations)) {
        const rel = meta.relations?.[name];
        if (!rel) {
            throw new Error(`[mongo-shim] Unknown relation ${model}.${name} — add it to lib/mongo/meta.ts.`);
        }
        const targetMeta = getModelMeta(rel.model);

        if (rel.kind === 'belongsTo') {
            const fkValues = Array.from(
                new Set(docs.map((d) => d[rel.field]).filter((v) => v !== null && v !== undefined))
            ).map((v) => new ObjectId(String(v)));
            const byId = new Map<string, any>();
            if (fkValues.length) {
                const raws = await getDb().collection(targetMeta.collection)
                    .find({ _id: { $in: fkValues } })
                    .toArray();
                for (const raw of raws) byId.set(String(raw._id), raw);
            }
            for (const d of docs) {
                const fk = d[rel.field];
                const raw = fk === null || fk === undefined ? null : byId.get(String(fk)) ?? null;
                d[name] = raw ? await finalizeTarget(rel.model, raw, args, getDb) : null;
            }
        } else if (rel.kind === 'idList') {
            if (hasListArgs(args)) {
                // Per-parent where/orderBy/take/skip: one query each, since the
                // window is defined relative to a single parent's id list.
                for (const d of docs) {
                    const ids: string[] = Array.isArray(d[rel.field]) ? d[rel.field] : [];
                    d[name] = await fetchIdList(rel.model, ids, args, getDb);
                }
            } else {
                const allIds = Array.from(
                    new Set(
                        docs
                            .flatMap((d) => (Array.isArray(d[rel.field]) ? d[rel.field] : []))
                            .map((v) => String(v))
                    )
                );
                const byId = await fetchByIds(targetMeta.collection, allIds, getDb);
                const uniqueRaws = Array.from(byId.values());
                const finalized = await finalizeMany(rel.model, uniqueRaws, args, getDb);
                // ponytail: parents sharing a related row share one object rather
                // than each getting a copy — these results are rendered, not mutated.
                const resultById = new Map(
                    uniqueRaws.map((raw, i) => [String(raw._id), finalized[i]])
                );
                for (const d of docs) {
                    const ids: string[] = Array.isArray(d[rel.field]) ? d[rel.field] : [];
                    // Prisma returns id-list relations in the id array's order.
                    d[name] = ids
                        .map((id) => resultById.get(String(id)))
                        .filter((row) => Boolean(row));
                }
            }
        } else {
            // fkList: the target holds the fk pointing back at us.
            if (hasListArgs(args)) {
                for (const d of docs) {
                    const filter: Record<string, any> = { [rel.field]: new ObjectId(String(d.id)) };
                    const nestedWhere = args?.where ? translateWhere(rel.model, args.where) : null;
                    if (nestedWhere && Object.keys(nestedWhere).length) Object.assign(filter, nestedWhere);
                    const sort = translateOrderBy(args?.orderBy);
                    const opts: Record<string, any> = {};
                    if (Object.keys(sort).length) opts.sort = sort;
                    if (args?.skip) opts.skip = args.skip;
                    if (args?.take) opts.limit = args.take;
                    const raws = await getDb().collection(targetMeta.collection).find(filter, opts).toArray();
                    d[name] = await Promise.all(raws.map((raw) => finalizeTarget(rel.model, raw, args, getDb)));
                }
            } else {
                const parentIds = docs
                    .map((d) => d.id)
                    .filter((id) => id !== null && id !== undefined)
                    .map((id) => new ObjectId(String(id)));
                const raws = parentIds.length
                    ? await getDb().collection(targetMeta.collection)
                        .find({ [rel.field]: { $in: parentIds } })
                        .toArray()
                    : [];
                const finalized = await finalizeMany(rel.model, raws, args, getDb);
                const byParent = new Map<string, any[]>();
                raws.forEach((raw, i) => {
                    const key = String(raw[rel.field]);
                    const bucket = byParent.get(key);
                    if (bucket) bucket.push(finalized[i]);
                    else byParent.set(key, [finalized[i]]);
                });
                for (const d of docs) {
                    d[name] = byParent.get(String(d.id)) ?? [];
                }
            }
        }
    }

    if (info.countRelations) {
        for (const d of docs) {
            const counts: Record<string, number> = {};
            for (const relName of info.countRelations) {
                const rel = meta.relations?.[relName];
                if (!rel) continue;
                counts[relName] = await countRelation(model, rel, d, getDb);
            }
            d._count = counts;
        }
    }
}

async function countRelation(model: string, rel: RelationMeta, doc: any, getDb: () => Db): Promise<number> {
    const targetMeta = getModelMeta(rel.model);
    if (rel.kind === 'fkList') {
        return getDb().collection(targetMeta.collection).countDocuments({
            [rel.field]: new ObjectId(String(doc.id)),
        });
    }
    if (rel.kind === 'idList') {
        return Array.isArray(doc[rel.field]) ? doc[rel.field].length : 0;
    }
    return doc[rel.field] === null || doc[rel.field] === undefined ? 0 : 1;
}

export function createModelRepository(model: string, getDb: () => Db): any {
    const meta: ModelMeta = getModelMeta(model);
    const coll = () => getDb().collection(meta.collection);

    // Map a raw Mongo doc to the Prisma shape, then apply select/include.
    async function finalize(rawDoc: any, select: any, include: any): Promise<any> {
        const [only] = await finalizeMany(model, [rawDoc], { select, include }, getDb);
        return only;
    }

    function findOptions(args: any, info: ShapeInfo): Record<string, any> {
        const opts: Record<string, any> = {};
        const sort = translateOrderBy(args?.orderBy);
        if (Object.keys(sort).length) opts.sort = sort;
        if (args?.skip) opts.skip = args.skip;
        if (args?.take !== undefined && args?.take !== null) opts.limit = args.take;
        if (info.projection) opts.projection = info.projection;
        return opts;
    }

    return {
        async findUnique(args: any = {}) {
            const info = analyzeShape(model, args.select, args.include);
            const raw = await coll().findOne(translateWhere(model, args.where), findOptions(args, info));
            if (!raw) return null;
            return finalize(raw, args.select, args.include);
        },

        async findFirst(args: any = {}) {
            const info = analyzeShape(model, args.select, args.include);
            const raw = await coll().findOne(translateWhere(model, args.where), findOptions(args, info));
            if (!raw) return null;
            return finalize(raw, args.select, args.include);
        },

        async findMany(args: any = {}) {
            if (args.cursor) {
                throw new Error('[mongo-shim] cursor pagination is not implemented (not used in the codebase).');
            }
            const info = analyzeShape(model, args.select, args.include);
            const raws = await coll()
                .find(translateWhere(model, args.where), findOptions(args, info))
                .toArray();
            return finalizeMany(model, raws, args, getDb);
        },

        async count(args: any = {}) {
            return coll().countDocuments(translateWhere(model, args.where));
        },

        async create(args: any = {}) {
            const doc = translateCreateData(model, args.data);
            try {
                await coll().insertOne(doc);
            } catch (err) {
                if (isDuplicateKeyError(err)) throw uniqueViolationError(model);
                throw err;
            }
            // insertOne() mutates doc with the generated _id; doc is the exact stored document.
            return finalize(doc, args.select, args.include);
        },

        async update(args: any = {}) {
            const filter = translateWhere(model, args.where);
            const update = translateUpdateData(model, args.data);
            let raw: any;
            if (update) {
                raw = await coll().findOneAndUpdate(filter, update, {
                    returnDocument: 'after',
                    includeResultMetadata: false,
                });
            } else {
                // No-op update (Prisma semantics: return the row unchanged).
                raw = await coll().findOne(filter);
            }
            if (!raw) throw notFoundError(model, args.where);
            return finalize(raw, args.select, args.include);
        },

        async updateMany(args: any = {}) {
            const filter = translateWhere(model, args.where);
            const update = translateUpdateData(model, args.data);
            if (!update) {
                return { count: await coll().countDocuments(filter) };
            }
            const result = await coll().updateMany(filter, update);
            return { count: result.matchedCount };
        },

        async delete(args: any = {}) {
            const raw = await coll().findOneAndDelete(translateWhere(model, args.where), {
                includeResultMetadata: false,
            });
            if (!raw) throw notFoundError(model, args.where);
            return finalize(raw, args.select, args.include);
        },

        async deleteMany(args: any = {}) {
            const result = await coll().deleteMany(translateWhere(model, args.where));
            return { count: result.deletedCount };
        },

        async upsert(args: any = {}) {
            const filter = translateWhere(model, args.where);
            const update = translateUpdateData(model, args.update ?? args.data);

            let raw: any = update
                ? await coll().findOneAndUpdate(filter, update, {
                      returnDocument: 'after',
                      includeResultMetadata: false,
                  })
                : await coll().findOne(filter);

            if (!raw) {
                const insertDoc = translateCreateData(model, args.create);
                try {
                    const inserted = await coll().insertOne(insertDoc);
                    raw = { ...insertDoc, _id: inserted.insertedId };
                } catch (err) {
                    if (isDuplicateKeyError(err)) {
                        // Unique-index race: someone else created the row — retry the update once.
                        raw = update
                            ? await coll().findOneAndUpdate(filter, update, {
                                  returnDocument: 'after',
                                  includeResultMetadata: false,
                              })
                            : await coll().findOne(filter);
                    } else {
                        throw err;
                    }
                    if (!raw) throw uniqueViolationError(model);
                }
            }
            return finalize(raw, args.select, args.include);
        },

        // The codebase only uses tool.aggregate({ _sum: { views: true } }).
        // _count/_min/_max/_avg are implemented generically; anything fancier
        // (groupBy, by:) is not.
        async aggregate(args: any = {}) {
            const filter = translateWhere(model, args.where);
            const group: Record<string, any> = { _id: null };
            const accumulators: Array<[string, string]> = [
                ['_sum', '$sum'],
                ['_min', '$min'],
                ['_max', '$max'],
                ['_avg', '$avg'],
            ];
            for (const [acc, op] of accumulators) {
                const fields = args[acc];
                if (!fields) continue;
                for (const [field, enabled] of Object.entries(fields)) {
                    if (enabled === true) group[`${acc}_${field}`] = { [op]: `$${field}` };
                }
            }
            const countFields: string[] = [];
            if (args._count) {
                if (args._count === true) {
                    countFields.push('_all');
                    group['_count__all'] = { $sum: 1 };
                } else {
                    for (const [field, enabled] of Object.entries(args._count)) {
                        if (enabled === true) {
                            countFields.push(field);
                            group[`_count_${field}`] = { $sum: 1 };
                        }
                    }
                }
            }

            const pipeline: any[] = [];
            if (Object.keys(filter).length) pipeline.push({ $match: filter });
            pipeline.push({ $group: group });

            const rows = await coll().aggregate(pipeline).toArray();
            const row = rows[0] || {};

            const out: Record<string, any> = {};
            for (const [acc] of accumulators) {
                const fields = args[acc];
                if (!fields) continue;
                out[acc] = {};
                for (const field of Object.keys(fields)) {
                    const value = row[`${acc}_${field}`];
                    out[acc][field] = value === undefined ? null : value;
                }
            }
            if (args._count) {
                out._count = {};
                for (const field of countFields) {
                    const value = row[`_count_${field}`];
                    out._count[field] = value === undefined ? 0 : value;
                }
            }
            return out;
        },
    };
}
