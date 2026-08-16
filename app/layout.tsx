import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Instrument_Serif } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { headers } from 'next/headers';
import { SessionProvider } from 'next-auth/react';
import AdBlockGuard from '@/components/ads/AdBlockGuard';
import CookieConsent from '@/components/site/CookieConsent';
import { CompareProvider } from '@/components/compare/CompareContext';
import ClientCompareDrawer from '@/components/compare/ClientCompareDrawer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Header from '@/components/Header/Header';
import AnnouncementBar from '@/components/site/AnnouncementBar';
import Analytics from '@/components/Analytics';
import { routing } from '@/i18n/routing';
import {
    DEFAULT_SITE_FAVICON_URL,
    DEFAULT_SITE_SHARE_IMAGE_URL,
} from '@/lib/branding';
import prisma from '@/lib/prisma';
import { getMetadataBrandName } from '@/lib/seo-titles';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5TJ4HMZL';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: '400' });

export async function generateMetadata(): Promise<Metadata> {
    let siteName = 'HyzenPro - Best AI Tools Directory & Reviews 2026';
    let faviconUrl = DEFAULT_SITE_FAVICON_URL;

    try {
        const globalContent = await prisma.siteContent.findUnique({
            where: { sectionId: 'global-settings' },
        });

        if (globalContent?.content) {
            const settings = globalContent.content as any;
            if (settings.siteName) siteName = `${settings.siteName} - Best AI Tools Directory & Reviews 2026`;
            if (settings.faviconUrl && !['/favicon.ico', '/favicon.png'].includes(settings.faviconUrl)) {
                faviconUrl = settings.faviconUrl;
            }
        }
    } catch (error) {
        console.error('Failed to load global-settings for metadata:', error);
    }

    const brandName = getMetadataBrandName(siteName);

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: siteName,
            template: `%s | ${brandName}`,
        },
        description: 'Independent reviews and side-by-side comparisons of the best AI tools for creators, marketers, developers and small teams. Reader-funded — never pay-to-play.',
        keywords: ['AI tools', 'AI directory', 'AI reviews', 'artificial intelligence', 'AI software', 'best AI tools 2026'],
        icons: {
            icon: faviconUrl,
            shortcut: faviconUrl,
            apple: faviconUrl,
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: siteUrl,
            siteName: brandName,
            title: siteName,
            description: 'Independent reviews and side-by-side comparisons of the best AI tools for creators, marketers, developers and small teams. Reader-funded — never pay-to-play.',
            images: [
                {
                    url: DEFAULT_SITE_SHARE_IMAGE_URL,
                    width: 1200,
                    height: 1200,
                    alt: siteName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@hyzenpro',
            creator: '@hyzenpro',
            images: [DEFAULT_SITE_SHARE_IMAGE_URL],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headersList = await headers();
    const headerLocale = headersList.get('x-locale');
    const locale = (headerLocale && routing.locales.includes(headerLocale as any)) ? headerLocale : 'en';
    const messages = (await import(`../messages/${locale}/common.json`)).default;

    return (
        <html lang={locale} className="light" {...{ 'xml:lang': locale }}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {adsenseClient && (
                    <>
                        <Script
                            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
                            strategy="lazyOnload"
                            crossOrigin="anonymous"
                        />
                        <meta name="google-adsense-account" content={adsenseClient} />
                    </>
                )}
            </head>
            <body className={`${inter.variable} ${instrumentSerif.variable} bg-background text-foreground antialiased gradient-backdrop`}>
                {gtmId && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                        />
                    </noscript>
                )}
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>

                {process.env.NODE_ENV === 'development' && (
                    <Script
                        src="//unpkg.com/react-grab/dist/index.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}

                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SessionProvider>
                        <ThemeProvider>
                            <CompareProvider>
                                <AnnouncementBar />
                                <Header />
                                {children}
                                <ClientCompareDrawer />
                                <AdBlockGuard />
                                <CookieConsent />
                            </CompareProvider>
                        </ThemeProvider>
                    </SessionProvider>
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    );
}
