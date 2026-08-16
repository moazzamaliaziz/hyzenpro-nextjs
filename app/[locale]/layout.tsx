import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, localeNames, rtlLocales } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }) {
    const { locale } = await params;

    const alternates: Record<string, string> = {};
    for (const loc of routing.locales) {
        alternates[loc] = `${siteUrl}/${loc}/`;
    }
    alternates['x-default'] = `${siteUrl}/`;

    return {
        openGraph: {
            locale: locale === 'en' ? 'en_US' : locale,
        },
        alternates: {
            languages: alternates,
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();
    const isRtl = rtlLocales.includes(locale);

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <div dir={isRtl ? 'rtl' : 'ltr'} lang={locale}>
                {children}
            </div>
        </NextIntlClientProvider>
    );
}
