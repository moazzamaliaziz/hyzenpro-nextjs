import Link from 'next/link';

export default function NotFound() {
    return (
        <main id="main-content" className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-lg text-center">
                <p className="text-7xl font-bold font-heading text-gray-200 mb-4">404</p>
                <h1 className="text-2xl font-heading font-bold text-black mb-3">Page Not Found</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    The page you are looking for does not exist, has been moved, or is temporarily unavailable.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/ai-tools-directory/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-sm font-semibold rounded-lg hover:border-gray-400 transition-colors"
                    >
                        Browse AI Tools
                    </Link>
                    <Link
                        href="/blog/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-sm font-semibold rounded-lg hover:border-gray-400 transition-colors"
                    >
                        Read the Blog
                    </Link>
                </div>
            </div>
        </main>
    );
}
