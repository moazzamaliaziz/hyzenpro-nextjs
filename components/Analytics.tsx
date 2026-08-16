'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5TJ4HMZL';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-MVKBDMQ060';
const AHREFS_KEY = '+e/O0CsIWRCxTAdUlRy5hA';

export default function Analytics() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load after 3 seconds or first user interaction
        const timer = setTimeout(() => setLoaded(true), 3000);

        const handleInteraction = () => {
            setLoaded(true);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        };

        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('scroll', handleInteraction, { once: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
        };
    }, []);

    if (!loaded) return null;

    return (
        <>
            {/* Google Tag Manager */}
            <Script
                id="gtm-script"
                dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
                }}
                strategy="lazyOnload"
            />

            {/* Google Analytics */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="lazyOnload"
            />
            <Script
                id="ga-config"
                dangerouslySetInnerHTML={{
                    __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
`,
                }}
                strategy="lazyOnload"
            />

            {/* Ahrefs Analytics */}
            <Script
                src="https://analytics.ahrefs.com/analytics.js"
                data-key={AHREFS_KEY}
                strategy="lazyOnload"
            />
        </>
    );
}
