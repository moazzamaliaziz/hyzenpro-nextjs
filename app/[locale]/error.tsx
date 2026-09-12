'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <main className="flex min-h-[60vh] items-center justify-center bg-background px-6 py-24 text-foreground">
            <div className="w-full max-w-xl rounded-3xl border border-foreground/10 bg-card p-8 text-center shadow-sm">
                <p className="text-xs uppercase tracking-widest text-foreground/50">Something went wrong</p>
                <h1 className="mt-4 font-serif text-3xl">We hit an unexpected error.</h1>
                <p className="mt-3 text-sm leading-7 text-foreground/60">
                    The issue has been reported so we can investigate it. You can try again, or head back to the homepage if the problem keeps happening.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-full border border-foreground/15 px-5 py-3 text-sm font-medium transition-colors hover:bg-foreground/5"
                    >
                        Go home
                    </a>
                </div>
            </div>
        </main>
    );
}