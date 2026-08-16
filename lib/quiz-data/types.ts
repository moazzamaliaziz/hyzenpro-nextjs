export interface QuizOption {
  id: string;
  label: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  helper: string;
  options: QuizOption[];
}

export interface QuizToolConfig {
  id: string;
  toolSlug: string;
  name: string;
  reviewUrl: string;
  websiteUrl: string;
  toolCategorySlug: string;
  bestFor: string;
  standout: string;
  whyItMatches: string;
  scores: Record<string, number>;
}

export interface QuizFaqItem {
  question: string;
  answer: string;
}

export interface QuizRelatedLink {
  label: string;
  href: string;
  description: string;
}

export interface MatcherSponsoredPlacement {
  badge?: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  disclosure?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
}

export interface QuizCategoryConfig {
  category: string;
  title: string;
  subtitle: string;
  description: string;
  cardDescription: string;
  estimatedTime: string;
  toolCount: number;
  icon: string;
  trustItems: string[];
  intro: string[];
  questions: QuizQuestion[];
  tools: QuizToolConfig[];
  faq: QuizFaqItem[];
  relatedLinks: QuizRelatedLink[];
  sponsoredPlacement?: MatcherSponsoredPlacement | null;
}

export interface ResolvedQuizCategoryConfig extends Omit<QuizCategoryConfig, 'tools'> {
  tools: ResolvedQuizTool[];
}

export interface QuizCategoryCard {
  category: string;
  title: string;
  subtitle: string;
  description: string;
  cardDescription: string;
  estimatedTime: string;
  toolCount: number;
  icon: string;
  publishedToolCount?: number;
  readinessStatus?: 'ready' | 'growing' | 'building' | 'empty';
  readinessLabel?: string;
  readinessNote?: string;
  isLaunchReady?: boolean;
}

export interface ResolvedQuizTool extends QuizToolConfig {
  databaseId?: string;
  logo?: string | null;
  tagline?: string | null;
  pricingLabel?: string | null;
  rating?: number | null;
  primaryCategoryName?: string | null;
  currentDeal?: {
    badge?: string;
    headline: string;
    detail?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    couponCode?: string;
    expiresAt?: string;
  };
  bestValueNote?: string;
}

export interface ScoredQuizTool extends ResolvedQuizTool {
  totalScore: number;
}

export type QuizAnswers = Record<string, string>;
