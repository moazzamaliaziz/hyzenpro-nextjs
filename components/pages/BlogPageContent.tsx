import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import BlogPostsBrowser from '@/components/blog/BlogPostsBrowser';
import {
    getBlogInventory,
    getBlogListing,
    getCategoryOptions,
    getPageValue,
    getPopularTagOptions,
    getQueryValue,
} from '@/lib/blog-query';

export default async function BlogPageContent({
    searchParams,
    locale = 'en',
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
    locale?: string;
}) {
    const resolvedSearchParams = await searchParams;
    const filters = {
        category: getQueryValue(resolvedSearchParams?.category),
        tag: getQueryValue(resolvedSearchParams?.tag),
        q: getQueryValue(resolvedSearchParams?.q),
        page: getPageValue(resolvedSearchParams?.page),
    };
    const [inventory, listing] = await Promise.all([
        getBlogInventory(),
        getBlogListing(filters),
    ]);
    const { curated, more } = getCategoryOptions(inventory);
    const popularTags = getPopularTagOptions(inventory);
    const basePath = locale === 'en' ? '/blog/' : `/${locale}/blog/`;

    return (
        <>
            <main id="main-content" tabIndex={-1} className="min-h-screen pb-20 pt-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Blog', href: basePath }]} className="mb-8" />

                    <header className="mb-12 max-w-3xl">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">From the HyzenPro desk</p>
                        <h1 className="font-serif text-4xl leading-tight text-black sm:text-5xl lg:text-6xl">
                            AI tools, explained with <span className="italic text-gray-500">judgment.</span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                            Independent reviews, comparisons, and practical guides for choosing better software without the noise.
                        </p>
                    </header>

                    <BlogPostsBrowser
                        posts={listing.posts}
                        totalCount={listing.totalCount}
                        totalPages={listing.totalPages}
                        currentPage={listing.currentPage}
                        categories={curated}
                        moreCategories={more}
                        popularTags={popularTags}
                        selectedCategory={listing.filters.category}
                        selectedTag={listing.filters.tag}
                        searchQuery={listing.filters.q}
                        basePath={basePath}
                        locale={locale}
                    />

                    {/* Server-rendered editorial links keep key articles discoverable to crawlers. */}
                    <section aria-labelledby="featured-research-heading" className="mt-14 border-t border-border pt-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Featured research</p>
                        <h2 id="featured-research-heading" className="mt-2 font-serif text-2xl text-foreground">
                            More AI tool reviews worth reading
                        </h2>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Link href="/blog/cursor-composer-2-5-review/" className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-foreground underline-offset-4 hover:bg-muted hover:underline">
                                Cursor Composer 2.5 review
                            </Link>
                            <Link href="/ai-tools-directory/ai-automation-tools/simplygrow/" className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-foreground underline-offset-4 hover:bg-muted hover:underline">
                                SimplyGrow review
                            </Link>
                            <Link href="/ai-tools-directory/copywriting/loqua/" className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-foreground underline-offset-4 hover:bg-muted hover:underline">
                                Loqua review
                            </Link>
                            <Link href="/ai-tools-directory/ai-general-tools/mindvault/" className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-foreground underline-offset-4 hover:bg-muted hover:underline">
                                MindVault review
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
