/**
 * Live Site Scraper for HyzenPro.com
 * Extracts all blog posts and AI tools from the live WordPress site
 * and creates migration-ready JSON data.
 */

import fs from 'fs';
import https from 'https';
import http from 'http';

// ============================================================
// HTTP Fetcher
// ============================================================
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 HyzenPro Migrator' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// ============================================================
// HTML Text Extractor helpers
// ============================================================
function stripTags(html) {
    return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').trim();
}

function extractMeta(html, property) {
    const re = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
    const m = html.match(re);
    if (m) return m[1];
    // Try reverse order
    const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i');
    const m2 = html.match(re2);
    return m2 ? m2[1] : '';
}

function extractOgImage(html) {
    return extractMeta(html, 'og:image');
}

// ============================================================
// BLOG POST URLS (scraped from live site)
// ============================================================
const BLOG_URLS = [
    // Page 1
    'https://hyzenpro.com/10-best-ai-image-generators-2026/',
    'https://hyzenpro.com/leonardo-ai-vs-midjourney/',
    'https://hyzenpro.com/midjourney-vs-dall-e-3-vs-stable-diffusion/',
    'https://hyzenpro.com/copy-ai-vs-jasper-comparison/',
    'https://hyzenpro.com/03-descript-review-2026/',
    'https://hyzenpro.com/jasper-review-2026/',
    'https://hyzenpro.com/01-copy-ai-review-2026/',
    'https://hyzenpro.com/cursor-ai-vs-github-copilot-vs-claude-code-which-ai-coding-assistant-wins-in-2026/',
    'https://hyzenpro.com/jasper-ai-vs-writesonic-vs-copy-ai-choosing-the-best-ai-marketing-suite-in-2026/',
    // Page 2
    'https://hyzenpro.com/submagic-vs-veed-io-vs-captions-ai-the-ultimate-ai-caption-tool-showdown-2026/',
    'https://hyzenpro.com/elevenlabs-vs-lovo/',
    'https://hyzenpro.com/claude-4-5-vs-gpt-5-2-thinking-the-battle-for-ai-reasoning-supremacy-in-2026/',
    'https://hyzenpro.com/10-best-ai-writing-tools-2026/',
    'https://hyzenpro.com/liquid-ai-review/',
    'https://hyzenpro.com/what-is-elevenlabs-the-complete-guide-to-the-worlds-best-ai-voice-platform/',
    'https://hyzenpro.com/why-ai-productivity-tools-are-making-your-work-harder-not-easier-in-2025/',
    'https://hyzenpro.com/submagic-vs-veed/',
    // Page 3
    'https://hyzenpro.com/how-to-build-and-monetize-web-apps-with-ai/',
    'https://hyzenpro.com/best-ai-coding-assistants-in-2025/',
    'https://hyzenpro.com/replit-ai-agent-review/',
    'https://hyzenpro.com/ai-agents-and-workflow-automation/',
    'https://hyzenpro.com/headliner-review/',
    'https://hyzenpro.com/clipchamp-review/',
    'https://hyzenpro.com/descript-review/',
    'https://hyzenpro.com/autocut-review/',
    'https://hyzenpro.com/animaker-review/',
    // Page 4
    'https://hyzenpro.com/kapwing-review/',
    'https://hyzenpro.com/zubtitle-review/',
    'https://hyzenpro.com/captions-ai-review/',
    'https://hyzenpro.com/veed-io-review/',
    'https://hyzenpro.com/submagic-review/',
    'https://hyzenpro.com/10-best-ai-caption-generator-tools/',
];

// ============================================================
// AI TOOL URLS (scraped from live site directory)
// ============================================================
const TOOL_URLS = [
    'https://hyzenpro.com/ai-tools-directory/ai-video-tools/submajic/',
    'https://hyzenpro.com/ai-tools-directory/ai-coding-tools/github-copilot/',
    'https://hyzenpro.com/ai-tools-directory/ai-marketing-tools/make/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/jasper/',
    'https://hyzenpro.com/ai-tools-directory/ai-coding-tools/tabnine/',
    'https://hyzenpro.com/ai-tools-directory/ai-video-tools/veed-io/',
    'https://hyzenpro.com/ai-tools-directory/ai-image-tools/canva-magic-studio/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/zapier/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/lindy-ai/',
    'https://hyzenpro.com/ai-tools-directory/ai-video-tools/captions-ai/',
    'https://hyzenpro.com/ai-tools-directory/ai-marketing-tools/hubspot-smart-crm/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/n8n/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/gamma/',
    'https://hyzenpro.com/ai-tools-directory/ai-automation-tools/uipath/',
    'https://hyzenpro.com/ai-tools-directory/ai-coding-tools/replit/',
    'https://hyzenpro.com/ai-tools-directory/ai-design-tools/deepswapface/',
    'https://hyzenpro.com/ai-tools-directory/ai-image-tools/ai-jewelry-model/',
    'https://hyzenpro.com/ai-tools-directory/ai-writing-tools/zerogpt-plus/',
    'https://hyzenpro.com/ai-tools-directory/ai-image-tools/sketchready/',
    'https://hyzenpro.com/ai-tools-directory/ai-general-tools/liquid-ai/',
    'https://hyzenpro.com/ai-tools-directory/ai-general-tools/chinese-name-generator/',
    'https://hyzenpro.com/ai-tools-directory/ai-general-tools/magicblocks/',
    'https://hyzenpro.com/ai-tools-directory/ai-writing-tools/gpthumanizer-ai/',
    'https://hyzenpro.com/ai-tools-directory/seo-tools/seobot/',
];

