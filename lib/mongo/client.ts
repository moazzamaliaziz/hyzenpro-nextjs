// Cached MongoClient singleton for the Prisma shim.
// The official mongodb driver uses Node's own DNS resolver, which tolerates
// Hostinger's resolv.conf; Prisma's Rust query engine does not — that is the
// entire reason this shim exists.

import { MongoClient } from 'mongodb';

type GlobalWithMongo = typeof globalThis & {
    __hyzenproMongoClient?: MongoClient;
    __hyzenproMongoDbName?: string;
};

const DEFAULT_DB_NAME = 'hyzenpro';

// ponytail: exported for selftest
export function resolveDbName(uri: string): string | null {
    // mongodb://user:pass@host[:port]/dbName?params or mongodb+srv://user:pass@host/dbName?params
    const match = uri.match(/^[A-Za-z][A-Za-z0-9+.-]*:\/\/[^/]+\/([^/?]+)/);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

export function getMongoClient(): MongoClient {
    const g = globalThis as GlobalWithMongo;
    if (!g.__hyzenproMongoClient) {
        const uri = process.env.DATABASE_URL;
        if (!uri) {
            throw new Error('[mongo-shim] DATABASE_URL is not set — cannot connect to MongoDB.');
        }
        const dbName = resolveDbName(uri);
        if (!dbName) {
            console.warn(
                `[mongo-shim] DATABASE_URL carries no database name — falling back to "${DEFAULT_DB_NAME}". ` +
                'Atlas URLs must include the db in the path (mongodb+srv://user:pass@host/<db>?...).'
            );
        }
        // Lazy connection: constructing the client never touches the network;
        // the driver auto-connects on the first operation.
        g.__hyzenproMongoClient = new MongoClient(uri, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        });
        g.__hyzenproMongoDbName = dbName || DEFAULT_DB_NAME;
    }
    return g.__hyzenproMongoClient;
}

export function getDb() {
    return getMongoClient().db((globalThis as GlobalWithMongo).__hyzenproMongoDbName);
}

export async function closeMongoClient() {
    const g = globalThis as GlobalWithMongo;
    if (g.__hyzenproMongoClient) {
        await g.__hyzenproMongoClient.close();
        g.__hyzenproMongoClient = undefined;
        g.__hyzenproMongoDbName = undefined;
    }
}
