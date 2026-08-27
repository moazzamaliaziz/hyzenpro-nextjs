export type Pricing = 'Free' | 'Freemium' | 'Free trial' | 'Paid' | 'Open source';
export type Audience =
    | 'Creators & YouTubers' | 'Marketers & Growth' | 'Developers & Indie Hackers'
    | 'Founders & Small Teams' | 'Students & Educators' | 'Agencies & Consultancies';

export const CATEGORIES: { slug: string; label: string }[] = [
    { slug: 'ai-writing-tools', label: 'AI Writing Tools' },
    { slug: 'ai-image-tools', label: 'AI Image Tools' },
    { slug: 'ai-video-tools', label: 'AI Video Tools' },
    { slug: 'ai-coding-tools', label: 'AI Coding Tools' },
    { slug: 'ai-design-tools', label: 'AI Design Tools' },
    { slug: 'ai-chatbots', label: 'AI Chatbots' },
    { slug: 'ai-marketing-tools', label: 'AI Marketing Tools' },
    { slug: 'ai-automation-tools', label: 'AI Automation Tools' },
    { slug: 'seo-tools', label: 'SEO Tools' },
    { slug: 'ai-general-tools', label: 'AI General Tools' },
];
export const DEFAULT_CATEGORY = 'ai-general-tools';

export const PRICING_META: Record<Pricing, { label: string; hint: string; needsPrice: boolean }> = {
    Free: { label: 'Free', hint: 'Forever free, no card', needsPrice: false },
    Freemium: { label: 'Freemium', hint: 'Free tier + paid plans', needsPrice: true },
    'Free trial': { label: 'Free trial', hint: 'Time-limited full access', needsPrice: true },
    Paid: { label: 'Paid', hint: 'Paid from day one', needsPrice: true },
    'Open source': { label: 'Open source', hint: 'Self-host, license listed', needsPrice: false },
};
export const PRICING_ORDER: Pricing[] = ['Free', 'Freemium', 'Free trial', 'Paid', 'Open source'];

export const AUDIENCES: { key: Audience; blurb: string }[] = [
    { key: 'Creators & YouTubers', blurb: 'Video, thumbnails, scripts, editing' },
    { key: 'Marketers & Growth', blurb: 'Ads, SEO, lifecycle, analytics' },
    { key: 'Developers & Indie Hackers', blurb: 'Code gen, agents, infra, APIs' },
    { key: 'Founders & Small Teams', blurb: 'Ops, hiring, docs, decks' },
    { key: 'Students & Educators', blurb: 'Research, tutoring, notes' },
    { key: 'Agencies & Consultancies', blurb: 'Client work, whitelabel, delivery' },
];
export const ROLES = ['Founder / maker', 'Team member', 'Fan / user', 'Affiliate'] as const;
export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];
export const BILLING_PERIODS = ['monthly', 'yearly', 'one-time', 'usage-based', 'custom'];

export interface PricingTierForm {
    name: string;
    monthlyPrice: string;
    annualPrice: string;
    currency: string;
    billingPeriod: string;
    description: string;
    features: string[];
    limitations: string[];
    isPopular: boolean;
    badge: string;
    ctaLabel: string;
    ctaUrl: string;
    freeTrial: string;
    moneyBackGuarantee: string;
    notes: string;
}

export interface FAQForm { question: string; answer: string }

export interface FormData {
    name: string; tagline: string; website: string; logoUrl: string;
    category: string; audiences: Audience[]; description: string; keyFeatures: string[];
    pros: string[]; cons: string[];
    pricing: Pricing; startingPrice: string; hasFreeTier: boolean;
    pricingTiers: PricingTierForm[];
    faqs: FAQForm[];
    screenshots: string[]; demoVideo: string;
    submitterName: string; submitterEmail: string;
    submitterRole: (typeof ROLES)[number];
    socials: { twitter?: string; linkedin?: string; youtube?: string; github?: string };
    agreeGuidelines: boolean; agreeContact: boolean;
    reviewNotes: string;
}

export type StepProps = {
    data: FormData;
    errors: Record<string, string>;
    update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
};

export function createEmptyTier(): PricingTierForm {
    return {
        name: '', monthlyPrice: '', annualPrice: '', currency: 'USD', billingPeriod: 'monthly',
        description: '', features: [], limitations: [], isPopular: false, badge: '',
        ctaLabel: 'Get Started', ctaUrl: '', freeTrial: '', moneyBackGuarantee: '', notes: '',
    };
}

export function createEmptyFormData(): FormData {
    return {
        name: '', tagline: '', website: '', logoUrl: '', category: '', audiences: [],
        description: '', keyFeatures: [], pros: [], cons: [], pricing: 'Freemium', startingPrice: '',
        hasFreeTier: true, pricingTiers: [], faqs: [], screenshots: [], demoVideo: '',
        submitterName: '', submitterEmail: '', submitterRole: 'Founder / maker', socials: {},
        agreeGuidelines: false, agreeContact: true, reviewNotes: '',
    };
}

