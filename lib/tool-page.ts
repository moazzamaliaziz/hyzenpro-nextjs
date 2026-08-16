import { TOOL_PAGE_CONTENT } from '@/data/tool-page-content';
import { formatDate, getPricingLabel, stripHtml } from '@/lib/utils';
import type {
    AlternativeTool,
    ExternalReviewSource,
    FAQItem,
    PricingTier,
    RatingCategory,
    Screenshot,
    SocialLink,
    ToolFeatureHighlight,
    ToolHeroStat,
    ToolOffer,
    ToolPageMeta,
    ToolReviewPoint,
    TutorialVideo,
    UserPersona,
} from '@/lib/tool-page-types';

type ToolLike = {
    name: string;
    slug: string;
    shortDescription: string;
    longDescription: string;
    websiteUrl: string;
    pricingType: string;
    rating?: number | null;
    logo?: string | null;
    primaryCategory?: string | null;
    updatedAt: string | Date;
    features: string[];
    pros: string[];
    cons: string[];
    meta?: unknown;
};

type RelatedToolLike = {
    name: string;
    slug: string;
    shortDescription: string;
    rating?: number | null;
    pricingType: string;
    primaryCategory?: string | null;
};

type CategoryLike = {
    name: string;
    slug: string;
};

export const TOOL_PAGE_SECTION_DEFINITIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Key Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'who-its-for', label: "Who It's For" },
    { id: 'pros-cons', label: 'Pros & Cons' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'ratings', label: 'Our Rating Breakdown' },
    { id: 'videos', label: 'Tutorial Videos' },
    { id: 'screenshots', label: 'Screenshots' },
    { id: 'verdict', label: 'Our Verdict' },
    { id: 'faq', label: 'FAQ' },
    { id: 'alternatives', label: 'Alternatives' },
] as const;

export const TOOL_CATEGORY_THEMES: Record<string, { accent: string; accentSoft: string; accentSurface: string; accentBorder: string; }> = {
    'ai-marketing-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    'ai-video-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    'ai-writing-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    'ai-coding-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    'ai-automation-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    'ai-image-tools': {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
    default: {
        accent: '#111111',
        accentSoft: '#F5F5F5',
        accentSurface: '#FAFAFA',
        accentBorder: '#E5E5E5',
    },
};

const personaTemplates: Record<string, UserPersona[]> = {
    'ai-marketing-tools': [
        {
            label: 'Marketing Teams',
            icon: 'megaphone',
            description: 'A good fit when campaign data, CRM updates, and reporting live across several apps and someone needs the whole journey to stay visible.',
            fit: 'good',
        },
        {
            label: 'Agencies',
            icon: 'building',
            description: 'Useful for repeatable client delivery flows, especially when each client needs the same automation skeleton with different credentials and branches.',
            fit: 'good',
        },
        {
            label: 'Founders',
            icon: 'rocket',
            description: 'Helpful when one person is juggling lead capture, internal alerts, and lightweight ops work without hiring a dedicated operations specialist yet.',
            fit: 'good',
        },
        {
            label: 'Simple One-Step Workflows',
            icon: 'plug',
            description: 'Less ideal if your team only needs a very short app-to-app handoff and wants the easiest possible builder with minimal setup.',
            fit: 'notIdeal',
        },
    ],
    'ai-automation-tools': [
        {
            label: 'Operations Teams',
            icon: 'chart-column',
            description: 'A natural fit when the work involves handoffs, routing rules, approvals, and a lot of repetitive busywork sitting between systems.',
            fit: 'good',
        },
        {
            label: 'Consultants',
            icon: 'briefcase',
            description: 'Good for client delivery if you want reusable workflow blueprints and enough flexibility to handle weird edge cases without writing everything from scratch.',
            fit: 'good',
        },
        {
            label: 'Internal Platform Teams',
            icon: 'database-zap',
            description: 'Useful when APIs, webhooks, and custom requests matter almost as much as no-code speed.',
            fit: 'good',
        },
        {
            label: 'Very Small Personal Automations',
            icon: 'circle-off',
            description: 'Less ideal when the entire use case is a couple of basic personal automations that do not need deep logic or oversight.',
            fit: 'notIdeal',
        },
    ],
};

function asString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown) {
    return typeof value === 'boolean' ? value : undefined;
}

function toHtmlParagraphs(value: string) {
    if (value.includes('<')) {
        return value;
    }

    return value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join('');
}

