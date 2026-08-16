import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';
import ContactPageContent from '@/components/pages/ContactPageContent';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/contact');

    return {
        title: 'Contact HyzenPro — Get in Touch',
        description: 'Contact HyzenPro for AI tool reviews, partnerships, advertising, or general inquiries.',
        alternates: { canonical, languages },
    };
}

export default async function LocaleContactPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <ContactPageContent />;
}