const CATEGORY_SLUGS = new Set(CATEGORIES.map((category) => category.slug));
const PRICING_VALUES = new Set<Pricing>(PRICING_ORDER);
const ROLE_VALUES = new Set<(typeof ROLES)[number]>(ROLES);
const AUDIENCE_VALUES = new Set<Audience>(AUDIENCES.map((audience) => audience.key));
const URL_MAX_LENGTH = 2048;

function stringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback;
}

function stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeTier(value: unknown): PricingTierForm {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const base = createEmptyTier();
    return {
        ...base,
        name: stringValue(source.name), monthlyPrice: stringValue(source.monthlyPrice),
        annualPrice: stringValue(source.annualPrice), currency: stringValue(source.currency, base.currency),
        billingPeriod: stringValue(source.billingPeriod, base.billingPeriod), description: stringValue(source.description),
        features: stringArray(source.features), limitations: stringArray(source.limitations),
        isPopular: source.isPopular === true, badge: stringValue(source.badge),
        ctaLabel: stringValue(source.ctaLabel, base.ctaLabel), ctaUrl: stringValue(source.ctaUrl),
        freeTrial: stringValue(source.freeTrial), moneyBackGuarantee: stringValue(source.moneyBackGuarantee),
        notes: stringValue(source.notes),
    };
}

/** Hydrates old v2 drafts without dropping recognized fields or changing their payload shape. */
export function normalizeDraft(value: unknown): FormData {
    const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const defaults = createEmptyFormData();
    const pricing = stringValue(source.pricing) as Pricing;
    const role = stringValue(source.submitterRole) as (typeof ROLES)[number];
    const faqs = Array.isArray(source.faqs)
        ? source.faqs.map((faq) => {
            const item = faq && typeof faq === 'object' ? faq as Record<string, unknown> : {};
            return { question: stringValue(item.question), answer: stringValue(item.answer) };
        })
        : [];
    const socials = source.socials && typeof source.socials === 'object' ? source.socials as Record<string, unknown> : {};

    return {
        ...defaults,
        name: stringValue(source.name), tagline: stringValue(source.tagline), website: stringValue(source.website),
        logoUrl: stringValue(source.logoUrl), category: CATEGORY_SLUGS.has(stringValue(source.category)) ? stringValue(source.category) : '',
        audiences: stringArray(source.audiences).filter((audience): audience is Audience => AUDIENCE_VALUES.has(audience as Audience)),
        description: stringValue(source.description), keyFeatures: stringArray(source.keyFeatures),
        pros: stringArray(source.pros), cons: stringArray(source.cons),
        pricing: PRICING_VALUES.has(pricing) ? pricing : defaults.pricing,
        startingPrice: stringValue(source.startingPrice), hasFreeTier: typeof source.hasFreeTier === 'boolean' ? source.hasFreeTier : defaults.hasFreeTier,
        pricingTiers: Array.isArray(source.pricingTiers) ? source.pricingTiers.map(normalizeTier) : [],
        faqs, screenshots: stringArray(source.screenshots), demoVideo: stringValue(source.demoVideo),
        submitterName: stringValue(source.submitterName), submitterEmail: stringValue(source.submitterEmail),
        submitterRole: ROLE_VALUES.has(role) ? role : defaults.submitterRole,
        socials: {
            twitter: stringValue(socials.twitter) || undefined, linkedin: stringValue(socials.linkedin) || undefined,
            youtube: stringValue(socials.youtube) || undefined, github: stringValue(socials.github) || undefined,
        },
        agreeGuidelines: source.agreeGuidelines === true, agreeContact: typeof source.agreeContact === 'boolean' ? source.agreeContact : defaults.agreeContact,
        reviewNotes: stringValue(source.reviewNotes),
    };
}

export function normalizeHttpUrl(value: string): string { return value.trim(); }

export function isValidHttpUrl(value: string): boolean {
    const candidate = normalizeHttpUrl(value);
    if (!candidate || candidate.length > URL_MAX_LENGTH) return false;
    try {
        const url = new URL(candidate);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
        if (!host || host.includes('..') || host.startsWith('.') || host.endsWith('.')) return false;
        if (host.includes(':')) return true;
        return host.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label));
    } catch {
        return false;
    }
}

export function isValidEmail(value: string): boolean {
    const candidate = value.trim();
    return candidate.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
}

export function parseOptionalPrice(value: string): number | null {
    const candidate = value.trim();
    if (!candidate) return null;
    const number = Number(candidate.replace(/[$,]/g, ''));
    return Number.isFinite(number) && number >= 0 ? number : null;
}
