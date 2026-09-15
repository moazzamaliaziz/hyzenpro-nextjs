// Pure Prisma-query -> MongoDB translation helpers.
// No imports of Next.js or the client: everything here is a plain function so
// scripts/shim-selftest.mjs can exercise it directly.
// ponytail: exported for selftest

import { ObjectId } from 'mongodb';
import { getModelMeta } from './meta';

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

export function isObjectIdString(value: unknown): value is string {
    return typeof value === 'string' && OBJECT_ID_RE.test(value);
}

function asObjectId(value: unknown): unknown {
    return isObjectIdString(value) ? new ObjectId(value) : value;
}

export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

// Like isRecord, but only PLAIN objects: class instances (ObjectId, Buffer,
// Map, ...) must be treated as leaves or copies would lose their prototype.
function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (!isRecord(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

const FIELD_OPERATORS = new Set([
    'equals', 'eq', 'in', 'notIn', 'not', 'has', 'hasSome', 'hasEvery',
    'contains', 'startsWith', 'endsWith', 'mode', 'gt', 'gte', 'lt', 'lte',
    'every', 'some', 'none',
]);

function isOperatorObject(value: unknown): value is Record<string, unknown> {
    return isRecord(value) && Object.keys(value).some((k) => FIELD_OPERATORS.has(k));
}

// Prisma field name -> Mongo field name. The only @map in the schema is id -> _id.
function fieldKey(field: string): string {
    return field === 'id' ? '_id' : field;
}

function isObjectIdField(model: string, field: string): boolean {
    if (field === 'id') return true;
    return Boolean(getModelMeta(model).objectIdFields?.includes(field));
}

function isObjectIdArrayField(model: string, field: string): boolean {
    return Boolean(getModelMeta(model).objectIdArrayFields?.includes(field));
}

// Convert a scalar where-value / write-value for the given Prisma field.
function convertScalar(model: string, field: string, value: unknown): unknown {
    if (isObjectIdField(model, field)) {
        return asObjectId(value);
    }
    return value;
}

function convertListValue(model: string, field: string, value: unknown): unknown {
    if (isObjectIdArrayField(model, field)) {
        return asObjectId(value);
    }
    return value;
}

// Deep-drop undefined properties (Prisma drops them; the BSON serializer would
// otherwise persist them as nulls inside Json/embedded objects).
// ponytail: exported for selftest
export function stripUndefined<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => stripUndefined(item)) as unknown as T;
    }
    if (isPlainObject(value)) {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            if (v !== undefined) out[k] = stripUndefined(v);
        }
        return out as T;
    }
    return value;
}

// ── where ───────────────────────────────────────────────────────────────────

