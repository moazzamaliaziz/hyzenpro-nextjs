import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const VALID_LOCALES = new Set<string>(routing.locales);

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HyzenPro — Scheduled Maintenance</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ui-serif, Georgia, 'Times New Roman', serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 520px; text-align: center; }
  .badge { display: inline-block; font-family: ui-monospace, 'Courier New', monospace; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #a1a1aa; border: 1px solid #27272a; border-radius: 999px; padding: 6px 16px; margin-bottom: 32px; }
  h1 { font-size: clamp(28px, 6vw, 42px); font-weight: 500; line-height: 1.2; margin-bottom: 16px; }
  p { font-size: 16px; line-height: 1.7; color: #a1a1aa; margin-bottom: 12px; }
  .dot { color: #22c55e; animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
</style>
</head>
<body>
<main class="card">
  <span class="badge">HyzenPro</span>
  <h1>We&rsquo;ll be right back.</h1>
  <p>HyzenPro is undergoing scheduled maintenance <span class="dot">&bull;</span></p>
  <p>Our reviews, comparisons, and the AI tools directory will return shortly. Nothing is lost — check back soon.</p>
</main>
</body>
</html>`;

export async function middleware(request: NextRequest) {
    // ponytail: 503 + Retry-After preserves SEO rankings (Google treats as temporary).
    // Admin/api/static are excluded by the matcher below, so the owner keeps full access.
    if (process.env.MAINTENANCE_MODE === 'true') {
        return new NextResponse(MAINTENANCE_HTML, {
            status: 503,
            headers: {
                'Retry-After': '3600',
                'Cache-Control': 'no-store',
            },
        });
    }
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
