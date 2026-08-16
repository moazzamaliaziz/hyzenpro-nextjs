'use client';

export default function SentryTestButton() {
    return (
        <button
            type="button"
            onClick={() => {
                throw new Error('Sentry example page test error');
            }}
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
            Trigger test error
        </button>
    );
}