// ponytail: exported for selftest
export function translateWhere(model: string, where: any): Record<string, any> {
    if (!where) return {};
    const meta = getModelMeta(model);
    const out: Record<string, any> = {};

    for (const [key, rawValue] of Object.entries(where)) {
        if (rawValue === undefined) continue;

        if (key === 'OR') {
            out.$or = (rawValue as any[]).map((w) => translateWhere(model, w));
            continue;
        }
        if (key === 'AND') {
            out.$and = (rawValue as any[]).map((w) => translateWhere(model, w));
            continue;
        }
        if (key === 'NOT') {
            out.$nor = [translateWhere(model, rawValue)];
            continue;
        }

        // Compound unique inputs, e.g. toolTranslation { toolId_locale: { toolId, locale } }
        const compound = meta.compoundUnique?.[key];
        if (compound) {
            for (const [f, v] of Object.entries(rawValue as Record<string, unknown>)) {
                if (v === undefined) continue;
                out[fieldKey(f)] = convertScalar(model, f, v);
            }
            continue;
        }

        const fk = fieldKey(key);

        if (isOperatorObject(rawValue)) {
            const ops = rawValue;
            const insensitive = ops.mode === 'insensitive';

            if (ops.equals !== undefined) {
                out[fk] = convertScalar(model, key, ops.equals);
            } else if (ops.in !== undefined) {
                out[fk] = { $in: (ops.in as unknown[]).map((v) => convertScalar(model, key, v)) };
            } else if (ops.notIn !== undefined) {
                out[fk] = { $nin: (ops.notIn as unknown[]).map((v) => convertScalar(model, key, v)) };
            } else if (ops.not !== undefined) {
                out[fk] = { $ne: convertScalar(model, key, ops.not) };
            } else if (ops.has !== undefined) {
                // Array equality semantics: { field: value } matches when the array contains it.
                out[fk] = convertListValue(model, key, ops.has);
            } else if (ops.hasSome !== undefined) {
                out[fk] = { $in: (ops.hasSome as unknown[]).map((v) => convertListValue(model, key, v)) };
            } else if (ops.hasEvery !== undefined) {
                out[fk] = { $all: (ops.hasEvery as unknown[]).map((v) => convertListValue(model, key, v)) };
            } else if (ops.contains !== undefined) {
                out[fk] = {
                    $regex: escapeRegex(String(ops.contains)),
                    ...(insensitive ? { $options: 'i' } : {}),
                };
            } else if (ops.startsWith !== undefined) {
                out[fk] = {
                    $regex: '^' + escapeRegex(String(ops.startsWith)),
                    ...(insensitive ? { $options: 'i' } : {}),
                };
            } else if (ops.endsWith !== undefined) {
                out[fk] = {
                    $regex: escapeRegex(String(ops.endsWith)) + '$',
                    ...(insensitive ? { $options: 'i' } : {}),
                };
            } else if (ops.gt !== undefined) {
                out[fk] = { $gt: ops.gt };
            } else if (ops.gte !== undefined) {
                out[fk] = { $gte: ops.gte };
            } else if (ops.lt !== undefined) {
                out[fk] = { $lt: ops.lt };
            } else if (ops.lte !== undefined) {
                out[fk] = { $lte: ops.lte };
            } else if (ops.every !== undefined || ops.some !== undefined || ops.none !== undefined) {
                throw new Error(
                    `[mongo-shim] every/some/none list filters are not implemented (${model}.${key}). ` +
                    'The codebase does not use them; extend translateWhere if that changes.'
                );
            }
            continue;
        }

        // Plain equality (null matches null/missing, like Prisma).
        out[fk] = convertScalar(model, key, rawValue);
    }

    return out;
}

// ── orderBy ─────────────────────────────────────────────────────────────────

// ponytail: exported for selftest
export function translateOrderBy(orderBy: any): Record<string, 1 | -1> {
    const sort: Record<string, 1 | -1> = {};
    if (!orderBy) return sort;
    const list = Array.isArray(orderBy) ? orderBy : [orderBy];
    for (const clause of list) {
        if (!clause) continue;
        for (const [field, direction] of Object.entries(clause)) {
            if (direction === undefined) continue;
            sort[fieldKey(field)] = direction === 'asc' ? 1 : -1;
        }
    }
    return sort;
}

// ── create data ─────────────────────────────────────────────────────────────

// ponytail: exported for selftest
export function translateCreateData(model: string, data: any): Record<string, any> {
    const meta = getModelMeta(model);
    const doc: Record<string, any> = {};

    for (const [key, value] of Object.entries(data || {})) {
        if (value === undefined) continue;
        if (key === 'id') {
            if (value !== null) doc._id = asObjectId(value);
            continue;
        }
        if (meta.objectIdArrayFields?.includes(key)) {
            doc[key] = (Array.isArray(value) ? value : []).map((v) => asObjectId(v));
            continue;
        }
        if (meta.objectIdFields?.includes(key)) {
            doc[key] = asObjectId(value);
            continue;
        }
        doc[key] = value;
    }

    // @default(...) values for fields the caller omitted.
    for (const [field, value] of Object.entries(meta.defaults || {})) {
        if (doc[field] === undefined) doc[field] = value;
    }
    // Required lists default to [] like Prisma's implicit empty-list default.
    for (const field of meta.objectIdArrayFields || []) {
        if (doc[field] === undefined) doc[field] = [];
    }
    for (const field of meta.stringArrayFields || []) {
        if (doc[field] === undefined) doc[field] = [];
    }
    if (meta.hasCreatedAt && doc.createdAt === undefined) doc.createdAt = new Date();
    if (meta.hasUpdatedAt && doc.updatedAt === undefined) doc.updatedAt = new Date();

    return stripUndefined(doc);
}

