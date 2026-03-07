import type { Metadata } from 'next';
import Script from 'next/script';
import { Outfit, Bebas_Neue } from 'next/font/google';
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

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'HyzenPro - Best AI Tools Directory & Reviews 2026',
        template: '%s | HyzenPro',
    },
    description:
        'Discover the best AI tools with expert reviews, detailed comparisons, and practical guidance. Find your perfect AI tool today.',
    keywords: [
        'AI tools',
        'AI directory',
        'AI reviews',
        'artificial intelligence',
        'AI software',
        'best AI tools 2026',
    ],
    authors: [{ name: 'HyzenPro Team' }],
    creator: 'HyzenPro',
    publisher: 'HyzenPro',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        siteName: 'HyzenPro',
        title: 'HyzenPro - Best AI Tools Directory & Reviews',
        description:
            'Discover the best AI tools with expert reviews and comparisons.',
        images: [
            {
                url: '/images/og-default.jpg',
                width: 1200,
                height: 630,
                alt: 'HyzenPro - AI Tools Directory',
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
    verification: {
        // Add google/bing/yandex verification codes here
        // google: 'your-google-verification-code',
    },
};

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
            <body className="font-body bg-white text-black antialiased">
                {/* React Grab — visual element inspector for dev mode */}
                {process.env.NODE_ENV === 'development' && (
                    <Script
                        src="//unpkg.com/react-grab/dist/index.global.js"
                        crossOrigin="anonymous"
                        strategy="beforeInteractive"
                    />
                )}

                {children}

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
            </body>
        </html>
    );
}
