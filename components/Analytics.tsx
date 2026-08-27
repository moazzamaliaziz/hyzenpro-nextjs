'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5TJ4HMZL';
const AHREFS_KEY = '+e/O0CsIWRCxTAdUlRy5hA';

export default function Analytics() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load after the initial render window or the first deliberate interaction.
        // Avoid using scroll as a trigger because automated and touch scrolling can
        // compete with the page's first meaningful paint.
        const timer = window.setTimeout(() => setLoaded(true), 8000);

        const handleInteraction = () => {
            setLoaded(true);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction, { once: true });
        window.addEventListener('keydown', handleInteraction, { once: true });

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
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

            {/* Ahrefs Analytics */}
            <Script
                src="https://analytics.ahrefs.com/analytics.js"
                data-key={AHREFS_KEY}
                strategy="lazyOnload"
            />
        </>
    );
}