// ── update data ─────────────────────────────────────────────────────────────

const UPDATE_OPERATORS = new Set(['increment', 'decrement', 'multiply', 'divide', 'push', 'pop', 'set']);

function isUpdateOperatorObject(value: unknown): value is Record<string, unknown> {
    return isRecord(value) && Object.keys(value).some((k) => UPDATE_OPERATORS.has(k));
}

// Returns the MongoDB update document, or null when the update is a no-op
// (Prisma semantics: update: {} changes nothing but still returns the row).
// ponytail: exported for selftest
export function translateUpdateData(model: string, data: any): Record<string, any> | null {
    const meta = getModelMeta(model);
    const $set: Record<string, any> = {};
    const $inc: Record<string, any> = {};
    const $push: Record<string, any> = {};
    let touched = false;

    for (const [key, value] of Object.entries(data || {})) {
        if (value === undefined) continue;
        touched = true;
        const fk = fieldKey(key);

        if (isUpdateOperatorObject(value)) {
            if (value.increment !== undefined) {
                $inc[fk] = value.increment;
            } else if (value.decrement !== undefined) {
                $inc[fk] = -(value.decrement as number);
            } else if (value.push !== undefined) {
                const items = Array.isArray(value.push) ? value.push : [value.push];
                $push[fk] =
                    items.length === 1
                        ? convertListValue(model, key, items[0])
                        : items.map((v) => convertListValue(model, key, v));
            } else if (value.set !== undefined) {
                $set[fk] = meta.objectIdArrayFields?.includes(key)
                    ? (Array.isArray(value.set) ? value.set : []).map((v) => asObjectId(v))
                    : value.set;
            } else if (value.multiply !== undefined || value.divide !== undefined || value.pop !== undefined) {
                throw new Error(`[mongo-shim] multiply/divide/pop operators are not implemented (${model}.${key}).`);
            }
            continue;
        }

        if (key === 'id') {
            $set._id = asObjectId(value);
            continue;
        }
        if (meta.objectIdArrayFields?.includes(key)) {
            $set[fk] = (Array.isArray(value) ? value : []).map((v) => asObjectId(v));
            continue;
        }
        if (meta.objectIdFields?.includes(key)) {
            $set[fk] = asObjectId(value);
            continue;
        }
        $set[fk] = value;
    }

    if (!touched) return null;

    // @updatedAt semantics: stamp every update unless the caller set it explicitly.
    if (meta.hasUpdatedAt && $set.updatedAt === undefined) {
        $set.updatedAt = new Date();
    }

    const update: Record<string, any> = {};
    if (Object.keys($set).length) update.$set = stripUndefined($set);
    if (Object.keys($inc).length) update.$inc = $inc;
    if (Object.keys($push).length) update.$push = $push;
    return Object.keys(update).length ? update : { $set: {} };
}

// ── result mapping ──────────────────────────────────────────────────────────

// Mongo document -> Prisma result shape: _id becomes a string id, ObjectId
// scalars/arrays become strings. Embedded objects (Seo, Json) pass through.
// ponytail: exported for selftest
export function mapDocToPrisma(model: string, doc: any): any {
    if (!doc) return null;
    const meta = getModelMeta(model);
    const out: Record<string, any> = { ...doc };
    const _id = out._id;
    delete out._id;
    out.id = _id === undefined || _id === null ? _id : String(_id);

    for (const field of meta.objectIdFields || []) {
        if (out[field] instanceof ObjectId) out[field] = String(out[field]);
    }
    for (const field of meta.objectIdArrayFields || []) {
        if (Array.isArray(out[field])) {
            out[field] = out[field].map((v: any) => (v instanceof ObjectId ? String(v) : v));
        }
    }
    return out;
}