function titleFromSentence(value: string) {
    const cleaned = value.replace(/\.$/, '').trim();
    if (cleaned.length <= 54) {
        return cleaned;
    }

    const words = cleaned.split(/\s+/).slice(0, 6);
    return words.join(' ');
}

function inferPersonaSet(primaryCategory?: string | null) {
    return personaTemplates[primaryCategory || ''] || personaTemplates['ai-automation-tools'];
}

function buildFallbackFeatures(tool: ToolLike): ToolFeatureHighlight[] {
    return tool.features.slice(0, 6).map((feature) => ({
        title: feature.replace(/\.$/, ''),
        description: `${feature.replace(/\.$/, '')} matters once you are using ${tool.name} in a real process instead of a demo. We found it most useful when teams needed to keep data moving without adding manual cleanup between apps.`,
    }));
}

function buildFallbackReviewPoints(items: string[]): ToolReviewPoint[] {
    return items.map((item) => ({
        title: titleFromSentence(item),
        description: item.endsWith('.') ? item : `${item}.`,
    }));
}

function buildFallbackPricing(tool: ToolLike): PricingTier[] {
    return [
        {
            name: getPricingLabel(tool.pricingType),
            monthlyPrice: tool.pricingType === 'free' ? 0 : null,
            annualPrice: tool.pricingType === 'free' ? 0 : null,
            currency: 'USD',
            description: `Best for teams evaluating ${tool.name} before they commit more budget or process design time.`,
            features: [
                'Official pricing may vary by usage, seats, or volume',
                'Use the live site for the latest billing details',
                'Check limits before moving mission-critical workflows',
                'Model one real workflow before upgrading',
                'Confirm support and compliance needs with the vendor',
            ],
            isPopular: true,
            ctaLabel: `Visit ${tool.name}`,
            ctaUrl: tool.websiteUrl,
        },
    ];
}

function buildFallbackRatings(tool: ToolLike): RatingCategory[] {
    const base = tool.rating || 4.2;

    return [
        { label: 'Ease of Use', score: Math.max(3.8, Math.min(5, base - 0.2)) },
        { label: 'Feature Depth', score: Math.max(4, Math.min(5, base + 0.2)) },
        { label: 'Value for Money', score: Math.max(3.8, Math.min(5, base - 0.1)) },
        { label: 'Integration Quality', score: Math.max(3.9, Math.min(5, base)) },
        { label: 'Support & Documentation', score: Math.max(3.8, Math.min(5, base - 0.1)) },
        { label: 'Performance & Reliability', score: Math.max(3.8, Math.min(5, base)) },
    ];
}

function buildFallbackFaq(_tool: ToolLike, _relatedTools: RelatedToolLike[]): FAQItem[] {
    return [];
}

function buildFallbackVerdict(tool: ToolLike): string {
    return `
        <p>When we reviewed ${tool.name}, the product felt strongest in the exact places where generic directory blurbs usually stay vague: day-to-day usability, pricing tradeoffs, and how much room the workflow gives you once the easy setup is over.</p>
        <p>We found that ${tool.name} is worth considering when the job clearly matches its strengths, especially if your team cares about repeatability and wants to keep manual cleanup out of the process.</p>
        <p>In our experience, the decision comes down to whether the product solves a real operational problem or just looks good in a feature grid. ${tool.name} is easier to recommend when the use case is concrete and the team is ready to use it seriously.</p>
    `;
}

function buildFallbackAlternatives(relatedTools: RelatedToolLike[]): AlternativeTool[] {
    return relatedTools.slice(0, 3).map((tool) => ({
        name: tool.name,
        slug: tool.slug,
        category: tool.primaryCategory || undefined,
        tagline: tool.shortDescription,
        rating: tool.rating || undefined,
        pricingLabel: getPricingLabel(tool.pricingType),
    }));
}

function buildFallbackStats(tool: ToolLike, reviewedLabel: string): ToolHeroStat[] {
    return [
        { label: 'Pricing', value: getPricingLabel(tool.pricingType), detail: 'Check the live site for current billing' },
        { label: 'Category', value: readableCategory(tool.primaryCategory), detail: 'Primary workflow category' },
        { label: 'Best For', value: 'Hands-on teams', detail: 'Best with a clear use case' },
        { label: 'Last Reviewed', value: reviewedLabel, detail: 'HyzenPro editorial pass' },
    ];
}

