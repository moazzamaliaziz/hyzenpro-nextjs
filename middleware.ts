import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const VALID_LOCALES = new Set<string>(routing.locales);

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // ── Admin UI routes — bypass i18n, apply auth ──────────────
    if (pathname.startsWith('/admin')) {
        const token = await getToken({
            req: request,
            secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production',
        });

        const isAuthenticated = !!token;
        const isAdmin = token?.role === 'admin';

        const publicPaths = ['/admin', '/admin/forgot-password', '/admin/reset-password'];
        const isPublic = publicPaths.some(
            (p) => pathname === p || pathname.startsWith(p + '/')
        );

        if (isAuthenticated && isAdmin) {
            if (pathname === '/admin') {
                const cb = searchParams.get('callbackUrl');
                if (cb && cb.startsWith('/admin/')) {
                    return NextResponse.redirect(new URL(cb, request.url));
                }
            }
            return NextResponse.next();
        }

        if (isPublic) return NextResponse.next();

        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Validate locale prefix — redirect invalid locales to / ──
    const segments = pathname.split('/');
    if (segments.length > 1 && VALID_LOCALES.has(segments[1])) {
        // Valid locale prefix — let Next.js route to [locale]/ pages naturally
        const response = NextResponse.next();
        response.headers.set('x-locale', segments[1]);
        return response;
    }

    // ── Root path — pass through (serves original English page) ─
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!admin|api|sitemap|robots|feed|_next|images|favicon.ico|apple-icon.png|icon.png).*)'
    ]
};
