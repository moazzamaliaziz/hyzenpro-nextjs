import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getAlternateLinks } from '@/lib/locale-helpers';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import AboutUsContent from '@/components/site/AboutUsContent';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { canonical, languages } = getAlternateLinks(locale, '/about');

    return {
        title: 'About Us | HyzenPro',
        description: 'Meet HyzenPro, the AI tools directory and review platform helping creators, marketers, developers, and lean teams choose software with more clarity.',
        alternates: { canonical, languages },
    };
}

export default async function LocaleAboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

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
