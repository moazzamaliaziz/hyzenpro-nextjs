import type { Metadata } from 'next';
import { absoluteUrl, getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import FindToolsPageContent from '@/components/pages/FindToolsPageContent';

export function generateMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = loc === 'en' ? `${baseUrl}/find-tools/` : `${baseUrl}/${loc}/find-tools/`;
  }
  languages['x-default'] = `${baseUrl}/find-tools/`;

  return {
    title: 'AI Tool Matcher | Find the Right AI Tool Faster | HyzenPro',
    description:
      'Use the HyzenPro AI Tool Matcher to find the right automation, coding, and caption tools based on your workflow, budget, and team needs.',
    alternates: {
      canonical: `${baseUrl}/find-tools/`,
      languages,
    },
    openGraph: {
      title: 'AI Tool Matcher | Find the Right AI Tool Faster',
      description:
        'Answer a few focused questions and get a sharper AI tool recommendation than a generic top-10 list.',
      type: 'website',
      url: `${baseUrl}/find-tools/`,
    },
  };
}

export default function FindToolsPage() {
  return <FindToolsPageContent />;
}
