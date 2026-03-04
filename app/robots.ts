import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';

    return {
        rules: [
            // AI Crawler Permissions
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'OAI-SearchBot', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'Claude-Web', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Google-Extended', allow: '/' },
            { userAgent: 'Googlebot', allow: '/' },
            { userAgent: 'bingbot', allow: '/' },
            { userAgent: 'CCBot', allow: '/' },
            { userAgent: 'Meta-ExternalAgent', allow: '/' },
            { userAgent: 'FacebookBot', allow: '/' },
            { userAgent: 'cohere-ai', allow: '/' },
            { userAgent: 'Amazonbot', allow: '/' },
            { userAgent: 'YouBot', allow: '/' },
            { userAgent: 'Applebot', allow: '/' },
            // Default rules
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/?s=',
                    '/author/',
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
