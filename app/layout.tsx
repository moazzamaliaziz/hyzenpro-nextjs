import type { Metadata } from 'next';
import Script from 'next/script';
import { Outfit, Bebas_Neue } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { CompareProvider } from '@/components/compare/CompareContext';
import CompareDrawer from '@/components/compare/CompareDrawer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
});

const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';

import prisma from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
    let siteName = 'HyzenPro - Best AI Tools Directory & Reviews 2026';
    let faviconUrl = '/favicon.ico';

    try {
        const globalContent = await prisma.siteContent.findUnique({
            where: { sectionId: 'global-settings' }
        });
        if (globalContent?.content) {
            const settings = globalContent.content as any;
            if (settings.siteName) siteName = `${settings.siteName} - Best AI Tools Directory & Reviews 2026`;
            if (settings.faviconUrl) faviconUrl = settings.faviconUrl;
        }
    } catch (e) {
        console.error('Failed to load global-settings for metadata:', e);
    }

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: siteName,
            template: '%s | ' + (siteName.split('-')[0] || 'HyzenPro'),
        },
        description: 'Discover the best AI tools with expert reviews, detailed comparisons, and practical guidance. Find your perfect AI tool today.',
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
            siteName: siteName.split('-')[0].trim() || 'HyzenPro',
            title: siteName,
            description: 'Discover the best AI tools with expert reviews and comparisons.',
            images: [
                {
                    url: '/images/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: siteName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@hyzenpro',
            creator: '@hyzenpro',
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
        alternates: {
            canonical: siteUrl,
        },
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    return (
        <html
            lang="en"
            className={`${outfit.variable} ${bebasNeue.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* Google AdSense */}
                {adsenseId && (
                    <Script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                )}
            </head>
            <body className="font-body bg-white dark:bg-gray-950 text-black dark:text-gray-100 antialiased transition-colors duration-300">
                {/* Anti-flash script — runs before React hydrates */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('hyzenpro-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`
                    }}
                />
                {/* React Grab — visual element inspector for dev mode */}
                {process.env.NODE_ENV === 'development' && (
                    <Script
                        src="//unpkg.com/react-grab/dist/index.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}

                <SessionProvider>
                    <ThemeProvider>
                        <CompareProvider>
                            {children}
                            <CompareDrawer />
                        </CompareProvider>
                    </ThemeProvider>
                </SessionProvider>

                {/* Google Analytics */}
                {gaId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
                        </Script>
                    </>
                )}

                {/* Vercel Speed Insights */}
                <SpeedInsights />
            </body>
        </html>
    );
}
