import { randomBytes, createHash } from 'node:crypto';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { normalizeEmail } from '@/lib/auth-credentials';
import { getBaseUrl } from '@/lib/utils';
import { isMailerConfigured, sendTransactionalEmail } from '@/lib/mailer';
import { validateAdminPassword } from '@/lib/admin-security';

function hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

function buildResetUrl(token: string) {
    return `${getBaseUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;
}

export async function createPasswordResetRequest(emailInput: string) {
    const email = normalizeEmail(emailInput);

    if (!email) {
        return { ok: true };
    }

    if (!isMailerConfigured()) {
        return { ok: false, message: 'Password reset email is not configured yet. Add SMTP env vars first.' };
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, name: true },
    });

    if (!user || user.role !== 'admin') {
        return { ok: true };
    }

    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = hashResetToken(rawToken);
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    });

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: hashedToken,
            expires,
        },
    });

    const resetUrl = buildResetUrl(rawToken);

    await sendTransactionalEmail({
        to: email,
        subject: 'HyzenPro admin password reset',
        text: `Use this link to reset your HyzenPro admin password: ${resetUrl}\n\nThis link expires in 30 minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
                <h2>HyzenPro admin password reset</h2>
                <p>We received a request to reset the password for <strong>${email}</strong>.</p>
                <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Reset password</a></p>
                <p>If the button does not work, use this link:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link expires in 30 minutes.</p>
            </div>
        `,
    });

    return { ok: true };
}

export async function previewPasswordResetToken(rawToken: string) {
    if (!rawToken) {
        return { valid: false as const, message: 'Missing reset token.' };
    }

    const token = await prisma.verificationToken.findUnique({
        where: { token: hashResetToken(rawToken) },
    });

    if (!token || token.expires < new Date()) {
        return { valid: false as const, message: 'This reset link is invalid or expired.' };
    }

    return {
        valid: true as const,
        email: token.identifier,
    };
}

export async function consumePasswordReset(rawToken: string, password: string, confirmPassword: string) {
    if (!rawToken) {
        return { ok: false, message: 'Missing reset token.' };
    }

    const normalizedPassword = password.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (!normalizedPassword || !normalizedConfirmPassword) {
        return { ok: false, message: 'Both password fields are required.' };
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
        return { ok: false, message: 'New password and confirmation do not match.' };
    }

    const policyError = validateAdminPassword(normalizedPassword);
    if (policyError) {
        return { ok: false, message: policyError };
    }

    const preview = await previewPasswordResetToken(rawToken);
    if (!preview.valid) {
        return { ok: false, message: preview.message };
    }

    const user = await prisma.user.findUnique({
        where: { email: preview.email },
        select: { id: true, role: true },
    });

    if (!user || user.role !== 'admin') {
        return { ok: false, message: 'Admin account not found.' };
    }

    const nextPasswordHash = await hash(normalizedPassword, 12);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                password: nextPasswordHash,
                mustChangePassword: false,
                passwordChangedAt: new Date(),
                failedSignInAttempts: 0,
                lockoutUntil: null,
            },
        }),
        prisma.verificationToken.deleteMany({
            where: { identifier: preview.email },
        }),
    ]);

    return { ok: true };
}
