import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateShort(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
}

export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = stripHtml(content).split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

export function getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
}

export function absoluteUrl(path: string): string {
    return `${getBaseUrl()}${path}`;
}

// Category icon mapping
export const CATEGORY_ICONS: Record<string, string> = {
    'ai-automation-tools': '⚡',
    'ai-chatbots': '🤖',
    'ai-coding-tools': '💻',
    'ai-design-tools': '🎨',
    'ai-general-tools': '🔧',
    'ai-image-tools': '🖼️',
    'ai-marketing-tools': '📈',
    'ai-productivity-tools': '🚀',
    'ai-subtitle-generators': '💬',
    'ai-ui-generators': '🖥️',
    'ai-video-tools': '🎬',
    'ai-voice-tools': '🎤',
    'ai-website-builder': '🌐',
    'ai-writing-tools': '✍️',
    'avatar-generators': '👤',
    'copywriting': '📝',
    'seo-tools': '🔍',
    'text-to-speech': '🗣️',
};

export function getCategoryIcon(slug: string): string {
    return CATEGORY_ICONS[slug] || '🔧';
}

// Pricing label mapping
export function getPricingLabel(pricing: string): string {
    const labels: Record<string, string> = {
        free: 'Free',
        freemium: 'Freemium',
        paid: 'Paid',
        enterprise: 'Enterprise',
    };
    return labels[pricing] || pricing;
}

export function getPricingColor(pricing: string): string {
    const colors: Record<string, string> = {
        free: 'text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700',
        freemium: 'text-black dark:text-white bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
        paid: 'text-white dark:text-black bg-black dark:bg-white border border-black dark:border-white',
        enterprise: 'text-white dark:text-black bg-gray-900 dark:bg-gray-100 border border-gray-900 dark:border-gray-100',
    };
    return colors[pricing] || 'text-gray-600 bg-gray-50 border border-gray-200';
}
