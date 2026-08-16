import prisma from './prisma';
import { routing } from '@/i18n/routing';

export type TranslationStatus = 'draft' | 'ai_translated' | 'reviewed' | 'published';

function isPublished(status: string): boolean {
    return status === 'published';
}

export async function getToolTranslation(toolId: string, locale: string) {
    if (locale === 'en') return null;
    if (!routing.locales.includes(locale as any)) return null;

    try {
        const translation = await prisma.toolTranslation.findUnique({
            where: { toolId_locale: { toolId, locale } },
        });
        if (translation && isPublished(translation.status)) return translation;
    } catch {}
    return null;
}

export async function getPostTranslation(postId: string, locale: string) {
    if (locale === 'en') return null;
    if (!routing.locales.includes(locale as any)) return null;

    try {
        const translation = await prisma.postTranslation.findUnique({
            where: { postId_locale: { postId, locale } },
        });
        if (translation && isPublished(translation.status)) return translation;
    } catch {}
    return null;
}

export async function getCategoryTranslation(categoryId: string, locale: string) {
    if (locale === 'en') return null;
    if (!routing.locales.includes(locale as any)) return null;

    try {
        const translation = await prisma.categoryTranslation.findUnique({
            where: { categoryId_locale: { categoryId, locale } },
        });
        if (translation && isPublished(translation.status)) return translation;
    } catch {}
    return null;
}

export function getAlternateLinks(locale: string, path: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const pathWithoutTrailingSlash = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;

    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        if (loc === 'en') {
            languages[loc] = `${siteUrl}${pathWithoutTrailingSlash}/`;
        } else {
            languages[loc] = `${siteUrl}/${loc}${pathWithoutTrailingSlash}/`;
        }
    }
    languages['x-default'] = `${siteUrl}${pathWithoutTrailingSlash}/`;

    return {
        canonical: locale === 'en'
            ? `${siteUrl}${pathWithoutTrailingSlash}/`
            : `${siteUrl}/${locale}${pathWithoutTrailingSlash}/`,
        languages,
    };
}
