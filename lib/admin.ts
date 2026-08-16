import type { Session } from 'next-auth';
import { needsAdminSecuritySetup } from '@/lib/admin-security';

type SessionUser = Session['user'] | undefined | null;
type AuthenticatedUser = NonNullable<Session['user']>;
type AdminUser = AuthenticatedUser & { role: 'admin' };

export function normalizeAppPath(path: string): string {
    if (!path || path === '/') {
        return '/';
    }

    const trimmedPath = path.replace(/\/+$/, '');
    return trimmedPath || '/';
}

export function isAdminUser(user: SessionUser): user is AdminUser {
    return user?.role === 'admin';
}

export function isAdminSession(session: Session | null | undefined): session is Session & { user: AdminUser } {
    return isAdminUser(session?.user);
}

export function isAdminSecuritySetupRequired(user: SessionUser): boolean {
    return needsAdminSecuritySetup(user);
}

export function resolveAuthCallbackPath(
    callbackUrl: string | null | undefined,
    fallback = '/admin'
): string {
    if (!callbackUrl) {
        return normalizeAppPath(fallback);
    }

    if (callbackUrl.startsWith('/')) {
        return normalizeAppPath(callbackUrl);
    }

    try {
        const url = new URL(callbackUrl);
        const pathname = normalizeAppPath(url.pathname);
        const path = `${pathname}${url.search}${url.hash}`;
        return path.startsWith('/') ? path : normalizeAppPath(fallback);
    } catch {
        return normalizeAppPath(fallback);
    }
}

export function buildAdminLoginUrl(callbackUrl?: string | null): string {
    const safeCallbackPath = resolveAuthCallbackPath(callbackUrl, '');

    if (!safeCallbackPath || safeCallbackPath === '/admin') {
        return '/admin';
    }

    return `/admin?callbackUrl=${encodeURIComponent(safeCallbackPath)}`;
}
