import { getEditorialAuthor } from './editorial-authors';

interface AuthorModelLike {
    name: string;
    slug: string;
    image?: string | null;
}

interface PostAuthorInput {
    author?: string | null;
    authorModel?: AuthorModelLike | null;
}

export interface ResolvedAuthor {
    name: string;
    slug: string | null;
    avatar: string | null;
}

const LEGACY_AUTHOR_MAP: Record<string, string> = {
    'HyzenPro Team': 'ali-malik',
    'HyzenPro Editorial': 'ali-malik',
    'Ariel R.': 'ali-malik',
};

export function resolvePostAuthor(post: PostAuthorInput): ResolvedAuthor {
    if (post.authorModel) {
        return {
            name: post.authorModel.name,
            slug: post.authorModel.slug,
            avatar: post.authorModel.image ?? null,
        };
    }
    if (post.author) {
        const slug = LEGACY_AUTHOR_MAP[post.author];
        if (slug) {
            const editorial = getEditorialAuthor(slug);
            return { name: editorial.name, slug: editorial.slug, avatar: editorial.avatar ?? null };
        }
        return { name: post.author, slug: null, avatar: null };
    }
    const fallback = getEditorialAuthor('ali-malik');
    return { name: fallback.name, slug: fallback.slug, avatar: fallback.avatar ?? null };
}
