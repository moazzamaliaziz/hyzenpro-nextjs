'use client';

import { useEffect, useRef, useCallback } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, options: Record<string, unknown>) => string;
            remove: (widgetId: string) => void;
            reset: (widgetId: string) => void;
        };
    }
}

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
}

export default function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const loadedRef = useRef(false);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const onVerifyRef = useRef(onVerify);
    onVerifyRef.current = onVerify;

    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        const doRender = () => {
            if (!containerRef.current || !window.turnstile) return;
            try {
                if (widgetIdRef.current) {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                }
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => onVerifyRef.current(token),
                    'expired-callback': () => onExpireRef.current?.(),
                    'error-callback': () => {
                        console.error('[Turnstile] widget error');
                    },
                    theme: 'light',
                    appearance: 'always',
                });
            } catch (err) {
                console.error('[Turnstile] render failed:', err);
            }
        };

        if (window.turnstile) {
            doRender();
            return () => {
                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                }
            };
        }

        if (loadedRef.current) return;

        const existing = document.querySelector('script[data-turnstile]');
        if (existing) {
            loadedRef.current = true;
            existing.addEventListener('load', doRender);
            return () => {
                existing.removeEventListener('load', doRender);
            };
        }

        loadedRef.current = true;
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.onload = () => doRender();
        document.head.appendChild(script);

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey]);

    if (!siteKey) {
        return (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Captcha is not configured yet.
            </p>
        );
    }

    return <div ref={containerRef} className="min-h-[65px]" />;
}
