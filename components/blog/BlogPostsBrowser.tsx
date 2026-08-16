import Link from 'next/link';
import MatcherSpotlight from '@/components/quiz/MatcherSpotlight';
import PostCard from '@/components/blog/PostCard';

interface BlogPostSummary {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string;
    featuredImage?: string | null;
    categories?: string[] | null;
    tags?: string[] | null;
    author: string;
    authorModel?: {
        id: string;
        name: string;
        slug: string;
        image?: string | null;
    } | null;
    publishedAt?: string | null;
}

interface BlogPostsBrowserProps {
    posts: BlogPostSummary[];
    categories: string[];
    tags: string[];
    selectedCategory?: string;
    selectedTag?: string;
}

function normalizeFilter(value: string) {
    return value.trim().toLowerCase();
}

export default function BlogPostsBrowser({
    posts,
    categories,
    tags,
    selectedCategory = '',
    selectedTag = '',
}: BlogPostsBrowserProps) {
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeCategories = Array.isArray(categories) ? categories.filter(Boolean) : [];
    const safeTags = Array.isArray(tags) ? tags.filter(Boolean) : [];

    const activeCategory = selectedCategory.trim();
    const activeTag = selectedTag.trim();

    const filteredPosts = safePosts.filter((post) => {
        const matchesCategory = activeCategory
            ? (Array.isArray(post.categories) ? post.categories : []).some(
                  (cat) => normalizeFilter(cat) === normalizeFilter(activeCategory)
              )
            : true;
        const matchesTag = activeTag
            ? (Array.isArray(post.tags) ? post.tags : []).some(
                  (tag) => normalizeFilter(tag) === normalizeFilter(activeTag)
              )
            : true;
        return matchesCategory && matchesTag;
    });

    const isFiltered = !!activeCategory || !!activeTag;

    return (
        <>
            {/* Category Filter Pills */}
            {safeCategories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Link
                        href="/blog/"
                        prefetch={true}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-colors ${
                            !isFiltered
                                ? 'bg-black border-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All Posts
                    </Link>
                    {safeCategories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/blog/?category=${encodeURIComponent(cat)}`}
                            prefetch={true}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-colors cursor-pointer ${
                                normalizeFilter(activeCategory) === normalizeFilter(cat)
                                    ? 'bg-black border-black text-white hover:bg-gray-800'
                                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
            )}

            {/* Tag Filter Pills */}
            {safeTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 self-center mr-1">
                        Tags:
                    </span>
                    {safeTags.map((tag) => (
                        <Link
                            key={tag}
                            href={
                                normalizeFilter(activeTag) === normalizeFilter(tag)
                                    ? '/blog/' // deselect on re-click
                                    : `/blog/?tag=${encodeURIComponent(tag)}`
                            }
                            prefetch={true}
                            className={`px-3 py-1.5 text-[11px] font-medium border rounded-full transition-colors cursor-pointer ${
                                normalizeFilter(activeTag) === normalizeFilter(tag)
                                    ? 'bg-black border-black text-white hover:bg-gray-800'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}

            {/* Active filter notice */}
            {isFiltered && (
                <div className="flex items-center gap-3 mb-8 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                    <span>
                        Filtering by{' '}
                        {activeCategory && (
                            <>
                                category <strong className="text-black">{activeCategory}</strong>
                            </>
                        )}
                        {activeCategory && activeTag && ' & '}
                        {activeTag && (
                            <>
                                tag <strong className="text-black">{activeTag}</strong>
                            </>
                        )}
                        {' '}— {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
                    </span>
                    <Link
                        href="/blog/"
                        className="ml-auto text-xs font-semibold text-gray-400 hover:text-black transition-colors whitespace-nowrap"
                    >
                        Clear filter ✕
                    </Link>
                </div>
            )}

            {filteredPosts.length > 0 ? (
                <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post, i) => (
                            <PostCard key={post.id} post={post} priority={i < 6} />
                        ))}
                    </div>

                    <div className="mt-12">
                        <MatcherSpotlight
                            source="blog-index"
                            title="Need a shortlist faster than reading every review?"
                            description="Use the matcher when you want guided recommendations first, then come back to the reviews with a cleaner buying angle."
                        />
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl">
                    <p className="text-gray-400">
                        {isFiltered
                            ? `No posts found for this filter. `
                            : 'No posts yet. Check back soon!'}
                        {isFiltered && (
                            <Link href="/blog/" className="underline text-gray-500 hover:text-black ml-1">
                                View all posts
                            </Link>
                        )}
                    </p>
                </div>
            )}
        </>
    );
}
