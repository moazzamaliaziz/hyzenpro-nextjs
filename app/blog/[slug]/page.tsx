import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthorBox from '@/components/eeat/AuthorBox';
import TableOfContents from '@/components/blog/TableOfContents';
import { getAllPosts, getPostAuthor } from '@/lib/wordpress';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-static';

// Generate all blog post pages at build time
export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// Generate metadata for each post
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const posts = await getAllPosts();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        return { title: 'Post Not Found | HyzenPro' };
    }

    return {
        title: `${post.title} | HyzenPro Blog`,
        description: post.excerpt,
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.excerpt,
            images: [post.featuredImage],
            publishedTime: post.date,
            authors: [post.author],
        },
    };
}

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const posts = await getAllPosts();
    const post = posts.find(p => p.slug === slug);
    const author = post ? await getPostAuthor(post) : null;

    if (!post) {
        return (
            <div className="dark-bg min-h-screen">
                <Header />
                <main className="pt-32 text-center text-white">
                    <h1 className="font-heading text-6xl">Post Not Found</h1>
                    <Link href="/blog" className="text-gray-400 mt-4 inline-block hover:text-white">
                        ← Back to Blog
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    // Get related posts
    const relatedPosts = posts
        .filter(p => p.id !== post.id)
        .slice(0, 3);

    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white">
                    <div className="container max-w-4xl">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-white line-clamp-1">{post.title}</span>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 mb-6">
                            {post.categories.map(cat => (
                                <span key={cat} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="font-heading text-4xl md:text-6xl mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex items-center gap-6 text-gray-400">
                            <span className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    {post.author.charAt(0)}
                                </div>
                                {post.author}
                            </span>
                            <span>{new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </section>

                {/* Featured Image */}
                <section className="bg-black pb-12">
                    <div className="container max-w-4xl">
                        <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden">
                            <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="section bg-white">
                    <div className="container max-w-3xl">
                        <TableOfContents />
                        <article className="prose prose-lg max-w-none">
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                {post.excerpt}
                            </p>

                            {/* Demo content - would come from WordPress */}
                            <h2 className="font-heading text-3xl text-black mt-12 mb-6">Introduction</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                In the rapidly evolving landscape of artificial intelligence, staying informed about the latest tools and technologies is essential. This comprehensive guide will help you understand the key features, benefits, and potential applications of modern AI solutions.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-12 mb-6">Key Takeaways</h2>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">AI tools are becoming more accessible to everyday users</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">Integration with existing workflows is getting easier</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span className="text-gray-700">Cost-effective solutions are now available for small businesses</span>
                                </li>
                            </ul>

                            <h2 className="font-heading text-3xl text-black mt-12 mb-6">Conclusion</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                As AI continues to advance, we can expect even more innovative tools and applications. Stay tuned to HyzenPro for the latest reviews, comparisons, and guides to help you navigate this exciting landscape.
                            </p>
                        </article>

                        {/* Author Box */}
                        {author && (
                            <div className="mt-16 pt-12 border-t border-gray-100">
                                <h3 className="font-heading text-xl text-gray-500 uppercase tracking-widest mb-8">About the Author</h3>
                                <AuthorBox author={author} variant="full" />
                            </div>
                        )}

                        {/* Share */}
                        <div className="border-t border-gray-200 mt-12 pt-8">
                            <h3 className="font-heading text-xl text-black mb-4">SHARE THIS ARTICLE</h3>
                            <div className="flex gap-4">
                                <a href={`https://twitter.com/intent/tweet?url=https://hyzenpro.com/blog/${post.slug}&text=${post.title}`}
                                    target="_blank" rel="noopener"
                                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    Twitter
                                </a>
                                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=https://hyzenpro.com/blog/${post.slug}`}
                                    target="_blank" rel="noopener"
                                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="section bg-[#f5f5f5]">
                        <div className="container">
                            <h2 className="font-heading text-4xl text-black text-center mb-12">
                                RELATED ARTICLES
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedPosts.map(relatedPost => (
                                    <article key={relatedPost.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                        <div className="h-48 bg-gray-100 overflow-hidden">
                                            <img
                                                src={relatedPost.featuredImage}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <Link href={`/blog/${relatedPost.slug}`}>
                                                <h3 className="font-heading text-xl text-black group-hover:text-accent transition-colors line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {new Date(relatedPost.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
