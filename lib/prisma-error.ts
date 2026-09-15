// Local replacement for Prisma.PrismaClientKnownRequestError.
// Mirrors the constructor signature and instanceof semantics of the real
// class so every `error instanceof PrismaClientKnownRequestError` check
// in the API routes keeps working — even when `prisma generate` failed
// and @prisma/client has no generated client at runtime.
//
// The shim (lib/prisma.ts) never calls `new PrismaClient()`, so the Rust
// query engine is never loaded.  The only thing the app still needs from
// @prisma/client is the pure-JS error classes — which we provide here
// without requiring the generated client artefacts.

export interface PrismaErrorOptions {
    code: string;
    clientVersion: string;
    meta?: Record<string, unknown>;
}

export class PrismaClientKnownRequestError extends Error {
    code: string;
    clientVersion: string;
    meta?: Record<string, unknown>;

    constructor(message: string, options: PrismaErrorOptions) {
        super(message);
        this.name = 'PrismaClientKnownRequestError';
        this.code = options.code;
        this.clientVersion = options.clientVersion;
        if (options.meta !== undefined) {
            this.meta = options.meta;
        }
        // Restore prototype chain (needed when targeting ES5/ES2017).
        Object.setPrototypeOf(this, PrismaClientKnownRequestError.prototype);
    }
}
