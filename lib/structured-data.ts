import { getBaseUrl } from './utils';
import { DEFAULT_SITE_LOGO_URL, DEFAULT_SITE_SHARE_IMAGE_URL } from '@/lib/branding';
import { getBlogPostPath } from '@/lib/blog-seo';
import type { ToolPageMeta } from '@/lib/tool-page-types';

const BASE_URL = getBaseUrl();

// Organization Schema (E-E-A-T)
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'HyzenPro',
        url: BASE_URL,
        logo: DEFAULT_SITE_LOGO_URL,
        description:
            'HyzenPro helps creators, marketers, and lean teams compare AI tools with focused reviews, practical guides, and shortlist matchers.',
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: `${BASE_URL}/contact/`,
        },
    };
}

// Website Schema with SearchAction
export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'HyzenPro',
        url: BASE_URL,
        description: 'Focused AI tool reviews, comparisons, and buying guides',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/ai-tools-directory/?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

// Article Schema for blog posts
export function generateArticleSchema(post: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    author: string;
    featuredImage?: string;
    publishedAt?: Date | string;
    updatedAt?: Date | string;
}) {
    const postUrl = `${BASE_URL}${getBlogPostPath(post.slug)}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || '',
        image: post.featuredImage || DEFAULT_SITE_SHARE_IMAGE_URL,
        author: {
            '@type': 'Person',
            name: post.author,
            url: `${BASE_URL}/about-us/`,
        },
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
            logo: {
                '@type': 'ImageObject',
                url: DEFAULT_SITE_LOGO_URL,
            },
        },
        url: postUrl,
        datePublished: post.publishedAt
            ? new Date(post.publishedAt).toISOString()
            : undefined,
        dateModified: post.updatedAt
            ? new Date(post.updatedAt).toISOString()
            : undefined,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl,
        },
    };
}

// SoftwareApplication Schema for tool pages
export function generateToolSchema(tool: {
    name: string;
    slug: string;
    shortDescription: string;
    websiteUrl: string;
    pricingType: string;
    rating?: number | null;
    logo?: string | null;
    primaryCategory?: string | null;
}, options?: {
    pageUrl?: string;
    toolPage?: ToolPageMeta;
    overallRating?: number;
    reviewCount?: number;
}) {
    const pricingTiers = options?.toolPage?.pricingTiers || [];
    const ratingValue = options?.overallRating || tool.rating || undefined;
    const ratingCount = options?.reviewCount || options?.toolPage?.reviewCount || undefined;
    const offers = pricingTiers.length > 0
        ? pricingTiers.map((tier) => ({
            '@type': 'Offer',
            name: tier.name,
            url: tier.ctaUrl,
            price: tier.monthlyPrice === null ? undefined : String(tier.monthlyPrice),
            priceCurrency: tier.currency,
            availability: 'https://schema.org/InStock',
            category: tier.name,
            description: tier.description,
        }))
        : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.shortDescription,
        url: tool.websiteUrl,
        applicationCategory: options?.toolPage?.applicationCategory || 'AIApplication',
        operatingSystem: options?.toolPage?.operatingSystem || 'Web',
        image: tool.logo || DEFAULT_SITE_SHARE_IMAGE_URL,
        screenshot: options?.toolPage?.screenshots?.map((item) => `${BASE_URL}${item.url}`),
        offers: offers || {
            '@type': 'Offer',
            price: tool.pricingType === 'free' ? '0' : undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: ratingValue
            ? {
                '@type': 'AggregateRating',
                ratingValue,
                bestRating: '5',
                worstRating: '1',
                ratingCount: ratingCount ? String(ratingCount) : '1',
                reviewCount: ratingCount ? String(ratingCount) : '1',
            }
            : undefined,
        review: options?.pageUrl && ratingValue
            ? {
                '@type': 'Review',
                author: {
                    '@type': 'Organization',
                    name: 'HyzenPro',
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'HyzenPro',
                },
                itemReviewed: {
                    '@type': 'SoftwareApplication',
                    name: tool.name,
                    applicationCategory: options?.toolPage?.applicationCategory || 'AIApplication',
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue,
                    bestRating: '5',
                    worstRating: '1',
                },
                reviewBody: options?.toolPage?.ratingSummary || tool.shortDescription,
                url: options.pageUrl,
            }
            : undefined,
        sameAs: tool.websiteUrl,
        isAccessibleForFree: tool.pricingType === 'free' || tool.pricingType === 'freemium',
        mainEntityOfPage: options?.pageUrl
            ? {
                '@type': 'WebPage',
                '@id': options.pageUrl,
            }
            : undefined,
    };
}

export function generateToolReviewSchema(review: {
    toolName: string;
    pageUrl: string;
    rating: number;
    summary: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        name: `HyzenPro review of ${review.toolName}`,
        author: {
            '@type': 'Organization',
            name: 'HyzenPro',
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
            url: BASE_URL,
        },
        itemReviewed: {
            '@type': 'SoftwareApplication',
            name: review.toolName,
            applicationCategory: 'AIApplication',
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: '5',
            worstRating: '1',
        },
        reviewBody: review.summary,
        url: review.pageUrl,
    };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
    items: { name: string; url: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// FAQ Schema
export function generateFaqSchema(
    faqs: { question: string; answer: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function generateWebApplicationSchema(app: {
    name: string;
    description: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: app.name,
        description: app.description,
        url: app.url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
            url: BASE_URL,
        },
    };
}

export function generateItemListSchema(items: { name: string; url: string; description?: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: item.url,
            description: item.description,
        })),
    };
}

// Review Schema for review pages
export function generateReviewSchema(review: {
    toolName: string;
    title: string;
    slug: string;
    rating: number;
    author: string;
    content: string;
    publishedAt?: Date | string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        name: review.title,
        reviewBody: review.content.substring(0, 500),
        author: {
            '@type': 'Person',
            name: review.author,
        },
        itemReviewed: {
            '@type': 'SoftwareApplication',
            name: review.toolName,
            applicationCategory: 'AIApplication',
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: '5',
            worstRating: '1',
        },
        datePublished: review.publishedAt
            ? new Date(review.publishedAt).toISOString()
            : undefined,
        publisher: {
            '@type': 'Organization',
            name: 'HyzenPro',
        },
    };
}
