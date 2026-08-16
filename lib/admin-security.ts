const ADMIN_PASSWORD_MIN_LENGTH = 20;
const FAILED_SIGN_IN_LIMIT = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

const KNOWN_BOOTSTRAP_PASSWORDS = new Set([
    'hyzenpro2026',
    'HyzenPro2026!',
]);

type AdminSecurityState = {
    role?: string | null;
    isTwoFactorEnabled?: boolean | null;
    mustChangePassword?: boolean | null;
};

export function needsAdminSecuritySetup(user: AdminSecurityState | null | undefined): boolean {
    return user?.role === 'admin' && (!user.isTwoFactorEnabled || Boolean(user.mustChangePassword));
}

export function isKnownBootstrapPassword(password: string): boolean {
    return KNOWN_BOOTSTRAP_PASSWORDS.has(password);
}

export function validateAdminPassword(password: string): string | null {
    if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
        return `Use at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`;
    }

    if (!/[A-Z]/.test(password)) {
        return 'Include at least one uppercase letter.';
    }

    if (!/[a-z]/.test(password)) {
        return 'Include at least one lowercase letter.';
    }

    if (!/[0-9]/.test(password)) {
        return 'Include at least one number.';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'Include at least one symbol.';
    }

    return null;
}

export function getFailedSignInLimit(): number {
    return FAILED_SIGN_IN_LIMIT;
}

export function getLockoutDurationMs(): number {
    return LOCKOUT_WINDOW_MINUTES * 60 * 1000;
}

export function getLockoutDurationLabel(): string {
    return `${LOCKOUT_WINDOW_MINUTES} minutes`;
}
