import Link from 'next/link';
import MatcherSpotlight from '@/components/quiz/MatcherSpotlight';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/blog/Pagination';
import {
    buildBlogHref,
    type BlogListingFilters,
    type BlogPostSummary,
} from '@/lib/blog-query';

type TaxonomyOption = { name: string; count: number };

interface BlogPostsBrowserProps {
    posts: BlogPostSummary[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    categories?: TaxonomyOption[];
    moreCategories?: TaxonomyOption[];
    popularTags?: TaxonomyOption[];
    selectedCategory?: string;
    selectedTag?: string;
    searchQuery?: string;
    basePath?: string;
    showFilters?: boolean;
    showMatcher?: boolean;
    locale?: string;
    paginationFilters?: Omit<BlogListingFilters, 'page'>;
}

function normalizeFilter(value: string) {
    return value.trim().toLocaleLowerCase();
}

function FilterForm({
    filters,
    basePath,
    popularTags,
    idPrefix = 'blog',
}: {
    filters: BlogListingFilters;
    basePath: string;
    popularTags: TaxonomyOption[];
    idPrefix?: string;
}) {
    return (
        <form method="get" action={basePath} className="space-y-4" role="search">
            {filters.category && <input type="hidden" name="category" value={filters.category} />}
            <div>
                <label htmlFor={`${idPrefix}-search`} className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Search articles
                </label>
                <input
                    id={`${idPrefix}-search`}
                    name="q"
                    type="search"
                    defaultValue={filters.q}
                    placeholder="Try a tool, workflow, or model"
                    className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                />
            </div>
            <div>
                <label htmlFor={`${idPrefix}-tag`} className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Filter by tag
                </label>
                <input
                    id={`${idPrefix}-tag`}
                    name="tag"
                    type="search"
                    list={`${idPrefix}-popular-tags`}
                    defaultValue={filters.tag}
                    placeholder="e.g. Claude or benchmarks"
                    className="min-h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10"
                />
                <datalist id={`${idPrefix}-popular-tags`}>
                    {popularTags.map((tag) => <option key={tag.name} value={tag.name} />)}
                </datalist>
            </div>
            <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
                Apply filters
            </button>
        </form>
    );
}

function CategoryLinks({
    categories,
    moreCategories,
    filters,
    basePath,
}: {
    categories: TaxonomyOption[];
    moreCategories: TaxonomyOption[];
    filters: BlogListingFilters;
    basePath: string;
}) {
    return (
        <div className="space-y-1" aria-label="Blog categories">
            <Link
                href={buildBlogHref({ tag: filters.tag, q: filters.q }, basePath)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${!filters.category ? 'bg-black font-semibold text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
            >
                <span>All articles</span>
            </Link>
            {categories.map((category) => {
                const active = normalizeFilter(filters.category || '') === normalizeFilter(category.name);
                return (
                    <Link
                        key={category.name}
                        href={buildBlogHref({ category: category.name, tag: filters.tag, q: filters.q }, basePath)}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${active ? 'bg-gray-100 font-semibold text-black' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}
                    >
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-400">{category.count}</span>
                    </Link>
                );
            })}
            {moreCategories.length > 0 && (
                <details className="pt-2">
                    <summary className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-black">
                        More categories
                    </summary>
                    <div className="mt-1 space-y-1 border-l border-gray-200 pl-2">
                        {moreCategories.map((category) => (
                            <Link
                                key={category.name}
                                href={buildBlogHref({ category: category.name, tag: filters.tag, q: filters.q }, basePath)}
                                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                            >
                                <span>{category.name}</span>
                                <span className="text-xs text-gray-400">{category.count}</span>
                            </Link>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}

function FilterPanel({
    filters,
    categories,
    moreCategories,
    popularTags,
    basePath,
    mobile = false,
}: {
    filters: BlogListingFilters;
    categories: TaxonomyOption[];
    moreCategories: TaxonomyOption[];
    popularTags: TaxonomyOption[];
    basePath: string;
    mobile?: boolean;
}) {
    const content = (
        <div className="space-y-6">
            <FilterForm filters={filters} basePath={basePath} popularTags={popularTags} idPrefix={mobile ? 'mobile-blog' : 'desktop-blog'} />
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Browse by category</p>
                <CategoryLinks categories={categories} moreCategories={moreCategories} filters={filters} basePath={basePath} />
            </div>
            {popularTags.length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Popular tags</p>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.slice(0, 10).map((tag) => (
                            <Link
                                key={tag.name}
                                href={buildBlogHref({ category: filters.category, tag: tag.name, q: filters.q }, basePath)}
                                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (mobile) {
        return (
            <details className="mb-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-2xl px-2 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black [&::-webkit-details-marker]:hidden">
                    <span>Filter and search</span>
                    <span className="text-xs font-normal text-gray-500">{filters.category || filters.tag || filters.q ? 'Filters active' : 'Browse the archive'}</span>
                </summary>
                <div className="mt-4 border-t border-gray-100 pt-4">{content}</div>
            </details>
        );
    }

    return (
        <aside aria-label="Blog filters" className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                {content}
            </div>
        </aside>
    );
}

export default function BlogPostsBrowser({
    posts,
    totalCount,
    totalPages,
    currentPage,
    categories = [],
    moreCategories = [],
    popularTags = [],
    selectedCategory = '',
    selectedTag = '',
    searchQuery = '',
    basePath = '/blog/',
    showFilters = true,
    showMatcher = true,
    locale = 'en',
    paginationFilters,
}: BlogPostsBrowserProps) {
    const filters: BlogListingFilters = {
        category: selectedCategory,
        tag: selectedTag,
        q: searchQuery,
    };
    const isFiltered = Boolean(selectedCategory || selectedTag || searchQuery);

    return (
        <>
            {showFilters && (
                <>
                    <FilterPanel
                        filters={filters}
                        categories={categories}
                        moreCategories={moreCategories}
                        popularTags={popularTags}
                        basePath={basePath}
                        mobile
                    />
                    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
                        <FilterPanel
                            filters={filters}
                            categories={categories}
                            moreCategories={moreCategories}
                            popularTags={popularTags}
                            basePath={basePath}
                        />
                        <ListingContent
                            posts={posts}
                            totalCount={totalCount}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            filters={filters}
                            basePath={basePath}
                            isFiltered={isFiltered}
                            showMatcher={showMatcher}
                            locale={locale}
                            paginationFilters={paginationFilters || filters}
                        />
                    </div>
                </>
            )}
            {!showFilters && (
                <ListingContent
                    posts={posts}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    filters={filters}
                    basePath={basePath}
                    isFiltered={isFiltered}
                    showMatcher={showMatcher}
                    locale={locale}
                    paginationFilters={paginationFilters || filters}
                />
            )}
        </>
    );
}

function ListingContent({
    posts,
    totalCount,
    totalPages,
    currentPage,
    filters,
    basePath,
    isFiltered,
    showMatcher,
    locale,
    paginationFilters,
}: {
    posts: BlogPostSummary[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    filters: BlogListingFilters;
    basePath: string;
    isFiltered: boolean;
    showMatcher: boolean;
    locale: string;
    paginationFilters: Omit<BlogListingFilters, 'page'>;
}) {
    return (
        <section aria-labelledby="blog-results-heading">
            <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">The archive</p>
                    <h2 id="blog-results-heading" className="mt-1 font-heading text-2xl text-black sm:text-3xl">
                        {isFiltered ? 'Your shortlist' : 'Latest insights'}
                    </h2>
                </div>
                <p className="text-sm text-gray-500" aria-live="polite">
                    {totalCount} article{totalCount === 1 ? '' : 's'}
                    {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ''}
                </p>
            </div>

            {isFiltered && (
                <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Active filters:</span>
                    {filters.category && <span className="rounded-full bg-white px-3 py-1">{filters.category}</span>}
                    {filters.tag && <span className="rounded-full bg-white px-3 py-1">{filters.tag}</span>}
                    {filters.q && <span className="rounded-full bg-white px-3 py-1">“{filters.q}”</span>}
                    <Link href={basePath} className="ml-auto font-semibold text-gray-500 underline underline-offset-4 hover:text-black">Clear all</Link>
                </div>
            )}

            {posts.length > 0 ? (
                <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post, index) => (
                            <PostCard key={post.id} post={post} priority={index === 0 && currentPage === 1} locale={locale} />
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} filters={paginationFilters} />
                    {showMatcher && !isFiltered && (
                        <div className="mt-12">
                            <MatcherSpotlight
                                source="blog-index"
                                title="Need a shortlist faster than reading every review?"
                                description="Use the matcher when you want guided recommendations first, then come back to the reviews with a cleaner buying angle."
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
                    <h3 className="font-heading text-xl text-black">No articles match these filters</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Try a broader search or clear the active filters to browse the full HyzenPro archive.</p>
                    <Link href={basePath} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">View all articles</Link>
                </div>
            )}
        </section>
    );
}