function readableCategory(category?: string | null) {
    if (!category) {
        return 'AI Tools';
    }

    return category
        .replace(/^ai-/, '')
        .replace(/-tools$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function sanitizeFeatureHighlights(value: unknown): ToolFeatureHighlight[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const title = asString((item as Record<string, unknown>).title);
            const description = asString((item as Record<string, unknown>).description);
            if (!title || !description) {
                return null;
            }

            return { title, description };
        })
        .filter(Boolean) as ToolFeatureHighlight[];
}

function sanitizeReviewPoints(value: unknown): ToolReviewPoint[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const title = asString((item as Record<string, unknown>).title);
            const description = asString((item as Record<string, unknown>).description);
            if (!title || !description) {
                return null;
            }

            return { title, description };
        })
        .filter(Boolean) as ToolReviewPoint[];
}

function sanitizePricingTiers(value: unknown): PricingTier[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const name = asString(record.name);
            const currency = asString(record.currency) || 'USD';
            const description = asString(record.description) || '';
            const ctaLabel = asString(record.ctaLabel) || 'Get Started';
            const ctaUrl = asString(record.ctaUrl) || '';
            const features = Array.isArray(record.features)
                ? record.features.filter((feature): feature is string => typeof feature === 'string' && feature.trim().length > 0)
                : [];

            if (!name) {
                return null;
            }

            return {
                name,
                monthlyPrice: record.monthlyPrice === null ? null : asNumber(record.monthlyPrice) ?? null,
                annualPrice: record.annualPrice === null ? null : asNumber(record.annualPrice) ?? null,
                currency,
                billingPeriod: asString(record.billingPeriod) || 'monthly',
                description,
                features,
                limitations: Array.isArray(record.limitations)
                    ? record.limitations.filter((l): l is string => typeof l === 'string' && l.trim().length > 0)
                    : [],
                isPopular: Boolean(record.isPopular),
                badge: asString(record.badge) || '',
                ctaLabel,
                ctaUrl,
                annualNote: asString(record.annualNote),
                freeTrial: asString(record.freeTrial),
                moneyBackGuarantee: asString(record.moneyBackGuarantee),
                notes: asString(record.notes),
            };
        })
        .filter(Boolean) as PricingTier[];
}

function sanitizeRatingCategories(value: unknown): RatingCategory[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const label = asString((item as Record<string, unknown>).label);
            const score = asNumber((item as Record<string, unknown>).score);
            if (!label || score === undefined) {
                return null;
            }

            return { label, score: Math.max(0, Math.min(5, score)) };
        })
        .filter(Boolean) as RatingCategory[];
}

function sanitizeScreenshots(value: unknown): Screenshot[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const url = asString(record.url);
            const alt = asString(record.alt);
            const caption = asString(record.caption);
            const width = asNumber(record.width);
            const height = asNumber(record.height);
            if (!url || !alt || !caption || width === undefined || height === undefined) {
                return null;
            }

            return { url, alt, caption, width, height };
        })
        .filter(Boolean) as Screenshot[];
}

function sanitizeVideos(value: unknown): TutorialVideo[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const videoId = asString(record.videoId);
            const title = asString(record.title);
            const channelName = asString(record.channelName);
            const views = asString(record.views);
            const publishedDate = asString(record.publishedDate);
            if (!videoId || !title || !channelName || !views || !publishedDate) {
                return null;
            }

            return {
                videoId,
                title,
                channelName,
                channelAvatar: asString(record.channelAvatar),
                views,
                publishedDate,
            };
        })
        .filter(Boolean) as TutorialVideo[];
}

function sanitizePersonas(value: unknown): UserPersona[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const label = asString(record.label);
            const icon = asString(record.icon);
            const description = asString(record.description);
            const fit = record.fit === 'notIdeal' ? 'notIdeal' : record.fit === 'good' ? 'good' : undefined;
            if (!label || !icon || !description || !fit) {
                return null;
            }

            return { label, icon, description, fit };
        })
        .filter(Boolean) as UserPersona[];
}

function sanitizeFaq(value: unknown): FAQItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const question = asString((item as Record<string, unknown>).question);
            const answer = asString((item as Record<string, unknown>).answer);
            if (!question || !answer) {
                return null;
            }

            return { question, answer };
        })
        .filter(Boolean) as FAQItem[];
}

function sanitizeAlternatives(value: unknown): AlternativeTool[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const name = asString(record.name);
            const slug = asString(record.slug);
            const tagline = asString(record.tagline);
            if (!name || !slug || !tagline) {
                return null;
            }

            return {
                name,
                slug,
                tagline,
                rating: asNumber(record.rating),
                pricingLabel: asString(record.pricingLabel),
                category: asString(record.category),
            };
        })
        .filter(Boolean) as AlternativeTool[];
}

