import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hyzenpro.com';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${siteUrl}/ai-tools-directory/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${siteUrl}/blog/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/about-us/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/contact/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/submit-ai-tool/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/privacy-policy/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/terms-of-service/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/how-we-test/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
        { url: `${siteUrl}/advertise/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ];

    // Dynamic: All published tools
    let toolPages: MetadataRoute.Sitemap = [];
    try {
        const tools = await prisma.tool.findMany({
            where: { status: 'published' },
            select: { slug: true, primaryCategory: true, updatedAt: true },
        });
        toolPages = tools.map((tool: any) => ({
            url: `${siteUrl}/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}/`,
            lastModified: tool.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (e) {
        // DB not available yet — return static pages only
    }

    // Dynamic: All categories
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            select: { slug: true, updatedAt: true },
        });
        categoryPages = categories.map((cat: any) => ({
            url: `${siteUrl}/ai-tools-directory/${cat.slug}/`,
            lastModified: cat.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) { }

    // Dynamic: All published blog posts (at root level)
    let postPages: MetadataRoute.Sitemap = [];
    try {
        const posts = await prisma.post.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true },
        });
        postPages = posts.map((post: any) => ({
            url: `${siteUrl}/${post.slug}/`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) { }

    // Dynamic: Blog categories
    const blogCategoryPages: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/category/reviews/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${siteUrl}/category/tutorials/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${siteUrl}/category/comparisons/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ];

    return [
        ...staticPages,
        ...toolPages,
        ...categoryPages,
        ...postPages,
        ...blogCategoryPages,
    ];
}
