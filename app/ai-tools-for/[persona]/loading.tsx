import Footer from '@/components/layout/Footer';

export default function LoadingPersonaPage() {
    return (
        <>
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Breadcrumb Skeleton */}
                    <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-8" />

                    {/* Hero Skeleton */}
                    <div className="text-center mb-16">
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mb-4 mx-auto" />
                        <div className="w-96 h-14 bg-gray-200 rounded-lg animate-pulse mb-6 mx-auto" />
                        <div className="w-full max-w-3xl h-20 bg-gray-100 rounded animate-pulse mx-auto" />
                    </div>

                    {/* Pain Points Skeleton */}
                    <div className="mb-16">
                        <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-8" />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                                    <div className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
                                    <div className="w-full h-12 bg-gray-100 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tools Grid Skeleton */}
                    <div className="mb-16">
                        <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-8" />
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="h-[300px] bg-white rounded-2xl border border-gray-200 p-5 flex flex-col animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="w-24 h-5 bg-gray-200 rounded mb-1" />
                                            <div className="w-12 h-3 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-full h-10 bg-gray-100 rounded mb-2" />
                                    <div className="w-5/6 h-4 bg-gray-100 rounded mb-4" />
                                    <div className="mt-auto flex justify-between items-center">
                                        <div className="w-16 h-6 bg-gray-100 rounded-full" />
                                        <div className="w-20 h-6 bg-gray-200 rounded-full" />
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
