import SentryTestButton from './SentryTestButton';

export const metadata = {
    title: 'Sentry Example',
    robots: {
        index: false,
        follow: false,
    },
};

export default function SentryExamplePage() {
    return (
        <main className="min-h-screen bg-white px-6 py-20 text-black dark:bg-gray-950 dark:text-gray-100">
            <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">
                    Sentry verification
                </p>
                <h1 className="mt-4 font-heading text-4xl text-black dark:text-white">Test the error reporting flow</h1>
                <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
                    Use this page after you set a real <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">NEXT_PUBLIC_SENTRY_DSN</code>.
                    Clicking the button below intentionally throws a client-side error so you can confirm that it appears
                    in your Sentry project.
                </p>
                <div className="mt-8">
                    <SentryTestButton />
                </div>
            </div>
        </main>
    );
}
