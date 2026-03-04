import { getBaseUrl } from './utils';

const BASE_URL = getBaseUrl();

// Organization Schema (E-E-A-T)
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'HyzenPro',
        url: BASE_URL,
        logo: `${BASE_URL}/images/logo.png`,
        description:
            'HyzenPro is the premier AI tools directory helping creators, developers, and businesses discover, compare, and choose the best AI tools.',
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
        description: 'Best AI Tools Directory & Reviews',
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
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || '',
        image: post.featuredImage || `${BASE_URL}/images/og-default.jpg`,
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
                url: `${BASE_URL}/images/logo.png`,
            },
        },
        url: `${BASE_URL}/${post.slug}/`,
        datePublished: post.publishedAt
            ? new Date(post.publishedAt).toISOString()
            : undefined,
        dateModified: post.updatedAt
            ? new Date(post.updatedAt).toISOString()
            : undefined,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/${post.slug}/`,
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
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.shortDescription,
        url: tool.websiteUrl,
        applicationCategory: 'AIApplication',
        image: tool.logo || `${BASE_URL}/images/og-default.jpg`,
        offers: {
            '@type': 'Offer',
            price: tool.pricingType === 'free' ? '0' : undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: tool.rating
            ? {
                '@type': 'AggregateRating',
                ratingValue: tool.rating,
                bestRating: '5',
                worstRating: '1',
                ratingCount: '1',
            }
            : undefined,
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
