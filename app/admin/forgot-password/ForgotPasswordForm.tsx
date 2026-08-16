'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { requestPasswordResetAction, type PasswordResetActionState } from '../password-reset/actions';

const initialState: PasswordResetActionState = {
    status: 'idle',
};

export default function ForgotPasswordForm() {
    const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

    return (
        <form action={formAction} className="space-y-6">
            {state.message ? (
                <div className={`rounded-xl border px-4 py-3 text-sm ${state.status === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
                    {state.message}
                </div>
            ) : null}

            <div>
                <label className="mb-2 block text-sm font-medium text-white/80">Admin email</label>
                <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white focus:border-accent/50 focus:outline-none"
                    placeholder="admin@hyzenpro.com"
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold uppercase tracking-widest text-white transition-all hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                    </>
                ) : 'Send reset link'}
            </button>

            <Link href="/admin" className="block text-center text-sm text-white/55 transition-colors hover:text-white">
                Back to admin login
            </Link>
        </form>
    );
}
