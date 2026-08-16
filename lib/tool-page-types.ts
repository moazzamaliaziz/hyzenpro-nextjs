export interface PricingTier {
    name: string;
    monthlyPrice: number | null;
    annualPrice: number | null;
    currency: string;
    description: string;
    features: string[];
    isPopular: boolean;
    ctaLabel: string;
    ctaUrl: string;
    billingPeriod?: string;
    limitations?: string[];
    badge?: string;
    annualNote?: string;
    freeTrial?: string;
    moneyBackGuarantee?: string;
    notes?: string;
}

export interface RatingCategory {
    label: string;
    score: number;
}

export interface Screenshot {
    url: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
}

export interface TutorialVideo {
    videoId: string;
    title: string;
    channelName: string;
    channelAvatar?: string;
    views: string;
    publishedDate: string;
}

export interface UserPersona {
    label: string;
    icon: string;
    description: string;
    fit: 'good' | 'notIdeal';
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface AlternativeTool {
    name: string;
    slug: string;
    tagline: string;
    rating?: number;
    pricingLabel?: string;
    category?: string;
}

export interface SocialLink {
    platform: 'twitter' | 'linkedin' | 'youtube' | 'github';
    url: string;
}

export interface ToolHeroStat {
    label: string;
    value: string;
    detail?: string;
}

export interface ToolOffer {
    badge?: string;
    headline: string;
    detail?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    couponCode?: string;
    expiresAt?: string;
}

export interface ToolFeatureHighlight {
    title: string;
    description: string;
}

export interface ToolReviewPoint {
    title: string;
    description: string;
}

export interface ExternalReviewSource {
    platform: string;
    ratingText?: string;
    reviewCountText?: string;
    summary: string;
    url: string;
}

export interface ToolPageMeta {
    displayName?: string;
    displayLogo?: string;
    tagline?: string;
    overviewHtml?: string;
    uniqueValueHtml?: string;
    featureHighlights?: ToolFeatureHighlight[];
    prosDetailed?: ToolReviewPoint[];
    consDetailed?: ToolReviewPoint[];
    reviewsIntro?: string;
    reviewSources?: ExternalReviewSource[];
    pricingIntro?: string;
    pricingTiers?: PricingTier[];
    ratingBreakdown?: RatingCategory[];
    ratingSummary?: string;
    screenshots?: Screenshot[];
    videos?: TutorialVideo[];
    personas?: UserPersona[];
    faq?: FAQItem[];
    verdict?: string;
    bestFor?: string[];
    skipIf?: string[];
    alternatives?: AlternativeTool[];
    socialLinks?: SocialLink[];
    lastReviewedDate?: string;
    verified?: boolean;
    reviewCount?: number;
    heroStats?: ToolHeroStat[];
    currentDeal?: ToolOffer;
    bestValueNote?: string;
    integrationsLabel?: string;
    bestForLabel?: string;
    operatingSystem?: string;
    applicationCategory?: string;
}
