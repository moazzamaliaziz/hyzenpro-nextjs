'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import { revalidatePath } from 'next/cache';

export async function generateTwoFactorSecret() {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
        return { error: 'Unauthorized' };
    }

    const secretInfo = speakeasy.generateSecret({
        name: `HyzenPro Admin (${session.user.email})`,
    });

    return { secret: secretInfo.base32, uri: secretInfo.otpauth_url };
}

export async function enableTwoFactor(secret: string, token: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1
    });

    if (!isValid) {
        return { error: 'Invalid verification code' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            isTwoFactorEnabled: true,
            twoFactorSecret: secret,
        },
    });

    revalidatePath('/admin/settings/security');
    return { success: true };
}

export async function disableTwoFactor(token: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
        return { error: 'Two-factor authentication is not enabled.' };
    }

    const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1
    });

    if (!isValid) {
        return { error: 'Invalid verification code' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
        },
    });

    revalidatePath('/admin/settings/security');
    return { success: true };
}
