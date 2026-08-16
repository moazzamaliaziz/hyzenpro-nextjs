'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'hyzenpro_cookie_consent_v1';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                setVisible(true);
            }
        } catch {
            setVisible(true);
        }
    }, []);

    const accept = (choice: 'all' | 'essential') => {
        try {
            localStorage.setItem(STORAGE_KEY, choice);
        } catch {
            // ignore
        }
        setVisible(false);
    };

    if (!visible) {
        return null;
    }

    return (
        <div
            className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] md:left-6 md:right-auto"
            role="dialog"
            aria-label="Cookie consent"
        >
            <p className="text-sm font-semibold text-foreground mb-2">Cookies & privacy</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                HyzenPro uses essential cookies for sign-in and preferences, and may use analytics or advertising cookies
                (including Google AdSense) to keep the directory free. See our{' '}
                <Link href="/privacy-policy/" className="underline text-foreground">
                    Privacy Policy
                </Link>
                .
            </p>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => accept('essential')}
                    className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-xl hover:border-foreground transition-colors"
                >
                    Essential only
                </button>
                <button
                    type="button"
                    onClick={() => accept('all')}
                    className="px-4 py-2 text-sm font-bold text-background bg-foreground rounded-xl hover:opacity-90 transition-colors"
                >
                    Accept all
                </button>
            </div>
        </div>
    );
}
