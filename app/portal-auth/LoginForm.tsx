'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { resolveAuthCallbackPath } from '@/lib/admin';
import { getLockoutDurationLabel } from '@/lib/admin-security';
import { normalizeEmail, normalizeTwoFactorCode } from '@/lib/auth-credentials';

const SENSITIVE_QUERY_PARAMS = ['email', 'password', 'twoFactorCode'];

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [savedEmail, setSavedEmail] = useState('');
    const [savedPassword, setSavedPassword] = useState('');
    const callbackUrl = resolveAuthCallbackPath(searchParams.get('callbackUrl'));
    const successMessage = useMemo(() => {
        if (searchParams.get('reset') === 'success') {
            return 'Password updated. Sign in with your new admin password.';
        }

        return null;
    }, [searchParams]);

    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        let changed = false;

        for (const key of SENSITIVE_QUERY_PARAMS) {
            if (currentParams.has(key)) {
                currentParams.delete(key);
                changed = true;
            }
        }

        if (!changed) {
            return;
        }

        const nextQuery = currentParams.toString();
        const nextUrl = nextQuery ? `/admin?${nextQuery}` : '/admin';
        window.history.replaceState(null, '', nextUrl);
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = normalizeEmail(savedEmail || (formData.get('email') as string));
        const password = savedPassword || (formData.get('password') as string);
        const twoFactorCode = normalizeTwoFactorCode((formData.get('twoFactorCode') as string) || undefined) || undefined;

        try {
            const res = await signIn('credentials', {
                email,
                password,
                twoFactorCode,
                callbackUrl,
                redirect: false,
            });

            const authCode = res?.code || res?.error;

            if (authCode) {
                if (authCode.includes('2FA_REQUIRED') || authCode === '2FA_REQUIRED') {
                    setNeeds2FA(true);
                    setSavedEmail(email);
                    setSavedPassword(password);
                    setError(null);
                } else if (authCode.includes('ACCOUNT_LOCKED') || authCode === 'ACCOUNT_LOCKED') {
                    setNeeds2FA(false);
                    setSavedEmail('');
                    setSavedPassword('');
                    setError(`Too many sign-in attempts. Try again in ${getLockoutDurationLabel()}.`);
                } else if (authCode.includes('INVALID_2FA') || authCode === 'INVALID_2FA') {
                    setError('Invalid two-factor authentication code.');
                } else {
                    setError('Invalid email or password');
                }
                setLoading(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
                    {error}
                </div>
            )}

            {!needs2FA ? (
                <>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            defaultValue={savedEmail}
                            autoCapitalize="none"
                            autoCorrect="off"
                            autoComplete="email"
                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white transition-colors focus:border-accent/50 focus:outline-none"
                            placeholder="admin@hyzenpro.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white transition-colors focus:border-accent/50 focus:outline-none"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/admin/forgot-password"
                            className="text-sm text-white/45 transition-colors hover:text-white"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="mb-2 block text-sm font-medium text-white/80">Two-Factor Authentication Code</label>
                    <input
                        type="text"
                        name="twoFactorCode"
                        required
                        maxLength={6}
                        inputMode="numeric"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center font-mono text-lg tracking-widest text-white transition-colors focus:border-accent/50 focus:outline-none"
                        placeholder="000000"
                        autoComplete="one-time-code"
                        autoFocus
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold uppercase tracking-widest text-white transition-all hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}
