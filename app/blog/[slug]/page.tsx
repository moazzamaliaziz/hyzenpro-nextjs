import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { DEDICATED_BLOG_SLUGS, getBlogDisplayTitle, getBlogDisplayExcerpt, getBlogFeaturedImage, getCanonicalBlogSlug } from '@/lib/blog-seo';
import { getSerpFriendlyTitle } from '@/lib/seo-titles';
import { resolvePostAuthor } from '@/lib/post-author';
import BlogPostPageContent from '@/components/pages/BlogPostPageContent';

export const revalidate = 86400;

export async function generateStaticParams() {
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            select: { slug: true }
        });
        return posts
            .map((post: any) => getCanonicalBlogSlug(post.slug))
            .filter((slug: string) => !DEDICATED_BLOG_SLUGS.has(slug))
            .map((slug: string) => ({ slug }));
    } catch (error) {
        console.error('[Blog] Failed to generate static params:', error);
        return [];
    }
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { authorModel: true }
        });

        if (!post) {
            return { title: 'Post Not Found | HyzenPro' };
        }

        const seo = post.seo as any;
        const title = getSerpFriendlyTitle(post.slug, seo?.metaTitle || `${getBlogDisplayTitle(post)} | HyzenPro Blog`);
        const description = seo?.metaDescription || getBlogDisplayExcerpt(post) || '';
        const image = seo?.ogImage || getBlogFeaturedImage(post);
        const imageUrl = image.startsWith('http') ? image : `${getBaseUrl()}${image}`;
        const fallbackAuthor = resolvePostAuthor(post);
        const authorName = fallbackAuthor.name;

        return {
            title,
            description,
            robots: {
                index: !(seo?.noIndex === true),
                follow: !(seo?.noIndex === true),
            },
            alternates: {
                canonical: seo?.canonicalUrl || `${getBaseUrl()}/blog/${post.slug}/`,
            },
            openGraph: {
                type: 'article',
                url: seo?.canonicalUrl || `${getBaseUrl()}/blog/${post.slug}/`,
                title,
                description,
                images: [imageUrl],
                publishedTime: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
                authors: [authorName],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
            other: {
                'article:author': authorName,
            },
        };
    } catch (error) {
        console.error('[Blog] Failed to generate metadata:', error);
        return { title: 'Post Not Found | HyzenPro' };
    }
}

export default async function BlogPostPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    return <BlogPostPageContent slug={slug} />;
}