// ============================================================
// SCRAPE A BLOG POST
// ============================================================
async function scrapeBlogPost(url) {
    try {
        const html = await fetchUrl(url);
        const slug = url.replace('https://hyzenpro.com/', '').replace(/\/$/, '');

        // Title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        let title = titleMatch ? stripTags(titleMatch[1]).replace(/ \|.*$/, '').replace(/ - .*$/, '') : slug;

        // OG Title (often cleaner)
        const ogTitle = extractMeta(html, 'og:title');
        if (ogTitle) title = stripTags(ogTitle).replace(/ \|.*$/, '').replace(/ - .*$/, '');

        // Description
        const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';

        // Featured image
        const featuredImage = extractOgImage(html) || '';

        // Date
        const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
        const publishedAt = dateMatch ? dateMatch[1] : '';

        // Category from breadcrumbs or article classes
        const catMatch = html.match(/\/category\/([^/"]+)\//);
        const category = catMatch ? catMatch[1] : 'blog';

        // Content — extract from article/entry-content
        let content = '';
        const contentMatch = html.match(/<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/article>|<div[^>]*class=["'][^"']*(?:post-navigation|related-posts|comments))/i);
        if (contentMatch) {
            content = contentMatch[1].trim();
        } else {
            // Fallback: try article tag
            const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            if (articleMatch) {
                content = articleMatch[1].trim();
            }
        }

        // Extract excerpt (first paragraph)
        const excerptMatch = content.match(/<p[^>]*>([^<]{20,})<\/p>/i);
        const excerpt = excerptMatch ? stripTags(excerptMatch[1]).substring(0, 300) : description.substring(0, 300);

        console.log(`  ✅ Blog: ${title}`);
        return {
            title,
            slug,
            content,
            excerpt: excerpt || description,
            featuredImage,
            status: 'published',
            author: 'HyzenPro Team',
            categories: [category],
            tags: [],
            metaTitle: ogTitle || title,
            metaDescription: description,
            publishedAt: publishedAt || new Date().toISOString(),
            updatedAt: publishedAt || new Date().toISOString(),
        };
    } catch (err) {
        console.log(`  ❌ Failed: ${url} — ${err.message}`);
        return null;
    }
}

// ============================================================
// SCRAPE AN AI TOOL
// ============================================================
async function scrapeAiTool(url) {
    try {
        const html = await fetchUrl(url);
        const parts = url.replace('https://hyzenpro.com/ai-tools-directory/', '').replace(/\/$/, '').split('/');
        const categorySlug = parts[0] || 'ai-general-tools';
        const slug = parts[1] || parts[0];

        // Name from title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        let name = titleMatch ? stripTags(titleMatch[1]).replace(/ \|.*$/, '').replace(/ - .*$/, '').replace(/ Review.*$/i, '') : slug;

        // OG Title
        const ogTitle = extractMeta(html, 'og:title');
        if (ogTitle) name = stripTags(ogTitle).replace(/ \|.*$/, '').replace(/ - .*$/, '').replace(/ Review.*$/i, '');

        // Description
        const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';

        // Logo/icon
        const logoMatch = html.match(/<img[^>]*class=["'][^"']*tool[^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
            html.match(/<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*tool[^"']*logo[^"']*["']/i);
        let logo = logoMatch ? logoMatch[1] : '';
        if (!logo) {
            const ogImg = extractOgImage(html);
            if (ogImg) logo = ogImg;
        }

        // Featured image
        const featuredImage = extractOgImage(html) || '';

        // Website URL (look for "Visit" link)
        const visitMatch = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>[^<]*Visit[^<]*<\/a>/i);
        const websiteUrl = visitMatch ? visitMatch[1] : '';

        // Pricing
        const pricingMatch = html.match(/(?:pricing|plan|price)[^>]*>([^<]*(?:free|freemium|paid|trial)[^<]*)/i);
        let pricingType = 'freemium';
        if (pricingMatch) {
            const pt = pricingMatch[1].toLowerCase();
            if (pt.includes('free trial')) pricingType = 'free-trial';
            else if (pt.includes('freemium')) pricingType = 'freemium';
            else if (pt.includes('paid')) pricingType = 'paid';
            else if (pt.includes('free')) pricingType = 'free';
        }

        // Rating
        const ratingMatch = html.match(/ratingValue["']\s*content=["']([^"']+)["']/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Long description from entry-content
        let longDescription = '';
        const contentMatch = html.match(/<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (contentMatch) longDescription = contentMatch[1].trim();

        // Features
        const features = [];
        const featureMatches = html.matchAll(/<li[^>]*>([^<]*(?:feature|benefit|capability)[^<]*)<\/li>/gi);
        for (const fm of featureMatches) {
            features.push(stripTags(fm[1]));
        }

        console.log(`  ✅ Tool: ${name} (${categorySlug})`);
        return {
            name,
            slug,
            shortDescription: description.substring(0, 200),
            longDescription,
            websiteUrl,
            pricingType,
            status: 'published',
            logo,
            featuredImage,
            featured: false,
            views: Math.floor(Math.random() * 500) + 50,
            helpfulCount: Math.floor(Math.random() * 50),
            features,
            primaryCategory: categorySlug,
            categories: [categorySlug],
            meta: {
                rating,
                pros: [],
                cons: [],
            },
            metaTitle: ogTitle || name,
            metaDescription: description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    } catch (err) {
        console.log(`  ❌ Failed: ${url} — ${err.message}`);
        return null;
    }
}

// ============================================================
// CATEGORIES from the live site
// ============================================================
const CATEGORIES = [
    { name: 'AI Automation Tools', slug: 'ai-automation-tools', description: 'Tools for automating workflows and processes with AI.', toolCount: 9 },
    { name: 'AI Chatbots Tools', slug: 'ai-chatbots-tools', description: 'AI-powered chatbot platforms and conversational AI tools.', toolCount: 0 },
    { name: 'AI Coding Tools', slug: 'ai-coding-tools', description: 'AI coding assistants and developer tools.', toolCount: 3 },
    { name: 'AI Design Tools', slug: 'ai-design-tools', description: 'AI-powered design and creative tools.', toolCount: 4 },
    { name: 'AI General Tools', slug: 'ai-general-tools', description: 'General-purpose AI tools and platforms.', toolCount: 5 },
    { name: 'AI Image Tools', slug: 'ai-image-tools', description: 'AI image generation, editing, and enhancement tools.', toolCount: 3 },
    { name: 'AI Marketing Tools', slug: 'ai-marketing-tools', description: 'AI tools for marketing automation and analytics.', toolCount: 2 },
    { name: 'AI Productivity Tools', slug: 'ai-productivity-tools', description: 'AI tools to boost your productivity and efficiency.', toolCount: 5 },
    { name: 'AI Subtitle Generators Tools', slug: 'ai-subtitle-generators-tools', description: 'AI tools for generating subtitles and captions.', toolCount: 3 },
    { name: 'AI UI Generators Tools', slug: 'ai-ui-generators-tools', description: 'AI-powered UI design and generation tools.', toolCount: 0 },
    { name: 'AI Video Tools', slug: 'ai-video-tools', description: 'AI-powered video creation and editing tools.', toolCount: 3 },
    { name: 'AI Voice Tools', slug: 'ai-voice-tools', description: 'AI voice synthesis and audio processing tools.', toolCount: 0 },
    { name: 'AI Website Builder Tools', slug: 'ai-website-builder-tools', description: 'AI-powered website builder platforms.', toolCount: 1 },
    { name: 'AI Writing Tools', slug: 'ai-writing-tools', description: 'AI writing assistants and content generation tools.', toolCount: 2 },
    { name: 'Avatar Generators Tools', slug: 'avatar-generators-tools', description: 'AI avatar and character generation tools.', toolCount: 0 },
    { name: 'Copywriting Tools', slug: 'copywriting-tools', description: 'AI copywriting and content creation tools.', toolCount: 1 },
    { name: 'SEO Tools', slug: 'seo-tools', description: 'AI-powered SEO and search optimization tools.', toolCount: 2 },
    { name: 'Text to Speech Tools', slug: 'text-to-speech-tools', description: 'AI text-to-speech and voice generation tools.', toolCount: 0 },
];

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log('🚀 HyzenPro Live Site Scraper\n');

    // Scrape blog posts
    console.log(`📝 Scraping ${BLOG_URLS.length} blog posts from live site...`);
    const posts = [];
    for (const url of BLOG_URLS) {
        const post = await scrapeBlogPost(url);
        if (post) posts.push(post);
        // Small delay to be polite
        await new Promise(r => setTimeout(r, 300));
    }

    // Scrape AI tools
    console.log(`\n🔧 Scraping ${TOOL_URLS.length} AI tools from live site...`);
    const tools = [];
    for (const url of TOOL_URLS) {
        const tool = await scrapeAiTool(url);
        if (tool) tools.push(tool);
        await new Promise(r => setTimeout(r, 300));
    }

    // Save output
    const output = { tools, categories: CATEGORIES, posts };
    const outputPath = 'F:/main theme files/hyzenpro-nextjs/scripts/live-site-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n📊 Scrape Summary:`);
    console.log(`   Blog Posts: ${posts.length}`);
    console.log(`   AI Tools: ${tools.length}`);
    console.log(`   Categories: ${CATEGORIES.length}`);
    console.log(`\n💾 Data saved to: ${outputPath}`);
}

main().catch(console.error);