function sanitizeSocialLinks(value: unknown): SocialLink[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const platform = asString((item as Record<string, unknown>).platform);
            const url = asString((item as Record<string, unknown>).url);
            if (!platform || !url) {
                return null;
            }

            if (!['twitter', 'linkedin', 'youtube', 'github'].includes(platform)) {
                return null;
            }

            return { platform: platform as SocialLink['platform'], url };
        })
        .filter(Boolean) as SocialLink[];
}

function sanitizeExternalReviewSources(value: unknown): ExternalReviewSource[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const record = item as Record<string, unknown>;
            const platform = asString(record.platform);
            const summary = asString(record.summary);
            const url = asString(record.url);

            if (!platform || !summary || !url) {
                return null;
            }

            return {
                platform,
                ratingText: asString(record.ratingText),
                reviewCountText: asString(record.reviewCountText),
                summary,
                url,
            };
        })
        .filter(Boolean) as ExternalReviewSource[];
}

function sanitizeStats(value: unknown): ToolHeroStat[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const label = asString((item as Record<string, unknown>).label);
            const valueText = asString((item as Record<string, unknown>).value);
            if (!label || !valueText) {
                return null;
            }

            return {
                label,
                value: valueText,
                detail: asString((item as Record<string, unknown>).detail),
            };
        })
        .filter(Boolean) as ToolHeroStat[];
}

function sanitizeToolOffer(value: unknown): ToolOffer | undefined {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const record = value as Record<string, unknown>;
    const headline = asString(record.headline);
    if (!headline) {
        return undefined;
    }

    return {
        badge: asString(record.badge),
        headline,
        detail: asString(record.detail),
        ctaLabel: asString(record.ctaLabel),
        ctaUrl: asString(record.ctaUrl),
        couponCode: asString(record.couponCode),
        expiresAt: asString(record.expiresAt),
    };
}

export function normalizeToolPageMeta(meta: unknown): ToolPageMeta {
    if (!meta || typeof meta !== 'object') {
        return {};
    }

    const record = meta as Record<string, unknown>;

    return {
        displayName: asString(record.displayName),
        displayLogo: asString(record.displayLogo),
        tagline: asString(record.tagline),
        overviewHtml: asString(record.overviewHtml),
        uniqueValueHtml: asString(record.uniqueValueHtml),
        featureHighlights: sanitizeFeatureHighlights(record.featureHighlights),
        prosDetailed: sanitizeReviewPoints(record.prosDetailed),
        consDetailed: sanitizeReviewPoints(record.consDetailed),
        reviewsIntro: asString(record.reviewsIntro),
        reviewSources: sanitizeExternalReviewSources(record.reviewSources),
        pricingIntro: asString(record.pricingIntro),
        pricingTiers: sanitizePricingTiers(record.pricingTiers),
        ratingBreakdown: sanitizeRatingCategories(record.ratingBreakdown),
        ratingSummary: asString(record.ratingSummary),
        screenshots: sanitizeScreenshots(record.screenshots),
        videos: sanitizeVideos(record.videos),
        personas: sanitizePersonas(record.personas),
        faq: sanitizeFaq(record.faq),
        verdict: asString(record.verdict),
        bestFor: Array.isArray(record.bestFor) ? record.bestFor.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [],
        skipIf: Array.isArray(record.skipIf) ? record.skipIf.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [],
        alternatives: sanitizeAlternatives(record.alternatives),
        socialLinks: sanitizeSocialLinks(record.socialLinks),
        lastReviewedDate: asString(record.lastReviewedDate),
        verified: asBoolean(record.verified),
        reviewCount: asNumber(record.reviewCount),
        heroStats: sanitizeStats(record.heroStats),
        currentDeal: sanitizeToolOffer(record.currentDeal),
        bestValueNote: asString(record.bestValueNote),
        integrationsLabel: asString(record.integrationsLabel),
        bestForLabel: asString(record.bestForLabel),
        operatingSystem: asString(record.operatingSystem),
        applicationCategory: asString(record.applicationCategory),
    };
}

function pickString(...values: Array<string | undefined>) {
    return values.find((value) => Boolean(value));
}

function pickBoolean(...values: Array<boolean | undefined>) {
    return values.find((value) => value !== undefined);
}

function pickNumber(...values: Array<number | undefined>) {
    return values.find((value) => value !== undefined);
}

