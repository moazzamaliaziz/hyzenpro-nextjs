import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import { buildBlogQuery, getBlogListing, getPageValue, getQueryValue } from '@/lib/blog-query';
import { getBaseUrl } from '@/lib/utils';

export const revalidate = 300;

interface Props {
    params: Promise<{ category: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function displayNameFromParam(value: string) {
    return decodeURIComponent(value)
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { category } = await params;
    const resolved = await searchParams;
    const tag = getQueryValue(resolved?.tag);
    const q = getQueryValue(resolved?.q);
    const page = getPageValue(resolved?.page);
    const listing = await getBlogListing({ category, tag, q, page });
    const displayName = displayNameFromParam(category);
    const query = buildBlogQuery({ tag, q, page: listing.currentPage });
    const canonical = `${getBaseUrl()}/blog/category/${encodeURIComponent(category)}/${query}`;

    return {
        title: `${displayName} AI Tool Articles`,
        description: `Browse ${listing.totalCount} HyzenPro article${listing.totalCount === 1 ? '' : 's'} about ${displayName}. Reviews, tutorials, and comparisons for 2026.`,
        alternates: { canonical },
        robots: { index: listing.totalCount > 0 && !tag && !q, follow: true },
    };
}

export default async function CategoryArchivePage({ params, searchParams }: Props) {
    const { category } = await params;
    const resolved = await searchParams;
    const tag = getQueryValue(resolved?.tag);
    const q = getQueryValue(resolved?.q);
    const page = getPageValue(resolved?.page);
    const listing = await getBlogListing({ category, tag, q, page });
    const displayName = displayNameFromParam(category);
    const basePath = `/blog/category/${encodeURIComponent(category)}/`;

    return (
        <>
            <main id="main-content" tabIndex={-1} className="min-h-screen pb-20 pt-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: 'Categories', href: '/blog/' },
                            { label: displayName },
                        ]}
                        className="mb-8"
                    />
                    <header className="mb-10 max-w-3xl">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Category archive</p>
                        <h1 className="font-serif text-4xl leading-tight text-black sm:text-5xl">{displayName}</h1>
                        <p className="mt-4 text-base leading-7 text-gray-700">
                            {listing.totalCount} article{listing.totalCount === 1 ? '' : 's'} in this HyzenPro category.
                        </p>
                    </header>
                    <BlogPostsBrowser
                        posts={listing.posts}
                        totalCount={listing.totalCount}
                        totalPages={listing.totalPages}
                        currentPage={listing.currentPage}
                        selectedCategory={category}
                        selectedTag={tag}
                        searchQuery={q}
                        basePath={basePath}
                        showFilters={false}
                        showMatcher={false}
                        paginationFilters={{ tag, q }}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}
