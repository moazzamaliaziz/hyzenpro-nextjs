import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PrismaError {
    code?: string;
    message?: string;
}

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

export function slugify(text: unknown): string {
    return String(text ?? '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncate(text: unknown, length: number): string {
    const value = String(text ?? '');
    if (value.length <= length) return value;
    return value.substring(0, length).trim() + '...';
}

export function stripHtml(html: unknown): string {
    return String(html ?? '').replace(/<[^>]*>/g, '');
}

export function sanitizeInput(value: unknown): string {
    return stripHtml(String(value || '')).trim();
}

export function decodeHtmlEntities(value: unknown): string {
    return String(value ?? '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
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
    'ai-agentic-tools': '🤖',
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
    'text-to-speech': 'Ÿ—️',
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
        'open-source': 'Open Source',
    };
    return labels[pricing] || pricing;
}

export function getPricingColor(pricing: string): string {
    const colors: Record<string, string> = {
        free: 'text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700',
        freemium: 'text-black dark:text-white bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
        paid: 'text-white dark:text-black bg-black dark:bg-white border border-black dark:border-white',
        enterprise: 'text-white dark:text-black bg-gray-900 dark:bg-gray-100 border border-gray-900 dark:border-gray-100',
        'open-source': 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800',
    };
    return colors[pricing] || 'text-gray-600 bg-gray-50 border border-gray-200';
}
