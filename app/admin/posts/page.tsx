import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Edit, ExternalLink, Plus, Search, Clock, Eye, FileText, Copy, Globe, Archive, Trash2, BookOpen } from 'lucide-react';
import DeletePostButton from '@/components/admin/DeletePostButton';
import { formatDateShort } from '@/lib/utils';
import { isAdminSession } from '@/lib/admin';
import { DEDICATED_BLOG_ENTRIES } from '@/lib/dedicated-blog-registry';
import AdminPostsListClient from '@/components/admin/AdminPostsListClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Manage Blog Posts - Admin',
};

interface PostRow {
    id: string;
    title: string;
    slug: string;
    author: string;
    authorModel: { name: string | null } | null;
    status: string;
    categories: string[];
    tags: string[];
    views: number;
    readingTime: number | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    scheduledAt: Date | string | null;
    featuredImage: string | null;
    isDedicated?: boolean;
}

async function getPosts(status?: string, search?: string): Promise<PostRow[]> {
    try {
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        } else {
            where.status = { not: 'trash' };
        }

        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const prismaPosts = await prisma.post.findMany({
            where,
            include: {
                authorModel: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const prismaSlugs = new Set(prismaPosts.map((p) => p.slug));

        const dedicatedEntries: PostRow[] = status === 'trash'
            ? []
            : DEDICATED_BLOG_ENTRIES
                .filter((e) => !prismaSlugs.has(e.slug))
                .filter((e) => {
                    if (search) return e.title.toLowerCase().includes(search.toLowerCase());
                    return true;
                })
                .filter((e) => {
                    if (status && status !== 'all' && status !== 'published') return false;
                    return true;
                })
                .map((entry) => ({
                    id: `dedicated-${entry.slug}`,
                    title: entry.title,
                    slug: entry.slug,
                    author: entry.author,
                    authorModel: null,
                    status: 'published',
                    categories: entry.categories,
                    tags: entry.tags,
                    views: 0,
                    readingTime: null,
                    publishedAt: entry.publishedAt,
                    createdAt: entry.publishedAt,
                    scheduledAt: null,
                    featuredImage: entry.featuredImage || null,
                    isDedicated: true,
                }));

        return [...prismaPosts, ...dedicatedEntries] as PostRow[];
    } catch (error) {
        console.error('[Admin] Failed to fetch posts:', error);
        return [];
    }
}

async function getPostCounts() {
    try {
        const dedicatedNotInPrisma = (await prisma.post.findMany({
            where: { slug: { in: DEDICATED_BLOG_ENTRIES.map(e => e.slug) } },
            select: { slug: true },
        })).map(p => p.slug);

        const dedicatedExtra = DEDICATED_BLOG_ENTRIES.filter(e => !dedicatedNotInPrisma.includes(e.slug)).length;

        const [all, published, draft, scheduled, trash] = await Promise.all([
            prisma.post.count({ where: { status: { not: 'trash' } } }),
            prisma.post.count({ where: { status: 'published' } }),
            prisma.post.count({ where: { status: 'draft' } }),
            prisma.post.count({ where: { status: 'scheduled' } }),
            prisma.post.count({ where: { status: 'trash' } }),
        ]);
        return { all: all + dedicatedExtra, published: published + dedicatedExtra, draft, scheduled, trash };
    } catch (error) {
        console.error('[Admin] Failed to fetch post counts:', error);
        return { all: 0, published: 0, draft: 0, scheduled: 0, trash: 0 };
    }
}

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string }>;
}) {
    const session = await auth();
    if (!isAdminSession(session)) redirect('/admin');

    const params = await searchParams;
    const currentStatus = params.status || 'all';
    const searchQuery = params.search || '';

    const [posts, counts] = await Promise.all([
        getPosts(currentStatus, searchQuery),
        getPostCounts(),
    ]);

    const statusTabs = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'published', label: 'Published', count: counts.published },
        { key: 'draft', label: 'Drafts', count: counts.draft },
        { key: 'scheduled', label: 'Scheduled', count: counts.scheduled },
        { key: 'trash', label: 'Trash', count: counts.trash },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-heading text-4xl text-white mb-2">Blog Posts</h1>
                    <p className="text-white/40">Manage articles, reviews, and tutorials ({counts.all} total)</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent/80 transition-all"
                >
                    <Plus className="w-4 h-4" /> Write Post
                </Link>
            </div>

            <div className="flex items-center gap-1 mb-4 border-b border-white/[0.06] pb-3">
                {statusTabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`/admin/posts?status=${tab.key}${searchQuery ? `&search=${searchQuery}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentStatus === tab.key
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-1.5 text-[11px] opacity-60">({tab.count})</span>
                    </Link>
                ))}
            </div>

            <form className="mb-6">
                <input type="hidden" name="status" value={currentStatus} />
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Search posts by title..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none"
                    />
                </div>
            </form>

            <AdminPostsListClient
                posts={JSON.stringify(posts)}
                currentStatus={currentStatus}
                searchQuery={searchQuery}
            />
        </div>
    );
}
