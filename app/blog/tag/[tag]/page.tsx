import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import { buildBlogQuery, getBlogListing, getPageValue, getQueryValue } from '@/lib/blog-query';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 300;

interface Props {
    params: Promise<{ tag: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function displayNameFromParam(value: string) {
    return decodeURIComponent(value)
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { tag } = await params;
    const resolved = await searchParams;
    const category = getQueryValue(resolved?.category);
    const q = getQueryValue(resolved?.q);
    const page = getPageValue(resolved?.page);
    const listing = await getBlogListing({ tag, category, q, page });
    const displayName = displayNameFromParam(tag);
    const query = buildBlogQuery({ category, q, page: listing.currentPage });
    const canonical = `${getBaseUrl()}/blog/tag/${encodeURIComponent(tag)}/${query}`;

    return {
        title: `AI Tool Articles Tagged “${displayName}”`,
        description: `Browse ${listing.totalCount} HyzenPro article${listing.totalCount === 1 ? '' : 's'} tagged ${displayName}.`,
        alternates: { canonical },
        robots: { index: listing.totalCount >= 3 && !category && !q, follow: true },
    };
}

export default async function TagArchivePage({ params, searchParams }: Props) {
    const { tag } = await params;
    const resolved = await searchParams;
    const category = getQueryValue(resolved?.category);
    const q = getQueryValue(resolved?.q);
    const page = getPageValue(resolved?.page);
    const listing = await getBlogListing({ tag, category, q, page });
    const displayName = displayNameFromParam(tag);
    const basePath = `/blog/tag/${encodeURIComponent(tag)}/`;

    return (
        <>
            <main id="main-content" tabIndex={-1} className="min-h-screen pb-20 pt-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: 'Tags', href: '/blog/' },
                            { label: displayName },
                        ]}
                        className="mb-8"
                    />
                    <header className="mb-10 max-w-3xl">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Tag archive</p>
                        <h1 className="font-serif text-4xl leading-tight text-black sm:text-5xl">{displayName}</h1>
                        <p className="mt-4 text-base leading-7 text-gray-700">
                            {listing.totalCount} article{listing.totalCount === 1 ? '' : 's'} tagged with this topic.
                        </p>
                    </header>
                    <BlogPostsBrowser
                        posts={listing.posts}
                        totalCount={listing.totalCount}
                        totalPages={listing.totalPages}
                        currentPage={listing.currentPage}
                        selectedTag={tag}
                        selectedCategory={category}
                        searchQuery={q}
                        basePath={basePath}
                        showFilters={false}
                        showMatcher={false}
                        paginationFilters={{ category, q }}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}
