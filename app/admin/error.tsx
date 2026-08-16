'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Admin Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
            <p className="text-white/50 text-sm">{error.message}</p>
            <button
                onClick={reset}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
            >
                Try again
            </button>
        </div>
    );
}
