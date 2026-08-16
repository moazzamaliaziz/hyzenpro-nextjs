import type { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/prisma';
import { buildAdminLoginUrl, isAdminSecuritySetupRequired, isAdminUser, normalizeAppPath, resolveAuthCallbackPath } from '@/lib/admin';

function getPreferredAuthOrigin(baseUrl: string): string {
    const deployedSiteUrl = process.env.VERCEL_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SITE_URL
        : undefined;

    try {
        return new URL(deployedSiteUrl || baseUrl).origin;
    } catch {
        return baseUrl;
    }
}

function getTrustedAuthOrigins(baseUrl: string): Set<string> {
    const origins = new Set<string>();

    for (const candidate of [baseUrl, getPreferredAuthOrigin(baseUrl)]) {
        try {
            origins.add(new URL(candidate).origin);
        } catch {
            // Ignore malformed values and fall back to the remaining candidates.
        }
    }

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        try {
            origins.add(new URL(`https://${vercelUrl}`).origin);
        } catch {
            // Ignore malformed deployment URLs.
        }
    }

    const explicitAuthUrl = process.env.NEXTAUTH_URL;
    if (explicitAuthUrl) {
        try {
            origins.add(new URL(explicitAuthUrl).origin);
        } catch {
            // Ignore malformed NEXTAUTH_URL values.
        }
    }

    return origins;
}

export const authConfig = {
    pages: {
        signIn: '/admin',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const pathname = normalizeAppPath(nextUrl.pathname);
            const isAdminRoot = pathname === '/admin';
            const isAdminChildRoute = pathname.startsWith('/admin/');
            const isLegacyLoginRoute = pathname === '/portal-auth';

            if (isLegacyLoginRoute) {
                const callbackUrl = nextUrl.searchParams.get('callbackUrl');
                return Response.redirect(new URL(buildAdminLoginUrl(callbackUrl), nextUrl));
            }

            if (isAdminRoot) {
                return true;
            }

            if (isAdminChildRoute) {
                if (isAdminUser(auth?.user)) {
                    if (isAdminSecuritySetupRequired(auth.user)) {
                        return Response.redirect(new URL('/admin', nextUrl));
                    }

                    return true;
                }

                const redirectTarget = auth?.user
                    ? '/admin'
                    : buildAdminLoginUrl(`${pathname}${nextUrl.search}`);

                return Response.redirect(new URL(redirectTarget, nextUrl));
            }

            return true;
        },
        redirect({ url, baseUrl }) {
            const preferredOrigin = getPreferredAuthOrigin(baseUrl);
            const trustedOrigins = getTrustedAuthOrigins(baseUrl);

            if (url.startsWith('/')) {
                return `${preferredOrigin}${resolveAuthCallbackPath(url, '/admin')}`;
            }

            try {
                const targetUrl = new URL(url);
                const normalizedPath = resolveAuthCallbackPath(
                    `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
                    '/admin'
                );

                if (trustedOrigins.has(targetUrl.origin)) {
                    return `${preferredOrigin}${normalizedPath}`;
                }
            } catch {
                return `${preferredOrigin}/admin`;
            }

            return `${preferredOrigin}/admin`;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.isTwoFactorEnabled = Boolean((user as any).isTwoFactorEnabled);
                token.mustChangePassword = Boolean((user as any).mustChangePassword);
            }

            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: {
                        role: true,
                        isTwoFactorEnabled: true,
                        mustChangePassword: true,
                    },
                });

                if (dbUser) {
                    token.role = dbUser.role as 'admin' | 'user';
                    token.isTwoFactorEnabled = dbUser.isTwoFactorEnabled;
                    token.mustChangePassword = dbUser.mustChangePassword;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).isTwoFactorEnabled = Boolean(token.isTwoFactorEnabled);
                (session.user as any).mustChangePassword = Boolean(token.mustChangePassword);
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 8,
        updateAge: 60 * 60,
    },
    providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
