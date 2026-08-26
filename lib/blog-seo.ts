export const DEFAULT_BLOG_FEATURED_IMAGE = '/images/blog/hyzenpro-blog-default.png';
export const FRONTIER_MODELS_BLOG_SLUG = 'top-5-frontier-ai-models-2026';

export const DEDICATED_BLOG_SLUGS = new Set([
    FRONTIER_MODELS_BLOG_SLUG,
    'cursor-composer-2-5-review',
    'google-antigravity-2-review',
    'claude-opus-4-8-vs-gpt-5-5-coding-benchmark',
    'claude-fable-5-mythos-5',
    'sakana-fugu-review-japan-multi-agent-ai-2026',
    'claude-sonnet-5-review',
    'gpt-5-6-sol-preview',
]);

export const LEGACY_BLOG_SLUG_REDIRECTS: Record<string, string> = {
    'top-5-best-frontier-ai-models-in-2026-gpt-55-claude-gemini-more': FRONTIER_MODELS_BLOG_SLUG,
};

type BlogPostLike = {
    title?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    featuredImage?: string | null;
    categories?: string[] | null;
};

export type InternalLinkRecommendation = {
    href: string;
    label: string;
    description: string;
};

const FALLBACK_LINKS: InternalLinkRecommendation[] = [
    {
        href: '/ai-tools-directory/',
        label: 'AI tools directory',
        description: 'Browse every published AI tool review and category page.',
    },
    {
        href: '/find-tools/',
        label: 'AI tool matcher',
        description: 'Use guided questions to move from research to a practical shortlist.',
    },
    {
        href: '/how-we-test/',
        label: 'How we test AI tools',
        description: 'Review the evaluation method behind HyzenPro recommendations.',
    },
];

const TOPIC_LINKS: Array<{ match: string[]; links: InternalLinkRecommendation[] }> = [
    {
        match: ['caption', 'subtitle', 'submagic', 'veed', 'captions.ai', 'zubtitle', 'kapwing'],
        links: [
            { href: '/blog/10-best-ai-caption-generator-tools/', label: 'Best AI subtitle generators', description: 'Compare captioning and subtitle tools for short-form video workflows.' },
            { href: '/find-tools/caption-tool/', label: 'AI caption tool matcher', description: 'Get a guided shortlist based on editing style, speed, and budget.' },
            { href: '/ai-tools-directory/ai-video-tools/veed-io/', label: 'VEED.io review', description: 'See pricing, features, and alternatives for a full video-editing suite.' },
        ],
    },
    {
        match: ['video', 'clipchamp', 'animaker', 'descript', 'headliner', 'autocut'],
        links: [
            { href: '/ai-tools-directory/ai-video-tools/', label: 'Best AI video tools', description: 'Browse AI editors, clip generators, and video production platforms.' },
            { href: '/ai-tools-directory/ai-subtitle-generators/', label: 'AI subtitle generators', description: 'Add captioning tools to your video creation shortlist.' },
            { href: '/find-tools/caption-tool/', label: 'Caption tool matcher', description: 'Choose a caption workflow before comparing full video editors.' },
        ],
    },
    {
        match: ['coding', 'code', 'replit', 'cursor', 'copilot', 'claude code'],
        links: [
            { href: '/ai-tools-directory/ai-coding-tools/', label: 'Best AI coding tools', description: 'Compare coding assistants, agents, and IDE copilots.' },
            { href: '/find-tools/coding-assistant/', label: 'AI coding assistant matcher', description: 'Match tools to your IDE, privacy needs, and team workflow.' },
            { href: '/blog/replit-ai-agent-review/', label: 'Replit AI Agent review', description: 'Read the full review of Replit’s agentic coding workflow.' },
        ],
    },
    {
        match: ['image', 'midjourney', 'dall', 'stable diffusion', 'leonardo'],
        links: [
            { href: '/ai-tools-directory/ai-image-tools/', label: 'Best AI image tools', description: 'Browse image generators, design tools, and creative AI platforms.' },
            { href: '/blog/midjourney-vs-dall-e-3-vs-stable-diffusion/', label: 'Midjourney vs DALL-E vs Stable Diffusion', description: 'Compare the leading image generation models side by side.' },
            { href: '/blog/leonardo-ai-vs-midjourney/', label: 'Leonardo AI vs Midjourney', description: 'See which creative platform fits production workflows better.' },
        ],
    },
    {
        match: ['writing', 'jasper', 'writesonic', 'copy.ai', 'copywriting'],
        links: [
            { href: '/ai-tools-directory/ai-writing-tools/', label: 'Best AI writing tools', description: 'Browse writing assistants for blogs, ads, and email campaigns.' },
            { href: '/ai-tools-directory/ai-marketing-tools/', label: 'AI marketing tools', description: 'Compare content, CRM, and campaign automation platforms.' },
            { href: '/blog/jasper-ai-vs-writesonic-vs-copy-ai/', label: 'Jasper vs Writesonic vs Copy.ai', description: 'Compare the leading AI marketing suites for 2026.' },
        ],
    },
    {
        match: ['voice', 'audio', 'elevenlabs', 'lovo', 'podcast'],
        links: [
            { href: '/ai-tools-directory/ai-voice-tools/', label: 'Best AI voice tools', description: 'Browse voice generation and audio production platforms.' },
            { href: '/blog/elevenlabs-vs-lovo/', label: 'ElevenLabs vs Lovo', description: 'Compare voice realism, editing workflow, and creator pricing.' },
            { href: '/blog/what-is-elevenlabs/', label: 'What is ElevenLabs?', description: 'Start with the full guide to the AI voice platform.' },
        ],
    },
    {
        match: ['automation', 'workflow', 'agent', 'uipath', 'productivity'],
        links: [
            { href: '/ai-tools-directory/ai-automation-tools/', label: 'Best AI automation tools', description: 'Browse automation platforms, agents, and workflow builders.' },
            { href: '/find-tools/automation-tool/', label: 'AI automation matcher', description: 'Find the right automation platform for complexity and hosting needs.' },
            { href: '/ai-tools-directory/ai-productivity-tools/', label: 'AI productivity tools', description: 'Compare tools that promise faster individual and team workflows.' },
        ],
    },
];

export function normalizeEvergreenYear(value: string | null | undefined) {
    return (value || '').replace(/\b2025\b/g, '2026');
}

export function getBlogPostPath(slug: string) {
    const cleanSlug = getCanonicalBlogSlug(slug);
    return `/blog/${cleanSlug}/`;
}

export function getCanonicalBlogSlug(slug: string) {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    return LEGACY_BLOG_SLUG_REDIRECTS[cleanSlug] || cleanSlug;
}

export function getBlogDisplayTitle(post: BlogPostLike) {
    return normalizeEvergreenYear(post.title);
}

export function getBlogDisplayExcerpt(post: BlogPostLike) {
    return normalizeEvergreenYear(post.excerpt);
}

export function getBlogFeaturedImage(post: BlogPostLike) {
    return post.featuredImage || DEFAULT_BLOG_FEATURED_IMAGE;
}

export function getInternalLinkRecommendations(post: BlogPostLike, limit = 3) {
    const haystack = [post.title, post.slug, post.excerpt, ...(post.categories || [])].join(' ').toLowerCase();
    const recommendations = TOPIC_LINKS.find((cluster) => cluster.match.some((term) => haystack.includes(term)))?.links || FALLBACK_LINKS;
    return recommendations.slice(0, limit);
}
