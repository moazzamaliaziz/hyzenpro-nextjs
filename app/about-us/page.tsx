import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import AboutUsContent from '@/components/site/AboutUsContent';

export function generateMetadata(): Metadata {
    const baseUrl = getBaseUrl();
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${baseUrl}/about-us/` : `${baseUrl}/${loc}/about-us/`;
    }
    languages['x-default'] = `${baseUrl}/about-us/`;

    return {
        title: 'About Us | HyzenPro',
        description: 'Meet HyzenPro, the AI tools directory and review platform helping creators, marketers, developers, and lean teams choose software with more clarity.',
        alternates: {
            canonical: `${baseUrl}/about-us/`,
            languages,
        },
        openGraph: {
            title: 'About Us | HyzenPro',
            description: 'Learn how HyzenPro reviews, compares, and explains AI tools for practical buying decisions.',
            url: `${baseUrl}/about-us/`,
            siteName: 'HyzenPro',
            type: 'website',
        },
    };
}

export default function AboutUsPage() {
    return (
        <LegalPageLayout
            eyebrow="About HyzenPro"
            title="Real Humans Behind Better AI Tool Shortlists"
            description="HyzenPro reviews, compares, and organizes AI tools so creators, marketers, founders, developers, and lean teams can choose software with less noise and more confidence."
            breadcrumbLabel="About Us"
            breadcrumbHref="/about-us/"
        >
            <AboutUsContent />
        </LegalPageLayout>
    );
}
