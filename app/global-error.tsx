'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
        <html lang="en">
            <body className="font-body bg-white text-black dark:bg-gray-950 dark:text-gray-100">
                <main className="min-h-screen px-6 py-16 flex items-center justify-center">
                    <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">
                            Something went wrong
                        </p>
                        <h1 className="mt-4 font-heading text-3xl text-black dark:text-white">
                            We hit an unexpected error.
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                            The issue has been reported so we can investigate it. You can try again, or head back to the
                            homepage if the problem keeps happening.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={reset}
                                className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Try again
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-black transition-colors hover:border-black dark:border-gray-700 dark:text-white dark:hover:border-white"
                            >
                                Go home
                            </a>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
