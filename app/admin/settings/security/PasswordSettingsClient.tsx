'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { changeAdminPassword } from './actions';

interface PasswordSettingsClientProps {
    requiresChange: boolean;
}

const passwordRules = [
    'At least 20 characters',
    'Uppercase and lowercase letters',
    'At least one number',
    'At least one symbol',
];

export default function PasswordSettingsClient({ requiresChange }: PasswordSettingsClientProps) {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const result = await changeAdminPassword(currentPassword, newPassword, confirmPassword);

            if (result.error) {
                setError(result.error);
                return;
            }

            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            router.refresh();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${requiresChange ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
                    {requiresChange ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">Admin Password</h2>
                    <p className="text-sm text-gray-500">
                        {requiresChange
                            ? 'This account must replace its bootstrap password before the admin panel unlocks.'
                            : 'Rotate your password here any time you want to strengthen admin access.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-xl text-sm">
                    Password updated successfully.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Current password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">New password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                        autoComplete="new-password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Confirm new password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
                        autoComplete="new-password"
                        required
                    />
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 p-4">
                    <p className="text-sm font-semibold text-black dark:text-white mb-2">Password policy</p>
                    <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        {passwordRules.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-sm hover:shadow-[4px_4px_0px_#9ca3af] dark:hover:shadow-[4px_4px_0px_#4b5563] transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {requiresChange ? 'Save New Password' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