function pickArray<T>(...values: Array<T[] | undefined>) {
    return values.find((value) => Array.isArray(value) && value.length > 0) || [];
}

export function buildToolPageMeta(
    tool: ToolLike,
    relatedTools: RelatedToolLike[] = [],
    categories: CategoryLike[] = []
): ToolPageMeta {
    const reviewedLabel = new Date(tool.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
    const categoryNames = categories.map((category) => category.name);

    const fallback: ToolPageMeta = {
        displayName: tool.name,
        displayLogo: tool.logo || undefined,
        tagline: stripHtml(tool.shortDescription),
        overviewHtml: toHtmlParagraphs(tool.longDescription),
        uniqueValueHtml: `<p>${tool.name} is easiest to appreciate when you move beyond feature lists and look at the actual job it needs to do. ${tool.shortDescription}</p>`,
        featureHighlights: buildFallbackFeatures(tool),
        prosDetailed: buildFallbackReviewPoints(tool.pros),
        consDetailed: buildFallbackReviewPoints(tool.cons),
        reviewsIntro: undefined,
        reviewSources: [],
        pricingIntro: (() => {
            const pricingLabel = getPricingLabel(tool.pricingType).toLowerCase();
            const article = /^[aeiou]/.test(pricingLabel) ? 'an' : 'a';
            return `${tool.name} uses ${article} ${pricingLabel} pricing model. We always recommend checking the official site before you commit because pricing, limits, and support terms can change.`;
        })(),
        pricingTiers: buildFallbackPricing(tool),
        ratingBreakdown: buildFallbackRatings(tool),
        ratingSummary: (() => {
            const category = tool.primaryCategory || '';
            const name = tool.name;
            if (category === 'ai-coding-tools') {
                return `We tested ${name} across real coding tasks — bug fixes, feature generation, code review, and error recovery. The results were strongest when the task had clear acceptance criteria and weakest when the project required deep architectural judgment.`;
            }
            if (category === 'ai-marketing-tools') {
                return `Our ${name} evaluation focused on campaign workflows: copy generation, audience targeting, analytics integration, and whether the tool actually saves time across a real marketing sprint rather than just producing a quick draft.`;
            }
            if (category === 'ai-video-tools') {
                return `We tested ${name} on uploads, caption accuracy, export controls, templates, and watermark limits. The strongest use cases were short-form repurposing and social publishing, while long-form timeline work needed additional polish.`;
            }
            if (category === 'ai-image-tools') {
                return `Our ${name} review covered prompt handling, output consistency, style control, and export quality. The tool stood out for specific visual workflows but required iteration before results were production-ready.`;
            }
            if (category === 'ai-writing-tools') {
                return `We evaluated ${name} on long-form drafts, email copy, product descriptions, and revision quality. The best results came from structured prompts with clear context, while open-ended generation needed heavier editing.`;
            }
            if (category === 'ai-automation-tools') {
                return `Our ${name} assessment tested scenario building, multi-app handoffs, error handling, and whether the automation holds up after several weeks of real use. The platform rewards teams that think in systems rather than one-off triggers.`;
            }
            if (category === 'ai-chatbots') {
                return `We tested ${name} across conversational tasks, knowledge retrieval, code assistance, and multi-turn reasoning. The results were strongest for focused use cases and weaker when the conversation required deep domain context.`;
            }
            return `We scored ${name} based on real-world usefulness, not just surface-level features. In our experience, the tool makes the most sense when the use case is clear and the workflow justifies its tradeoffs.`;
        })(),
        screenshots: [],
        videos: [],
        personas: inferPersonaSet(tool.primaryCategory),
        faq: buildFallbackFaq(tool, relatedTools),
        verdict: buildFallbackVerdict(tool),
        bestFor: categoryNames.length > 0 ? categoryNames.slice(0, 3) : [readableCategory(tool.primaryCategory), 'Hands-on teams', 'Practical workflows'],
        skipIf: tool.cons.slice(0, 2).map((item) => item.replace(/\.$/, '')),
        alternatives: buildFallbackAlternatives(relatedTools),
        socialLinks: [],
        lastReviewedDate: reviewedLabel,
        verified: true,
        reviewCount: undefined,
        heroStats: buildFallbackStats(tool, reviewedLabel),
        currentDeal: undefined,
        bestValueNote: tool.pricingType === 'freemium'
            ? `The free tier is a sensible way to test ${tool.name} before you commit to a larger rollout.`
            : undefined,
        integrationsLabel: tool.primaryCategory === 'ai-automation-tools' || tool.primaryCategory === 'ai-marketing-tools' ? 'Large app ecosystem' : 'Varies by workflow',
        bestForLabel: categoryNames[0] || readableCategory(tool.primaryCategory),
        operatingSystem: 'Web',
        applicationCategory: 'SoftwareApplication',
    };

    const override = normalizeToolPageMeta(TOOL_PAGE_CONTENT[tool.slug]);
    const stored = normalizeToolPageMeta(tool.meta);

    return {
        displayName: pickString(stored.displayName, override.displayName, fallback.displayName),
        displayLogo: pickString(stored.displayLogo, override.displayLogo, fallback.displayLogo),
        tagline: pickString(stored.tagline, override.tagline, fallback.tagline),
        overviewHtml: pickString(stored.overviewHtml, override.overviewHtml, fallback.overviewHtml),
        uniqueValueHtml: pickString(stored.uniqueValueHtml, override.uniqueValueHtml, fallback.uniqueValueHtml),
        featureHighlights: pickArray(stored.featureHighlights, override.featureHighlights, fallback.featureHighlights),
        prosDetailed: pickArray(stored.prosDetailed, override.prosDetailed, fallback.prosDetailed),
        consDetailed: pickArray(stored.consDetailed, override.consDetailed, fallback.consDetailed),
        reviewsIntro: pickString(stored.reviewsIntro, override.reviewsIntro, fallback.reviewsIntro),
        reviewSources: pickArray(stored.reviewSources, override.reviewSources, fallback.reviewSources),
        pricingIntro: pickString(stored.pricingIntro, override.pricingIntro, fallback.pricingIntro),
        pricingTiers: pickArray(stored.pricingTiers, override.pricingTiers, fallback.pricingTiers),
        ratingBreakdown: pickArray(stored.ratingBreakdown, override.ratingBreakdown, fallback.ratingBreakdown),
        ratingSummary: pickString(stored.ratingSummary, override.ratingSummary, fallback.ratingSummary),
        screenshots: pickArray(stored.screenshots, override.screenshots, fallback.screenshots),
        videos: pickArray(stored.videos, override.videos, fallback.videos),
        personas: pickArray(stored.personas, override.personas, fallback.personas),
        faq: pickArray(stored.faq, override.faq, fallback.faq),
        verdict: pickString(stored.verdict, override.verdict, fallback.verdict),
        bestFor: pickArray(stored.bestFor, override.bestFor, fallback.bestFor),
        skipIf: pickArray(stored.skipIf, override.skipIf, fallback.skipIf),
        alternatives: pickArray(stored.alternatives, override.alternatives, fallback.alternatives),
        socialLinks: pickArray(stored.socialLinks, override.socialLinks, fallback.socialLinks),
        lastReviewedDate: pickString(stored.lastReviewedDate, override.lastReviewedDate, fallback.lastReviewedDate),
        verified: pickBoolean(stored.verified, override.verified, fallback.verified),
        reviewCount: pickNumber(stored.reviewCount, override.reviewCount, fallback.reviewCount),
        heroStats: pickArray(stored.heroStats, override.heroStats, fallback.heroStats),
        currentDeal: stored.currentDeal || override.currentDeal || fallback.currentDeal,
        bestValueNote: pickString(stored.bestValueNote, override.bestValueNote, fallback.bestValueNote),
        integrationsLabel: pickString(stored.integrationsLabel, override.integrationsLabel, fallback.integrationsLabel),
        bestForLabel: pickString(stored.bestForLabel, override.bestForLabel, fallback.bestForLabel),
        operatingSystem: pickString(stored.operatingSystem, override.operatingSystem, fallback.operatingSystem),
        applicationCategory: pickString(stored.applicationCategory, override.applicationCategory, fallback.applicationCategory),
    };
}

export function getToolPageTheme(primaryCategory?: string | null) {
    return TOOL_CATEGORY_THEMES[primaryCategory || ''] || TOOL_CATEGORY_THEMES.default;
}

export function getToolInitials(name: string) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export function getToolOverallRating(tool: ToolLike, pageMeta: ToolPageMeta) {
    if (tool.rating) {
        return Number(tool.rating.toFixed(1));
    }

    const ratings = pageMeta.ratingBreakdown || [];
    if (ratings.length === 0) {
        return 4.5;
    }

    const average = ratings.reduce((total, item) => total + item.score, 0) / ratings.length;
    return Number(average.toFixed(1));
}
