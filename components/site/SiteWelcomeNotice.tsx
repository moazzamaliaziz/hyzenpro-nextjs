'use client';

import { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'hyzenpro_welcome_notice_v1';

export default function SiteWelcomeNotice() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            if (!sessionStorage.getItem(STORAGE_KEY)) {
                const timer = window.setTimeout(() => setOpen(true), 1200);
                return () => window.clearTimeout(timer);
            }
        } catch {
            setOpen(true);
        }
    }, []);

    const dismiss = () => {
        try {
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // ignore
        }
        setOpen(false);
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[85] flex items-end justify-center p-4 sm:items-center sm:p-6 pointer-events-none">
            <div
                className="pointer-events-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden"
                role="dialog"
                aria-labelledby="welcome-notice-title"
            >
                <div className="flex items-start gap-3 bg-gray-50 border-b border-gray-100 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shrink-0">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p id="welcome-notice-title" className="text-sm font-bold text-black">
                            Trusted AI tool reviews
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Curated directory · Editorial review · Structured comparisons</p>
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        className="p-1.5 text-gray-400 hover:text-black rounded-lg transition-colors"
                        aria-label="Close notice"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed">
                    <p>
                        Every listing on HyzenPro is reviewed for clarity, pricing transparency, and buyer usefulness before it goes live.
                        Compare tools by category or use our matchers to shortlist faster.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 px-5 pb-5">
                    <Link
                        href="/ai-tools-directory/"
                        onClick={dismiss}
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Browse AI tools
                    </Link>
                    <button
                        type="button"
                        onClick={dismiss}
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>
    );
}
