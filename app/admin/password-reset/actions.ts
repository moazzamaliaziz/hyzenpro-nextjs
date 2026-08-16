'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { consumeRateLimit, getClientIp } from '@/lib/rate-limit';
import { consumePasswordReset, createPasswordResetRequest } from '@/lib/password-reset';
import { normalizeEmail } from '@/lib/auth-credentials';

export type PasswordResetActionState = {
    status: 'idle' | 'success' | 'error';
    message?: string;
};

export async function requestPasswordResetAction(
    _prevState: PasswordResetActionState,
    formData: FormData
): Promise<PasswordResetActionState> {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const email = normalizeEmail(String(formData.get('email') || ''));

    const rateLimit = consumeRateLimit({
        key: `password-reset-request:${ip}`,
        limit: 5,
        windowMs: 1000 * 60 * 15,
    });

    if (!rateLimit.allowed) {
        return {
            status: 'error',
            message: 'Too many reset requests. Please wait a few minutes and try again.',
        };
    }

    const result = await createPasswordResetRequest(email);
    if (!result.ok) {
        return {
            status: 'error',
            message: result.message,
        };
    }

    return {
        status: 'success',
        message: 'If that admin account exists, a reset link has been sent to its inbox.',
    };
}

export async function completePasswordResetAction(
    _prevState: PasswordResetActionState,
    formData: FormData
): Promise<PasswordResetActionState> {
    const requestHeaders = await headers();
    const ip = getClientIp(requestHeaders);
    const token = String(formData.get('token') || '');

    const rateLimit = consumeRateLimit({
        key: `password-reset-complete:${ip}`,
        limit: 10,
        windowMs: 1000 * 60 * 15,
    });

    if (!rateLimit.allowed) {
        return {
            status: 'error',
            message: 'Too many attempts. Please wait a few minutes and try again.',
        };
    }

    const result = await consumePasswordReset(
        token,
        String(formData.get('password') || ''),
        String(formData.get('confirmPassword') || '')
    );

    if (!result.ok) {
        return {
            status: 'error',
            message: result.message,
        };
    }

    redirect('/admin?reset=success');
}
