const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const recategorizedToolRedirects = [
    {
        source: '/ai-tools-directory/ai-writing-tools/claude-4-7-opus/',
        destination: '/ai-tools-directory/ai-chatbots/claude-4-7-opus/',
    },
    {
        source: '/ai-tools-directory/ai-automation-tools/claude-4-5-haiku/',
        destination: '/ai-tools-directory/ai-chatbots/claude-4-5-haiku/',
    },
    {
        source: '/ai-tools-directory/ai-automation-tools/gemini-flash/',
        destination: '/ai-tools-directory/ai-chatbots/gemini-flash/',
    },
    {
        source: '/ai-tools-directory/ai-writing-tools/gpt-3/',
        destination: '/ai-tools-directory/ai-chatbots/gpt-3/',
    },
    {
        source: '/ai-tools-directory/ai-writing-tools/gpt-3-5-turbo/',
        destination: '/ai-tools-directory/ai-chatbots/gpt-3-5-turbo/',
    },
    {
        source: '/ai-tools-directory/ai-coding-tools/gpt-4/',
        destination: '/ai-tools-directory/ai-chatbots/gpt-4/',
    },
].map((redirect) => ({ ...redirect, permanent: true }));

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', '@lobehub/icons', '@lobehub/ui'],
    },
    turbopack: {
        root: __dirname,
    },
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
            {
                protocol: 'https',
                hostname: '*.r2.dev',
            },
            {
                protocol: 'https',
                hostname: 'media.hyzenpro.com',
            },
            {
                protocol: 'https',
                hostname: '*.cloudflarestorage.com',
            },
        ],
    },

    trailingSlash: true,
    skipTrailingSlashRedirect: true,

    // Security headers
    async headers() {
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://pagead2.googlesyndication.com https://js.sentry-cdn.com https://browser.sentry-cdn.com https://*.vercel-insights.com https://va.vercel-scripts.com https://challenges.cloudflare.com https://analytics.ahrefs.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: https://*.googleusercontent.com https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://logo.clearbit.com https://cdn.sanity.io https://*.r2.dev https://media.hyzenpro.com https://*.cloudflarestorage.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://*.sentry.io https://*.ingest.sentry.io https://*.vercel-insights.com https://challenges.cloudflare.com https://analytics.ahrefs.com",
            "frame-src 'self' https://www.youtube.com https://platform.twitter.com https://syndication.twitter.com https://www.google.com https://challenges.cloudflare.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ');

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
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: csp,
                    },
                ],
            },
        ];
    },

    // 301 redirects
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
            {
                source: '/terms-and-conditions/',
                destination: '/terms-of-service/',
                permanent: true,
            },
            {
                source: '/compare/',
                destination: '/compare/tools/',
                permanent: true,
            },
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
            // ── WordPress legacy redirects (Google 404 fix) ──────────────────
            {
                source: '/home/',
                destination: '/',
                permanent: true,
            },
            {
                source: '/feed/',
                destination: '/feed.xml/',
                permanent: true,
            },
            {
                source: '/ai-tool-directory/:path*',
                destination: '/ai-tools-directory/:path*',
                permanent: true,
            },
            {
                source: '/how-we-test',
                destination: '/how-we-test/',
                permanent: true,
            },
            {
                source: '/tag/:slug/',
                destination: '/blog/',
                permanent: true,
            },
            {
                source: '/category/:slug/',
                destination: '/blog/',
                permanent: true,
            },
            {
                source: '/author/:slug/',
                destination: '/blog/',
                permanent: true,
            },
            {
                source: '/2025/:path*',
                destination: '/blog/',
                permanent: true,
            },
            {
                source: '/2026/:path*',
                destination: '/blog/',
                permanent: true,
            },
            {
                source: '/cookie-policy/',
                destination: '/privacy-policy/',
                permanent: true,
            },
            {
                source: '/dmca-policy/',
                destination: '/terms-of-service/',
                permanent: true,
            },
            {
                source: '/affiliate-disclosure/',
                destination: '/terms-of-service/',
                permanent: true,
            },
            {
                source: '/:slug/feed/',
                destination: '/blog/',
                permanent: true,
            },
            // ── Blog post legacy redirects (WordPress slugs → /blog/) ───────────
            {
                source: '/kapwing-review/',
                destination: '/blog/kapwing-review/',
                permanent: true,
            },
            {
                source: '/submagic-review/',
                destination: '/blog/submagic-review/',
                permanent: true,
            },
            {
                source: '/zubtitle-review/',
                destination: '/blog/zubtitle-review/',
                permanent: true,
            },
            {
                source: '/animaker-review/',
                destination: '/blog/animaker-review/',
                permanent: true,
            },
            {
                source: '/autocut-review/',
                destination: '/blog/autocut-review/',
                permanent: true,
            },
            {
                source: '/jasper-review-2026/',
                destination: '/blog/jasper-review-2026/',
                permanent: true,
            },
            {
                source: '/liquid-ai-review/',
                destination: '/blog/liquid-ai-review/',
                permanent: true,
            },
            {
                source: '/captions-ai-review/',
                destination: '/blog/captions-ai-review/',
                permanent: true,
            },
            {
                source: '/veed-io-review/',
                destination: '/blog/veed-io-review/',
                permanent: true,
            },
            {
                source: '/descript-review/',
                destination: '/blog/descript-review/',
                permanent: true,
            },
            {
                source: '/clipchamp-review/',
                destination: '/blog/clipchamp-review/',
                permanent: true,
            },
            {
                source: '/headliner-review/',
                destination: '/blog/headliner-review/',
                permanent: true,
            },
            {
                source: '/replit-ai-agent-review/',
                destination: '/blog/replit-ai-agent-review/',
                permanent: true,
            },
            {
                source: '/best-ai-coding-assistants-2026/',
                destination: '/blog/best-ai-coding-assistants-2026/',
                permanent: true,
            },
            {
                source: '/how-to-build-and-monetize-web-apps-with-ai/',
                destination: '/blog/how-to-build-and-monetize-web-apps-with-ai/',
                permanent: true,
            },
            {
                source: '/submagic-vs-veed/',
                destination: '/blog/submagic-vs-veed/',
                permanent: true,
            },
            {
                source: '/why-ai-productivity-tools-are-making-your-work-harder/',
                destination: '/blog/why-ai-productivity-tools-are-making-your-work-harder/',
                permanent: true,
            },
            {
                source: '/what-is-elevenlabs/',
                destination: '/blog/what-is-elevenlabs/',
                permanent: true,
            },
            {
                source: '/10-best-ai-writing-tools-2026/',
                destination: '/blog/10-best-ai-writing-tools-2026/',
                permanent: true,
            },
            {
                source: '/claude-4-5-vs-gpt-5-2-thinking/',
                destination: '/blog/claude-4-5-vs-gpt-5-2-thinking/',
                permanent: true,
            },
            {
                source: '/elevenlabs-vs-lovo/',
                destination: '/blog/elevenlabs-vs-lovo/',
                permanent: true,
            },
            {
                source: '/submagic-vs-veed-io-vs-captions-ai/',
                destination: '/blog/submagic-vs-veed-io-vs-captions-ai/',
                permanent: true,
            },
            {
                source: '/jasper-ai-vs-writesonic-vs-copy-ai/',
                destination: '/blog/jasper-ai-vs-writesonic-vs-copy-ai/',
                permanent: true,
            },
            {
                source: '/cursor-ai-vs-github-copilot-vs-claude-code/',
                destination: '/blog/cursor-ai-vs-github-copilot-vs-claude-code/',
                permanent: true,
            },
            {
                source: '/descript-review-2026/',
                destination: '/blog/descript-review-2026/',
                permanent: true,
            },
            {
                source: '/copy-ai-vs-jasper-comparison/',
                destination: '/blog/copy-ai-vs-jasper-comparison/',
                permanent: true,
            },
            {
                source: '/midjourney-vs-dall-e-3-vs-stable-diffusion/',
                destination: '/blog/midjourney-vs-dall-e-3-vs-stable-diffusion/',
                permanent: true,
            },
            {
                source: '/leonardo-ai-vs-midjourney/',
                destination: '/blog/leonardo-ai-vs-midjourney/',
                permanent: true,
            },
            {
                source: '/10-best-ai-image-generators-2026/',
                destination: '/blog/10-best-ai-image-generators-2026/',
                permanent: true,
            },
            {
                source: '/10-best-ai-caption-generator-tools/',
                destination: '/blog/10-best-ai-caption-generator-tools/',
                permanent: true,
            },
            {
                source: '/ai-agents-and-workflow-automation/',
                destination: '/blog/ai-agents-and-workflow-automation/',
                permanent: true,
            },
            // Legacy alias slugs → canonical
            {
                source: '/submagic-review-2025-best-ai-caption-tool-for-shorts-reels/',
                destination: '/blog/submagic-review/',
                permanent: true,
            },
            {
                source: '/veedio-review-2025-is-this-ai-powered-online-video-editor-worth-it/',
                destination: '/blog/veed-io-review/',
                permanent: true,
            },
            {
                source: '/10-best-ai-caption-generator-tools-for-creators-in-2025/',
                destination: '/blog/10-best-ai-caption-generator-tools/',
                permanent: true,
            },
            {
                source: '/why-ai-productivity-tools-are-making-your-work-harder-not-easier-in-2025/',
                destination: '/blog/why-ai-productivity-tools-are-making-your-work-harder/',
                permanent: true,
            },
            {
                source: '/what-is-elevenlabs-the-complete-guide-to-the-worlds-best-ai-voice-platform/',
                destination: '/blog/what-is-elevenlabs/',
                permanent: true,
            },
            {
                source: '/claude-4-5-vs-gpt-5-2-thinking-the-battle-for-ai-reasoning-supremacy-in-2026/',
                destination: '/blog/claude-4-5-vs-gpt-5-2-thinking/',
                permanent: true,
            },
            {
                source: '/submagic-vs-veed-io-vs-captions-ai-the-ultimate-ai-caption-tool-showdown-2026/',
                destination: '/blog/submagic-vs-veed-io-vs-captions-ai/',
                permanent: true,
            },
            {
                source: '/jasper-ai-vs-writesonic-vs-copy-ai-choosing-the-best-ai-marketing-suite-in-2026/',
                destination: '/blog/jasper-ai-vs-writesonic-vs-copy-ai/',
                permanent: true,
            },
            {
                source: '/cursor-ai-vs-github-copilot-vs-claude-code-which-ai-coding-assistant-wins-in-2026/',
                destination: '/blog/cursor-ai-vs-github-copilot-vs-claude-code/',
                permanent: true,
            },
            {
                source: '/03-descript-review-2026/',
                destination: '/blog/descript-review-2026/',
                permanent: true,
            },
            {
                source: '/best-ai-coding-assistants-in-2025/',
                destination: '/blog/best-ai-coding-assistants-2026/',
                permanent: true,
            },
            {
                source: '/top-5-best-frontier-ai-models-in-2026-gpt-55-claude-gemini-more/',
                destination: '/blog/top-5-frontier-ai-models-2026/',
                permanent: true,
            },
            {
                source: '/cursor-composer-25-review-frontier-level-ai-coding-at-055-per-task/',
                destination: '/blog/cursor-composer-2-5-review/',
                permanent: true,
            },
            // Dedicated blog pages (no /blog/ prefix in old WP)
            {
                source: '/claude-sonnet-5-review/',
                destination: '/blog/claude-sonnet-5-review/',
                permanent: true,
            },
            {
                source: '/cursor-composer-2-5-review/',
                destination: '/blog/cursor-composer-2-5-review/',
                permanent: true,
            },
            {
                source: '/google-antigravity-2-review/',
                destination: '/blog/google-antigravity-2-review/',
                permanent: true,
            },
            {
                source: '/claude-opus-4-8-vs-gpt-5-5-coding-benchmark/',
                destination: '/blog/claude-opus-4-8-vs-gpt-5-5-coding-benchmark/',
                permanent: true,
            },
            {
                source: '/claude-fable-5-mythos-5/',
                destination: '/blog/claude-fable-5-mythos-5/',
                permanent: true,
            },
            {
                source: '/top-5-frontier-ai-models-2026/',
                destination: '/blog/top-5-frontier-ai-models-2026/',
                permanent: true,
            },
            {
                source: '/sakana-fugu-review-japan-multi-agent-ai-2026/',
                destination: '/blog/sakana-fugu-review-japan-multi-agent-ai-2026/',
                permanent: true,
            },
            {
                source: '/gpt-5-6-sol-preview/',
                destination: '/blog/gpt-5-6-sol-preview/',
                permanent: true,
            },
            // June 2026 productivity cluster
            {
                source: '/best-ai-productivity-automation-tools-for-business/',
                destination: '/blog/best-ai-productivity-automation-tools-for-business/',
                permanent: true,
            },
            {
                source: '/best-ai-productivity-tools-for-small-business/',
                destination: '/blog/best-ai-productivity-tools-for-small-business/',
                permanent: true,
            },
            {
                source: '/best-ai-automation-tools-for-business/',
                destination: '/blog/best-ai-automation-tools-for-business/',
                permanent: true,
            },
            // Agentic tools blog reviews
            {
                source: '/manus-ai-review/',
                destination: '/blog/manus-ai-review/',
                permanent: true,
            },
            {
                source: '/hermes-agent-review/',
                destination: '/blog/hermes-agent-review/',
                permanent: true,
            },
            {
                source: '/openclaw-review/',
                destination: '/blog/openclaw-review/',
                permanent: true,
            },
            ...recategorizedToolRedirects,
        ];
    },
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: process.env.SENTRY_ORG || 'hyzenpro',
    project: process.env.SENTRY_PROJECT || 'sentry-emerald-school',
    telemetry: false,
    silent: !process.env.CI,
    sourcemaps: {
        deleteSourcemapsAfterUpload: false,
    },
});
