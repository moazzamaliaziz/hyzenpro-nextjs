import Footer from '@/components/layout/Footer';

export default function LoadingBlogPage() {
    return (
        <>
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb Skeleton */}
                    <div className="w-48 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-8" />

                    {/* Header Skeleton */}
                    <div className="text-center mb-12 flex flex-col items-center">
                        <div className="w-64 md:w-96 h-12 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4" />
                        <div className="w-full max-w-2xl h-16 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                    </div>

                    {/* Category Pills Skeleton */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="w-24 h-8 bg-gray-100 dark:bg-gray-900 rounded-full animate-pulse" />
                        ))}
                    </div>

                    {/* Posts Grid Skeleton */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[400px] bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col animate-pulse">
                                {/* Image */}
                                <div className="h-48 w-full bg-gray-100 dark:bg-gray-900" />
                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                                    </div>
                                    <div className="w-full h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                                    <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-900 rounded mb-1" />
                                    <div className="w-5/6 h-4 bg-gray-100 dark:bg-gray-900 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
