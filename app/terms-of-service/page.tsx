import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import TermsOfServiceContent from '@/components/legal/TermsOfServiceContent';

export const metadata: Metadata = {
    title: 'Terms of Service | HyzenPro',
    description: 'Terms and conditions for using HyzenPro, including AI tool listings, reviews, comparisons, forms, advertising, and vendor submissions.',
    alternates: {
        canonical: '/terms-of-service/',
    },
    openGraph: {
        title: 'Terms of Service | HyzenPro',
        description: 'Terms and conditions for using HyzenPro and its AI tool directory services.',
        url: '/terms-of-service/',
        siteName: 'HyzenPro',
        type: 'website',
    },
};

export default function TermsOfServicePage() {
    return (
        <LegalPageLayout
            eyebrow="HyzenPro Legal"
            title="Terms of Service"
            description="The rules for using HyzenPro content, AI tool listings, recommendation experiences, vendor submissions, advertising placements, and related services."
            updatedLabel="Last updated: June 2, 2026"
            breadcrumbLabel="Terms of Service"
            breadcrumbHref="/terms-of-service/"
        >
            <TermsOfServiceContent />
        </LegalPageLayout>
    );
}
