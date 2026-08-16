import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Compare AI Tools Side by Side | HyzenPro',
    description:
        'Compare AI tools across features, pricing, limitations, and practical workflow fit before you commit.',
    alternates: {
        canonical: 'https://hyzenpro.com/compare/tools/',
    },
    openGraph: {
        title: 'Compare AI Tools Side by Side | HyzenPro',
        description:
            'Compare AI tools across features, pricing, limitations, and practical workflow fit before you commit.',
        url: 'https://hyzenpro.com/compare/tools/',
        siteName: 'HyzenPro',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Compare AI Tools Side by Side | HyzenPro',
        description:
            'Compare AI tools across features, pricing, limitations, and practical workflow fit before you commit.',
    },
};

export default function CompareLayout({ children }: { children: ReactNode }) {
    return children;
}
