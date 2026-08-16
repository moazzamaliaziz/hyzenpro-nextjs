import { NextRequest, NextResponse } from 'next/server';
import { readBearerToken, secureCompareSecret } from '@/lib/secret-auth';

export async function POST(request: NextRequest) {
    const revalidationSecret = process.env.REVALIDATION_SECRET;
    if (!revalidationSecret) {
        return NextResponse.json({ error: 'Revalidation secret is not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const authToken = readBearerToken(request.headers.get('authorization'));
    const body = await request.json().catch(() => null);
    const pathFromBody = typeof body?.path === 'string' ? body.path : null;
    const pathsFromBody = Array.isArray(body?.paths) ? body.paths : null;
    const pathFromQuery = searchParams.get('path');
    const path = pathFromBody || pathFromQuery;

    if (!authToken || !secureCompareSecret(revalidationSecret, authToken)) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!path && !pathsFromBody) {
        return NextResponse.json(
            { error: 'Path or paths parameter required' },
            { status: 400 }
        );
    }

    try {
        // In Next.js 16 App Router, we use revalidatePath
        const { revalidatePath } = await import('next/cache');
        
        const revalidatedPaths: string[] = [];
        if (pathsFromBody) {
            for (const p of pathsFromBody) {
                if (typeof p === 'string') {
                    revalidatePath(p);
                    revalidatedPaths.push(p);
                }
            }
        } else if (path) {
            revalidatePath(path);
            revalidatedPaths.push(path);
        }

        return NextResponse.json(
            {
                revalidated: true,
                paths: revalidatedPaths,
                now: Date.now(),
            },
            {
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Error revalidating' },
            { status: 500 }
        );
    }
}
