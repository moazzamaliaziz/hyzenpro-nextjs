'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [needs2FA, setNeeds2FA] = useState(false);
    const [savedEmail, setSavedEmail] = useState('');
    const [savedPassword, setSavedPassword] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = savedEmail || (formData.get('email') as string);
        const password = savedPassword || (formData.get('password') as string);
        const twoFactorCode = (formData.get('twoFactorCode') as string) || undefined;

        try {
            const res = await signIn('credentials', {
                email,
                password,
                twoFactorCode,
                redirect: false,
            });

            if (res?.error) {
                if (res.error.includes('2FA_REQUIRED') || res.error === '2FA_REQUIRED') {
                    setNeeds2FA(true);
                    setSavedEmail(email);
                    setSavedPassword(password);
                    setError(null);
                } else if (res.error.includes('INVALID_2FA') || res.error === 'INVALID_2FA') {
                    setError('Invalid two-factor authentication code.');
                } else {
                    setError('Invalid email or password');
                }
                setLoading(false);
            } else {
                router.push('/admin');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                    {error}
                </div>
            )}

            {!needs2FA ? (
                <>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="admin@hyzenpro.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="block text-sm font-medium text-white/80 mb-2">Two-Factor Authentication Code</label>
                    <input
                        type="text"
                        name="twoFactorCode"
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none transition-colors text-center font-mono tracking-widest text-lg"
                        placeholder="000000"
                        autoComplete="one-time-code"
                        autoFocus
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold uppercase tracking-widest rounded-xl hover:bg-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}
