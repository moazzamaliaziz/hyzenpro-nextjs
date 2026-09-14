import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ponytail: one diagnostic endpoint instead of guesswork. Masked output — never leaks credentials.
function maskUrl(raw: string | undefined): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw);
        return `${url.protocol}//${url.host}/${url.pathname.split('/').filter(Boolean)[0] || '(no database name)'}`;
    } catch {
        return '(unparseable URL)';
    }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)),
    ]);
}

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        return NextResponse.json(
            { ok: false, error: 'CRON_SECRET is not set on the server — add it to Hostinger env vars, then retry.' },
            { status: 500 }
        );
    }
    if (key !== secret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUrl = process.env.DATABASE_URL;
    const mongoUri = process.env.MONGODB_URI; // detects the wrong-name mistake

    const env = {
        DATABASE_URL_set: Boolean(dbUrl),
        DATABASE_URL_target: maskUrl(dbUrl),
        MONGODB_URI_set: Boolean(mongoUri), // true = wrong var name in use, app ignores it
        MONGODB_URI_target: maskUrl(mongoUri),
        AUTH_SECRET_set: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
        MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || 'false',
    };

    const counts: Record<string, unknown> = {};
    let dbError: string | null = null;

    try {
        const [tools, posts, categories] = await withTimeout(
            Promise.all([
                prisma.tool.count(),
                prisma.post.count(),
                prisma.category.count(),
            ]),
            8000
        );
        counts.tools = tools;
        counts.posts = posts;
        counts.categories = categories;
    } catch (error) {
        dbError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }

    return NextResponse.json({
        ok: !dbError,
        env,
        counts: dbError ? null : counts,
        dbError,
        hint: dbError
            ? dbError.includes('timed out') || dbError.includes('server selection')
                ? 'MongoDB unreachable — check Atlas Network Access (0.0.0.0/0 entry Active).'
                : dbError.includes('AuthenticationFailed') || dbError.includes('bad auth')
                  ? 'Credentials wrong — reset the database user password in Atlas and update DATABASE_URL.'
                  : 'See dbError above.'
            : counts && (counts.tools === 0 && counts.posts === 0)
              ? 'Connected but database looks empty — DATABASE_URL probably points at the wrong database NAME (check Atlas → Browse Collections for the real name).'
              : 'Database healthy.',
    });
}
