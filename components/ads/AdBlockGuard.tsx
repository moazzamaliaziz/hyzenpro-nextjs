'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

const SESSION_KEY = 'hyzenpro-adblock-dismissed';

function baitWasRemoved(node: HTMLDivElement) {
    return !node.isConnected || node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true';
}

export default function AdBlockGuard() {
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY) === '1') {
            return;
        }

        let timer: number | null = null;

        const runDetection = () => {
            const activeSlots = document.querySelectorAll('[data-monetize-slot]');
            if (activeSlots.length === 0) {
                return;
            }

            const bait = document.createElement('div');
            bait.className = 'adsbox text-ad textAds ad-banner ad-placement sponsored-unit';
            bait.setAttribute('aria-hidden', 'true');
            bait.style.position = 'absolute';
            bait.style.left = '-9999px';
            bait.style.top = '0';
            bait.style.width = '1px';
            bait.style.height = '1px';

            document.body.appendChild(bait);

            window.setTimeout(() => {
                // Avoid offsetWidth/offsetHeight/getBoundingClientRect reads here.
                // Presence checks do not synchronously flush style/layout and still
                // catch blockers that remove or hide bait nodes from the DOM.
                const blocked = baitWasRemoved(bait);
                bait.remove();

                if (blocked) {
                    setShowNotice(true);
                }
            }, 120);
        };

        const scheduleCheck = () => {
            if (timer) {
                window.clearTimeout(timer);
            }

            timer = window.setTimeout(runDetection, 900);
        };

        window.addEventListener('hyzenpro-monetize-active', scheduleCheck);
        scheduleCheck();

        return () => {
            window.removeEventListener('hyzenpro-monetize-active', scheduleCheck);
            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, []);

    if (!showNotice) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="adblock-title">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600" aria-hidden="true">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 id="adblock-title" className="font-heading text-2xl text-black">Support HyzenPro</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-700">
                                Our website runs on ads to stay free. Please disable your ad blocker to support us.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.setItem(SESSION_KEY, '1');
                            setShowNotice(false);
                        }}
                        className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        aria-label="Dismiss adblock notice"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    >
                        I Disabled It, Reload
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.setItem(SESSION_KEY, '1');
                            setShowNotice(false);
                        }}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    >
                        Continue Anyway
                    </button>
                </div>
            </div>
        </div>
    );
}
