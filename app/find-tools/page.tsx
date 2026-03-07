import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UseCaseWizard from '@/components/tools/UseCaseWizard';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Find the Perfect AI Tool — HyzenPro',
    description: 'Use our interactive wizard to discover the best AI tools for your specific needs. Filter by use case, budget, and popularity.',
};

export default function FindToolsPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-24 min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-black" />
                            Smart Recommendations
                        </div>
                        <h1 className="font-heading text-5xl md:text-6xl tracking-tight text-black mb-4">
                            Find Your Perfect Tool
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Answer a few quick questions and we'll match you with the best AI platforms for your specific workflow.
                        </p>
                    </div>

                    {/* Wizard */}
                    <UseCaseWizard />

                </div>
            </main>
            <Footer />
        </>
    );
}
