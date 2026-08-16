import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role, ROLE_HIERARCHY } from '@/lib/roles';

type AdminToken = {
    role?: string;
    id?: string;
    email?: string;
};

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

export async function requireAdminToken(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
    });

    if (!token || token.role !== 'admin') {
        console.warn('[auth] requireAdminToken: no valid admin token', {
            hasSecret: !!AUTH_SECRET,
            hasCookie: !!request.headers.get('cookie'),
            hasToken: !!token,
            role: (token as AdminToken)?.role,
        });
        return null;
    }

    return token;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAdminAuth(handler: (req: NextRequest, ctx: { params?: any }) => any, requiredRole: Role = 'admin') {
    return async (req: NextRequest, ctx: { params?: any }) => {
        try {
            const token = await requireAdminToken(req);

            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const userRole: Role = (token.role as Role) ?? 'viewer';
            if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[requiredRole]) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const params = ctx.params ? await ctx.params : {};
            return handler(req, { params });
        } catch (error) {
            console.error('[Auth Error]', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}
