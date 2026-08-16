'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2, LockKeyhole } from 'lucide-react';
import { completePasswordResetAction, type PasswordResetActionState } from '@/app/admin/password-reset/actions';

const initialState: PasswordResetActionState = {
    status: 'idle',
};

export default function ResetPasswordForm({ token }: { token: string }) {
    const [state, formAction, pending] = useActionState(completePasswordResetAction, initialState);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="token" value={token} />

            {state.status === 'error' && state.message && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
                    {state.message}
                </div>
            )}

            <div>
                <label className="mb-2 block text-sm font-medium text-white/80">New Password</label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white transition-colors focus:border-accent/50 focus:outline-none"
                    placeholder="Use a strong admin password"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white transition-colors focus:border-accent/50 focus:outline-none"
                    placeholder="Repeat the new password"
                />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/55">
                Use at least 12 characters with uppercase, lowercase, numbers, and a symbol. After reset, sign in again
                with the new password and keep 2FA enabled on the admin account.
            </div>

            <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold uppercase tracking-widest text-white transition-all hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Updating Password...
                    </>
                ) : (
                    <>
                        <LockKeyhole className="h-5 w-5" />
                        Reset Password
                    </>
                )}
            </button>

            <div className="text-center">
                <Link href="/admin" className="text-sm text-white/45 transition-colors hover:text-white">
                    Back to admin login
                </Link>
            </div>
        </form>
    );
}
