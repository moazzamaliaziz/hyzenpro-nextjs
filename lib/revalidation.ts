import { revalidateTag, revalidatePath } from 'next/cache';

type CacheProfile = 'page' | 'default' | string;

type ContentType =
    | 'tools'
    | 'posts'
    | 'categories'
    | 'persona-pages'
    | 'homepage'
    | 'navigation'
    | 'media'
    | 'ctas'
    | 'ads'
    | 'reviews'
    | 'authors'
    | 'settings';

const REVALIDATION_MAP: Record<ContentType, string[]> = {
    tools: ['tools', 'homepage', 'categories'],
    posts: ['posts', 'homepage'],
    categories: ['categories', 'tools'],
    'persona-pages': ['persona-pages', 'tools'],
    homepage: ['homepage'],
    navigation: ['navigation'],
    media: ['media'],
    ctas: ['ctas'],
    ads: ['ads'],
    reviews: ['reviews', 'tools'],
    authors: ['authors', 'posts'],
    settings: ['settings', 'navigation'],
};

export async function revalidateContent(type: ContentType, slug?: string): Promise<void> {
    const tags = REVALIDATION_MAP[type] ?? [type];

    for (const tag of tags) {
        revalidateTag(tag, 'default');
    }

    if (slug) {
        switch (type) {
            case 'tools':
                revalidatePath(`/tools/${slug}`);
                break;
            case 'posts':
                revalidatePath(`/blog/${slug}`);
                break;
            case 'categories':
                revalidatePath(`/category/${slug}`);
                break;
            case 'persona-pages':
                revalidatePath(`/ai-tools-for/${slug}`);
                break;
        }
    }

    if (['tools', 'posts', 'categories', 'homepage'].includes(type)) {
        revalidatePath('/');
    }
}
