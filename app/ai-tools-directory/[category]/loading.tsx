import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LoadingCategoryPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb Skeleton */}
                    <div className="w-48 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-8" />

                    {/* Header Skeleton */}
                    <div className="text-center mb-12 flex flex-col items-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse mb-4" />
                        {/* Title */}
                        <div className="w-64 md:w-96 h-12 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4" />
                        {/* Subtitle */}
                        <div className="w-full max-w-2xl h-16 bg-gray-100 dark:bg-gray-900 rounded animate-pulse mb-4" />
                        {/* Count */}
                        <div className="w-32 h-4 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                    </div>

                    {/* Layout Split Skeleton */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Skeleton */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <div className="h-96 w-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
                        </div>

                        {/* Grid Skeleton */}
                        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="h-[400px] bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col animate-pulse">
                                    <div className="h-48 w-full bg-gray-100 dark:bg-gray-900 rounded-xl mb-4" />
                                    <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-900 rounded mb-1" />
                                    <div className="w-5/6 h-4 bg-gray-100 dark:bg-gray-900 rounded mb-4" />
                                    <div className="mt-auto flex justify-between items-center">
                                        <div className="w-16 h-8 bg-gray-100 dark:bg-gray-900 rounded-full" />
                                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
