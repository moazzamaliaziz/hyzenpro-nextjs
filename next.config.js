/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove static export — we need server features (ISR, API routes, auth)
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'hyzenpro.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**.cdninstagram.com',
            },
        ],
    },

    trailingSlash: true,

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // 301 redirects for duplicate pages
    async redirects() {
        return [
            {
                source: '/about/',
                destination: '/about-us/',
                permanent: true,
            },
            {
                source: '/submit-tool/',
                destination: '/submit-ai-tool/',
                permanent: true,
            },
            {
                source: '/terms-conditions/',
                destination: '/terms-of-service/',
                permanent: true,
            },
            // Old ai-tools routes redirect to ai-tools-directory
            {
                source: '/ai-tools/',
                destination: '/ai-tools-directory/',
                permanent: true,
            },
            {
                source: '/ai-tools/categories/',
                destination: '/ai-tools-directory/',
                permanent: true,
            },
            {
                source: '/ai-tools/:category/',
                destination: '/ai-tools-directory/:category/',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
