// Prisma-compatible data-access shim over the official MongoDB driver.
//
// WHY: on Hostinger shared hosting, Prisma 6's Rust query engine dies on every
// connection with `PrismaClientInitializationError: DNS resolution: Error
// parsing resolv.conf: option at line 5 is not recognized`. Node's own DNS
// resolver (which the `mongodb` driver uses) tolerates that line. This module
// keeps the exact `prisma.<model>.<op>(...)` call shape the app already uses,
// so no call sites change — and `new PrismaClient()` is never instantiated.
//
// `@prisma/client` stays a real dependency ONLY for its generated TYPES (and
// its pure-JS error classes for instanceof/code checks); importing it never
// loads the engine binary.

import type { PrismaClient } from '@prisma/client';
import { getDb, getMongoClient, closeMongoClient } from './mongo/client';
import { createModelRepository } from './mongo/repository';
import { MODELS } from './mongo/meta';

function buildShim() {
    const models: Record<string, unknown> = {};
    for (const model of Object.keys(MODELS)) {
        models[model] = createModelRepository(model, getDb);
    }

    return {
        ...models,

        // Array form: the elements are already-started operation promises, so a
        // Promise.all passthrough matches how the app uses it. Sequential
        // isolation is NOT provided (single-document ops, low risk).
        // Interactive form (app/api/admin/settings): the callback receives this
        // same shim — operations run sequentially but without a real
        // transaction boundary.
        async $transaction(arg: unknown) {
            if (typeof arg === 'function') {
                return (arg as (tx: unknown) => unknown | Promise<unknown>)(shim);
            }
            return Promise.all(arg as Promise<unknown>[]);
        },

        async $connect() {
            await getMongoClient().connect();
        },

        async $disconnect() {
            await closeMongoClient();
        },
    };
}

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const shim = buildShim();

// The cast below is load-bearing: the shim reproduces the generated
// PrismaClient's runtime surface, and this cast keeps every existing
// `prisma.tool.findMany(...)` call site type-checking unchanged.
const client = shim as unknown as PrismaClient;

// Cache on globalThis in ALL environments to prevent connection pool
// exhaustion in serverless/hot-reload environments.
export const prisma = globalThis.prisma ?? client;
globalThis.prisma = prisma;

export default prisma;
