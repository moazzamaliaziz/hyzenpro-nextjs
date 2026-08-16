'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import { revalidatePath } from 'next/cache';
import { isAdminSession } from '@/lib/admin';
import { compare, hash } from 'bcryptjs';
import { validateAdminPassword } from '@/lib/admin-security';
import { findMatchingPasswordVariant, normalizeTwoFactorCode } from '@/lib/auth-credentials';

export async function generateTwoFactorSecret() {
    const session = await auth();
    if (!isAdminSession(session) || !session.user.id || !session.user.email) {
        return { error: 'Unauthorized' };
    }

    const secretInfo = speakeasy.generateSecret({
        name: `HyzenPro Admin (${session.user.email})`,
    });

    return { secret: secretInfo.base32, uri: secretInfo.otpauth_url };
}

export async function enableTwoFactor(secret: string, token: string) {
    const session = await auth();
    if (!isAdminSession(session) || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    const normalizedToken = normalizeTwoFactorCode(token);

    const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: normalizedToken,
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

    revalidatePath('/admin');
    revalidatePath('/admin/settings/security');
    return { success: true };
}

export async function disableTwoFactor(token: string) {
    const session = await auth();
    if (!isAdminSession(session) || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    return { error: 'Two-factor authentication is required for admin accounts and cannot be disabled here.' };
}

export async function changeAdminPassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const session = await auth();
    if (!isAdminSession(session) || !session.user.id) {
        return { error: 'Unauthorized' };
    }

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
        return { error: 'All password fields are required.' };
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
        return { error: 'New password and confirmation do not match.' };
    }

    const passwordPolicyError = validateAdminPassword(trimmedNewPassword);
    if (passwordPolicyError) {
        return { error: passwordPolicyError };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || !user.password) {
        return { error: 'Admin account not found.' };
    }

    const matchedCurrentPassword = await findMatchingPasswordVariant(currentPassword, user.password);
    if (!matchedCurrentPassword) {
        return { error: 'Current password is incorrect.' };
    }

    const isReusedPassword = await compare(trimmedNewPassword, user.password);
    if (isReusedPassword) {
        return { error: 'Choose a different password than the current one.' };
    }

    const hashedPassword = await hash(trimmedNewPassword, 12);

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            password: hashedPassword,
            mustChangePassword: false,
            passwordChangedAt: new Date(),
            failedSignInAttempts: 0,
            lockoutUntil: null,
        },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/settings/security');
    return { success: true };
}
