import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getAlternateLinks, getPostTranslation } from '@/lib/locale-helpers';
import { getBlogDisplayTitle, getBlogDisplayExcerpt, getBlogFeaturedImage } from '@/lib/blog-seo';
import { getSerpFriendlyTitle } from '@/lib/seo-titles';
import BlogPostPageContent from '@/components/pages/BlogPostPageContent';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { slug, locale } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { authorModel: true },
        });

        if (!post) return { title: 'Post Not Found | HyzenPro' };

        const translation = await getPostTranslation(post.id, locale);
        const seo = post.seo as any;

        const title = translation?.title
            ? `${translation.title} | HyzenPro Blog`
            : getSerpFriendlyTitle(post.slug, seo?.metaTitle || `${getBlogDisplayTitle(post)} | HyzenPro Blog`);

        const description = translation?.excerpt || seo?.metaDescription || getBlogDisplayExcerpt(post) || '';

        const { canonical, languages } = getAlternateLinks(locale, `/blog/${post.slug}`);

        return {
            title,
            description,
            robots: { index: !(seo?.noIndex === true), follow: !(seo?.noIndex === true) },
            alternates: { canonical: seo?.canonicalUrl || canonical, languages },
            openGraph: {
                type: 'article',
                url: seo?.canonicalUrl || canonical,
                title,
                description,
                locale: locale === 'en' ? 'en_US' : locale,
            },
        };
    } catch {
        return { title: 'Post Not Found | HyzenPro' };
    }
}

export default async function LocaleBlogPostPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    return <BlogPostPageContent slug={slug} />;
}
