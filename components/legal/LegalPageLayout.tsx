import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type LegalPageLayoutProps = {
    eyebrow: string;
    title: string;
    description: string;
    updatedLabel?: string;
    breadcrumbLabel: string;
    breadcrumbHref: string;
    children: ReactNode;
};

export default function LegalPageLayout({
    eyebrow,
    title,
    description,
    updatedLabel,
    breadcrumbLabel,
    breadcrumbHref,
    children,
}: LegalPageLayoutProps) {
    return (
        <>
            <main className="min-h-screen bg-white pb-20 pt-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: breadcrumbLabel, href: breadcrumbHref }]} className="mb-8" />

                    <header className="mb-12 border-b border-gray-200 pb-10">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">
                            {eyebrow}
                        </div>
                        <h1 className="font-heading text-4xl font-bold leading-tight text-black sm:text-5xl md:text-6xl">
                            {title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">{description}</p>
                        {updatedLabel && (
                            <p className="mt-4 text-sm font-semibold text-gray-500">{updatedLabel}</p>
                        )}
                    </header>

                    {children}
                </div>
            </main>
            <Footer />
        </>
    );
}
