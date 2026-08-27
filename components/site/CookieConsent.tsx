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
            className="fixed bottom-3 left-3 right-3 z-[90] mx-auto max-w-lg rounded-xl border border-border bg-card p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] md:bottom-4 md:left-6 md:right-auto"
            role="dialog"
            aria-label="Cookie consent"
        >
            <p className="text-sm font-semibold text-foreground mb-1.5">Cookies & privacy</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
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
                    className="px-3.5 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:border-foreground transition-colors"
                >
                    Essential only
                </button>
                <button
                    type="button"
                    onClick={() => accept('all')}
                    className="px-3.5 py-1.5 text-xs font-bold text-background bg-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                    Accept all
                </button>
            </div>
        </div>
    );
}
