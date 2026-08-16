import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import ContactPageContent from '@/components/pages/ContactPageContent';

export function generateMetadata(): Metadata {
    const baseUrl = getBaseUrl();
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${baseUrl}/contact/` : `${baseUrl}/${loc}/contact/`;
    }
    languages['x-default'] = `${baseUrl}/contact/`;

    return {
        title: 'Contact Us | HyzenPro',
        description:
            'Contact the HyzenPro team for partnerships, tool listing updates, support requests, or editorial inquiries.',
        keywords: [
            'contact hyzenpro',
            'hyzenpro support',
            'ai tool directory contact',
            'submit listing update',
            'hyzenpro partnership',
        ],
        openGraph: {
            url: `${baseUrl}/contact/`,
            title: 'Contact Us | HyzenPro',
            description:
                'Reach the HyzenPro team for support, listing updates, partnerships, media, or product inquiries.',
            type: 'website',
        },
        alternates: {
            canonical: `${baseUrl}/contact/`,
            languages,
        },
    };
}

export default function ContactPage() {
    return <ContactPageContent />;
}
