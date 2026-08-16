import { compare } from 'bcryptjs';

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function normalizeTwoFactorCode(code: string | undefined | null) {
    return (code || '').replace(/\D/g, '').slice(0, 6);
}

export function getPasswordCandidates(password: string) {
    const trimmedPassword = password.trim();

    return [...new Set([
        password,
        trimmedPassword,
    ])].filter(Boolean);
}

export async function findMatchingPasswordVariant(password: string, passwordHash: string) {
    for (const candidate of getPasswordCandidates(password)) {
        if (await compare(candidate, passwordHash)) {
            return candidate;
        }
    }

    return null;
}
