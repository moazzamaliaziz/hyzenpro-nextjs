import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';

    return {
        rules: [
            // Default rules — apply to all crawlers including AI bots
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/portal-auth/',
                    '/sentry-example-page/',
                    '/?s=',
                    '/trackback/',
                    '/feed/',
                    '/comments/',
                ],
            },
        ],
        sitemap: [
            `${siteUrl}/sitemap.xml`,
        ],
    };
}
