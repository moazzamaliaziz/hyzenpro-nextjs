import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';

class CustomAuthError extends CredentialsSignin {
    constructor(code: string) {
        super();
        this.code = code;
    }
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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    return null;
                }

                // 2FA Verification
                if (user.isTwoFactorEnabled && user.twoFactorSecret) {
                    if (!credentials.twoFactorCode) {
                        throw new CustomAuthError('2FA_REQUIRED');
                    }

                    const isValidToken = speakeasy.totp.verify({
                        secret: user.twoFactorSecret,
                        encoding: 'base32',
                        token: credentials.twoFactorCode as string,
                        window: 1, // Allow 30 seconds clock drift
                    });

                    if (!isValidToken) {
                        throw new CustomAuthError('INVALID_2FA');
                    }
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
});
