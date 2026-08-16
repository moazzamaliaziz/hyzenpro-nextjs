'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import {
    generateTwoFactorSecret,
    enableTwoFactor
} from './actions';

interface Props {
    isTwoFactorEnabled: boolean;
    mandatory?: boolean;
    title?: string;
    description?: string;
}

export default function SecuritySettingsClient({
    isTwoFactorEnabled,
    mandatory = false,
    title = 'Two-Factor Authentication',
    description,
}: Props) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(isTwoFactorEnabled);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSetupClick() {
        setLoading(true);
        setError('');
        try {
            const res = await generateTwoFactorSecret();
            if (res.error) throw new Error(res.error);
            if (res.uri && res.secret) {
                const qrUrl = await QRCode.toDataURL(res.uri);
                setQrCodeUrl(qrUrl);
                setSecret(res.secret);
                setIsSettingUp(true);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate 2FA secret');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyEnable() {
        if (!token || token.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await enableTwoFactor(secret, token);
            if (res.error) {
                setError(res.error);
            } else if (res.success) {
                setEnabled(true);
                setIsSettingUp(false);
                setToken('');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'}`}>
                    {enabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6 text-gray-400" />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black dark:text-white">{title}</h2>
                    <p className="text-sm text-gray-500">
                        {description || (
                            enabled
                                ? (mandatory
                                    ? 'Authenticator-based 2FA is active and required for this admin account.'
                                    : '2FA is currently enabled on your account.')
                                : (mandatory
                                    ? 'Finish authenticator setup to unlock the admin panel.'
                                    : 'Add an extra layer of security to your account.')
                        )}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {!enabled && !isSettingUp && (
                <button
                    onClick={handleSetupClick}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider text-sm hover:shadow-[4px_4px_0px_#9ca3af] dark:hover:shadow-[4px_4px_0px_#4b5563] transition-all disabled:opacity-50"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Setup Authenticator App
                </button>
            )}

            {isSettingUp && (
                <div className="space-y-6 border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                    <div>
                        <h3 className="font-bold text-black dark:text-white mb-2">1. Scan QR Code</h3>
                        <p className="text-sm text-gray-500 mb-4">Open Google Authenticator, Authy, or your preferred TOTP app and scan this QR code.</p>
                        <div className="bg-white p-4 inline-block border border-gray-200 rounded-xl">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading...</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-black dark:text-white mb-2">2. Verify Token</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter the 6-digit code generated by your app to verify and enable 2FA.</p>
                        <div className="flex gap-4 max-w-xs">
                            <input
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono text-center tracking-widest text-lg"
                            />
                            <button
                                onClick={handleVerifyEnable}
                                disabled={loading || token.length !== 6}
                                className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-sm hover:shadow-[4px_4px_0px_#9ca3af] disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {enabled && mandatory && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                        This authenticator step is mandatory for admin accounts. If you ever lose access to your device,
                        reset the factor from a trusted server-side recovery flow instead of disabling it in the browser.
                    </div>
                </div>
            )}
        </div>
    );
}
