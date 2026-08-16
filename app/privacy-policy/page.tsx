import type { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import PrivacyPolicyContent from '@/components/legal/PrivacyPolicyContent';

export const metadata: Metadata = {
    title: 'Privacy Policy | HyzenPro',
    description: 'How HyzenPro collects, uses, shares, and protects information across our AI tools directory, blog, matcher, ads, and vendor services.',
    alternates: {
        canonical: '/privacy-policy/',
    },
    openGraph: {
        title: 'Privacy Policy | HyzenPro',
        description: 'How HyzenPro collects, uses, shares, and protects information across our AI tools directory.',
        url: '/privacy-policy/',
        siteName: 'HyzenPro',
        type: 'website',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout
            eyebrow="HyzenPro Legal"
            title="Privacy Policy"
            description="How HyzenPro collects, uses, and protects information across our AI tools directory, blog, matcher, ads, and vendor workflows."
            updatedLabel="Last updated: June 2, 2026"
            breadcrumbLabel="Privacy Policy"
            breadcrumbHref="/privacy-policy/"
        >
            <PrivacyPolicyContent />
        </LegalPageLayout>
    );
}
