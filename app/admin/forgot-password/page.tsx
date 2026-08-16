import { LockKeyhole } from 'lucide-react';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = {
    title: 'Forgot Password - HyzenPro Admin',
};

export default function ForgotPasswordPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,242,255,0.14),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_35%)]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Password Recovery
                    </div>
                    <h1 className="font-heading mb-2 text-4xl text-white">Reset admin password</h1>
                    <p className="text-white/40">We will email a one-time reset link to the admin inbox.</p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    );
}
