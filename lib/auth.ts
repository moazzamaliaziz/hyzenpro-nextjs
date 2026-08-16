import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import { getFailedSignInLimit, getLockoutDurationLabel, getLockoutDurationMs, isKnownBootstrapPassword } from '@/lib/admin-security';
import { findMatchingPasswordVariant, normalizeEmail, normalizeTwoFactorCode } from '@/lib/auth-credentials';
import { consumeRateLimit, getClientIp } from '@/lib/rate-limit';

class CustomAuthError extends CredentialsSignin {
    constructor(code: string) {
        super();
        this.code = code;
    }
}

async function recordFailedSignIn(userId: string, failedAttempts: number) {
    const nextAttempts = failedAttempts + 1;
    const shouldLock = nextAttempts >= getFailedSignInLimit();

    await prisma.user.update({
        where: { id: userId },
        data: {
            failedSignInAttempts: shouldLock ? 0 : nextAttempts,
            lockoutUntil: shouldLock ? new Date(Date.now() + getLockoutDurationMs()) : null,
        },
    });

    return shouldLock;
}

async function clearFailedSignInState(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            failedSignInAttempts: 0,
            lockoutUntil: null,
        },
    });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                twoFactorCode: { label: '2FA Code', type: 'text' },
            },
            async authorize(credentials, request) {
                if (!credentials?.email || !credentials?.password) {
                    throw new CustomAuthError('INVALID_CREDENTIALS');
                }

                const email = normalizeEmail(credentials.email as string);
                const providedPassword = credentials.password as string;
                const ip = request ? getClientIp(request.headers) : 'unknown';
                const ipRateLimit = consumeRateLimit({
                    key: `auth:ip:${ip}`,
                    limit: 25,
                    windowMs: 1000 * 60 * 15,
                });
                const identityRateLimit = consumeRateLimit({
                    key: `auth:identity:${email}:${ip}`,
                    limit: 8,
                    windowMs: 1000 * 60 * 15,
                });

                if (!ipRateLimit.allowed || !identityRateLimit.allowed) {
                    throw new CustomAuthError('ACCOUNT_LOCKED');
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    throw new CustomAuthError('INVALID_CREDENTIALS');
                }

                if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                    throw new CustomAuthError('ACCOUNT_LOCKED');
                }

                const matchedPassword = await findMatchingPasswordVariant(providedPassword, user.password);

                if (!matchedPassword) {
                    const isLocked = await recordFailedSignIn(user.id, user.failedSignInAttempts);
                    if (isLocked) {
                        throw new CustomAuthError('ACCOUNT_LOCKED');
                    }

                    throw new CustomAuthError('INVALID_CREDENTIALS');
                }

                const mustChangePassword = Boolean(user.mustChangePassword) || (
                    user.role === 'admin' && isKnownBootstrapPassword(matchedPassword)
                );

                if (mustChangePassword && !user.mustChangePassword) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { mustChangePassword: true },
                    });
                }

                // 2FA Verification
                if (user.isTwoFactorEnabled && user.twoFactorSecret) {
                    const twoFactorCode = normalizeTwoFactorCode(credentials.twoFactorCode as string | undefined);

                    if (!twoFactorCode) {
                        throw new CustomAuthError('2FA_REQUIRED');
                    }

                    const isValidToken = speakeasy.totp.verify({
                        secret: user.twoFactorSecret,
                        encoding: 'base32',
                        token: twoFactorCode,
                        window: 1, // Allow 30 seconds clock drift
                    });

                    if (!isValidToken) {
                        const isLocked = await recordFailedSignIn(user.id, user.failedSignInAttempts);
                        if (isLocked) {
                            throw new CustomAuthError('ACCOUNT_LOCKED');
                        }

                        throw new CustomAuthError('INVALID_2FA');
                    }
                }

                await clearFailedSignInState(user.id);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as 'admin' | 'user',
                    image: user.image,
                    isTwoFactorEnabled: user.isTwoFactorEnabled,
                    mustChangePassword,
                };
            },
        }),
    ],
});

export const authLockoutMessage = `Too many sign-in attempts. Try again in ${getLockoutDurationLabel()}.`;
