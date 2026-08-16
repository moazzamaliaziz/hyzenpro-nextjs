import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/utils';
import AIToolsDirectoryPageContent from '@/components/pages/AIToolsDirectoryPageContent';

export const revalidate = 86400;

export function generateMetadata(): Metadata {
    const baseUrl = getBaseUrl();
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${baseUrl}/ai-tools-directory/` : `${baseUrl}/${loc}/ai-tools-directory/`;
    }
    languages['x-default'] = `${baseUrl}/ai-tools-directory/`;

    return {
        title: 'AI Tools Directory — Find & Compare the Best AI Tools in 2026',
        description:
            'Browse our comprehensive directory of AI tools. Filter by category, pricing, ratings, and features to find the perfect AI tool for your needs. Updated monthly with expert reviews.',
        keywords: ['AI tools', 'artificial intelligence', 'AI directory', 'AI software', 'AI tools comparison', 'best AI tools', 'AI tools 2026'],
        alternates: {
            canonical: `${baseUrl}/ai-tools-directory/`,
            languages,
        },
        openGraph: {
            url: `${baseUrl}/ai-tools-directory/`,
            title: 'AI Tools Directory — Find & Compare the Best AI Tools in 2026',
            description:
                'Browse our comprehensive directory of AI tools. Filter by category, pricing, ratings, and features to find the perfect AI tool for your needs.',
            type: 'website',
        },
    };
}

export default function AIToolsDirectoryPage() {
    return <AIToolsDirectoryPageContent />;
}
