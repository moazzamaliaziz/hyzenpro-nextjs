import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { previewPasswordResetToken } from '@/lib/password-reset';
import ResetPasswordForm from './ResetPasswordForm';

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string | string[] }>;
};

export const metadata = {
    title: 'Reset Password - HyzenPro Admin',
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = await searchParams;
    const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;
    const token = typeof tokenParam === 'string' ? tokenParam : '';
    const preview = await previewPasswordResetToken(token);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,242,255,0.14),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_35%)]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Secure Password Reset
                    </div>
                    <h1 className="font-heading mb-2 text-4xl text-white">Choose a new admin password</h1>
                    <p className="text-white/40">
                        {preview.valid ? `Reset access for ${preview.email}.` : 'This reset link is invalid or expired.'}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    {preview.valid ? (
                        <ResetPasswordForm token={token} />
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                                {preview.message}
                            </div>
                            <Link
                                href="/admin/forgot-password"
                                className="inline-flex rounded-xl bg-accent px-5 py-3 font-bold uppercase tracking-widest text-white transition-colors hover:bg-accent/80"
                            >
                                Request New Link
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
